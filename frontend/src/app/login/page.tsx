"use client";

import { ChefHat } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { useLogin } from "@/lib/queries";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync(password);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Incorrect password");
      } else {
        toast.error("Login failed");
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 text-lg font-semibold">
          <ChefHat className="h-6 w-6 text-brand-600" />
          Cookery Notes
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
        <button
          type="submit"
          disabled={!password || login.isPending}
          className="w-full rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {login.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
