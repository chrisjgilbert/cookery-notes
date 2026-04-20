export interface Ingredient {
  quantity: string | null;
  unit: string | null;
  name: string;
  notes: string | null;
}

export interface InstructionStep {
  step: number;
  text: string;
}

export interface Recipe {
  id: string;
  title: string;
  source_url: string | null;
  source_site: string | null;
  description: string | null;
  image_url: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  total_time_minutes: number | null;
  servings: number | null;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  tags: string[];
  cuisine: string | null;
  course: string | null;
  difficulty: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeSummary {
  id: string;
  title: string;
  image_url: string | null;
  total_time_minutes: number | null;
  servings: number | null;
  tags: string[];
  cuisine: string | null;
  course: string | null;
  created_at: string;
}

export interface RecipeListResponse {
  items: RecipeSummary[];
  total: number;
  limit: number;
  offset: number;
}

export type SortKey = "created_at" | "title" | "total_time_minutes";
export type SortOrder = "asc" | "desc";

export interface RecipeListParams {
  q?: string;
  tag?: string[];
  cuisine?: string;
  course?: string;
  sort?: SortKey;
  order?: SortOrder;
  limit?: number;
  offset?: number;
}

export type RecipeInput = Omit<Recipe, "id" | "created_at" | "updated_at">;
