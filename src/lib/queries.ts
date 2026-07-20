import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CATEGORIES = ["AI", "DePIN", "Gaming", "Infrastructure", "Storage", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Project = {
  id: string;
  created_at: string;
  name: string;
  builder_name: string;
  description: string;
  category: Category;
  github_url: string | null;
  demo_url: string | null;
  cover_path: string;
  media_path: string | null;
  media_kind: "video" | "pdf" | null;
  likes_count: number;
};

export type Sort = "newest" | "most_liked";

export const projectsQueryOptions = (params: {
  search: string;
  category: Category | "All";
  sort: Sort;
}) =>
  queryOptions({
    queryKey: ["projects", params],
    queryFn: async (): Promise<Project[]> => {
      let q = supabase.from("projects").select("*");
      if (params.category !== "All") q = q.eq("category", params.category);
      if (params.search.trim()) {
        const s = `%${params.search.trim()}%`;
        q = q.or(`name.ilike.${s},builder_name.ilike.${s},description.ilike.${s}`);
      }
      q =
        params.sort === "most_liked"
          ? q.order("likes_count", { ascending: false }).order("created_at", { ascending: false })
          : q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

export const newestProjectsQueryOptions = () =>
  queryOptions({
    queryKey: ["projects", "newest"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

export const projectCountQueryOptions = () =>
  queryOptions({
    queryKey: ["projects", "count"],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

export const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["projects", id],
    queryFn: async (): Promise<Project> => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Not found");
      return data as Project;
    },
  });
