import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiFetch, buildQuery } from "@/lib/api";
import type {
  Recipe,
  RecipeInput,
  RecipeListParams,
  RecipeListResponse,
} from "@/lib/types";

const PAGE_SIZE = 24;

export function useRecipes(params: RecipeListParams) {
  return useInfiniteQuery({
    queryKey: ["recipes", params],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      apiFetch<RecipeListResponse>(
        `/api/v1/recipes${buildQuery({
          ...params,
          limit: params.limit ?? PAGE_SIZE,
          offset: pageParam,
        })}`,
      ),
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((sum, p) => sum + p.items.length, 0);
      return loaded < last.total ? loaded : undefined;
    },
  });
}

export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: () => apiFetch<Recipe>(`/api/v1/recipes/${id}`),
    enabled: Boolean(id),
  });
}

export function useImportRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) =>
      apiFetch<Recipe>("/api/v1/recipes/import", {
        method: "POST",
        body: JSON.stringify({ url }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RecipeInput) =>
      apiFetch<Recipe>("/api/v1/recipes", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useUpdateRecipe(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<RecipeInput>) =>
      apiFetch<Recipe>(`/api/v1/recipes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["recipes"] });
      qc.setQueryData(["recipe", id], data);
    },
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/recipes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (password: string) =>
      apiFetch<{ ok: boolean }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean }>("/api/v1/auth/logout", { method: "POST" }),
    onSuccess: () => qc.clear(),
  });
}
