import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) },
}));

import { ImportForm } from "./import-form";

function wrap(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("ImportForm", () => {
  it("posts the URL and navigates to the created recipe", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "rec_42", title: "T" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    wrap(<ImportForm />);

    await user.type(
      screen.getByLabelText("Recipe URL"),
      "https://example.com/recipe",
    );
    await user.click(screen.getByRole("button", { name: /import/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/recipes/rec_42"));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/v1\/recipes\/import$/);
    expect((init as RequestInit).method).toBe("POST");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      url: "https://example.com/recipe",
    });
  });

  it("shows an inline not-a-recipe message on 422", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "not a recipe" }), {
          status: 422,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const user = userEvent.setup();
    wrap(<ImportForm />);

    await user.type(
      screen.getByLabelText("Recipe URL"),
      "https://example.com/not-a-recipe",
    );
    await user.click(screen.getByRole("button", { name: /import/i }));

    await waitFor(() =>
      expect(screen.getByText(/doesn't look like a recipe page/i)).toBeInTheDocument(),
    );
    expect(toastError).not.toHaveBeenCalled();
  });

  it("toasts a generic error on 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "boom" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const user = userEvent.setup();
    wrap(<ImportForm />);

    await user.type(screen.getByLabelText("Recipe URL"), "https://example.com/x");
    await user.click(screen.getByRole("button", { name: /import/i }));

    await waitFor(() => expect(toastError).toHaveBeenCalled());
    expect(toastError.mock.calls[0][0]).toMatch(/boom/);
  });
});
