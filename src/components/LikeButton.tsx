import { useState } from "react";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorId, hasLiked, markLiked } from "@/lib/likes";

type MaybeProject = { id: string; likes_count: number };

function bumpLikes(data: unknown, projectId: string, delta: number): unknown {
  if (!data) return data;
  if (Array.isArray(data)) {
    return (data as MaybeProject[]).map((p) =>
      p && p.id === projectId ? { ...p, likes_count: p.likes_count + delta } : p,
    );
  }
  const one = data as MaybeProject;
  if (typeof one === "object" && one.id === projectId && typeof one.likes_count === "number") {
    return { ...one, likes_count: one.likes_count + delta };
  }
  return data;
}

export function LikeButton({
  projectId,
  count,
  size = "md",
}: {
  projectId: string;
  count: number;
  size?: "sm" | "md";
}) {
  const qc = useQueryClient();
  const [liked, setLiked] = useState(() => hasLiked(projectId));

  const patchCaches = (delta: number) => {
    qc.setQueriesData({ queryKey: ["projects"] }, (data: unknown) =>
      bumpLikes(data, projectId, delta),
    );
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const visitor_id = getVisitorId();
      const { error } = await supabase
        .from("project_likes")
        .insert({ project_id: projectId, visitor_id });
      if (error && error.code !== "23505") throw error;
    },
    onMutate: () => {
      setLiked(true);
      patchCaches(1);
    },
    onSuccess: () => {
      markLiked(projectId);
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Thanks for the like!");
    },
    onError: () => {
      setLiked(false);
      patchCaches(-1);
      toast.error("Couldn't save your like. Please try again.");
    },
  });

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked || mutation.isPending) return;
    mutation.mutate();
  };

  const px = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  const isDisabled = liked || mutation.isPending;

  return (
    <button
      onClick={handle}
      disabled={isDisabled}
      aria-busy={mutation.isPending}
      aria-label="Like project"
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 transition-colors ${px} ${
        liked
          ? "bg-red-50 text-red-600 ring-red-200"
          : "bg-white text-foreground ring-border hover:bg-red-50 hover:text-red-600 hover:ring-red-200"
      } ${isDisabled ? "cursor-not-allowed" : ""} ${mutation.isPending ? "opacity-70" : ""}`}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      <span className="font-medium tabular-nums">{count}</span>
    </button>
  );
}
