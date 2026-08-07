import { useEffect, useState, type MouseEvent } from "react";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorId, hasLiked, markLiked } from "@/lib/likes";
import { Button } from "@/components/ui/button";

type MaybeProject = { id: string; likes_count: number };
type CacheSnapshot = Array<[QueryKey, unknown]>;

type LikeMutationContext = {
  previous: CacheSnapshot;
};

function bumpLikes(data: unknown, projectId: string, delta: number): unknown {
  if (!data) return data;
  if (Array.isArray(data)) {
    return (data as MaybeProject[]).map((p) =>
      p && p.id === projectId
        ? { ...p, likes_count: Math.max(0, p.likes_count + delta) }
        : p,
    );
  }
  const one = data as MaybeProject;
  if (typeof one === "object" && one.id === projectId && typeof one.likes_count === "number") {
    return { ...one, likes_count: Math.max(0, one.likes_count + delta) };
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
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(hasLiked(projectId));
  }, [projectId]);

  const patchCaches = (delta: number) => {
    qc.setQueriesData({ queryKey: ["projects"] }, (data: unknown) =>
      bumpLikes(data, projectId, delta),
    );
  };

  const mutation = useMutation<boolean, Error, void, LikeMutationContext>({
    mutationFn: async () => {
      const visitor_id = getVisitorId();
      const { error } = await supabase
        .from("project_likes")
        .insert({ project_id: projectId, visitor_id });
      if (error && error.code !== "23505") throw error;
      return !error;
    },
    onMutate: () => {
      const previous = qc.getQueriesData({ queryKey: ["projects"] });
      setLiked(true);
      patchCaches(1);
      return { previous };
    },
    onSuccess: (inserted, _variables, context) => {
      markLiked(projectId);
      if (!inserted) {
        context?.previous.forEach(([queryKey, data]) => qc.setQueryData(queryKey, data));
        toast.success("You already liked this project.");
      } else {
        toast.success("Thanks for the like!");
      }
      void qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([queryKey, data]) => qc.setQueryData(queryKey, data));
      setLiked(false);
      toast.error("Couldn't save your like. Please try again.");
    },
  });

  const handle = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked || mutation.isPending) return;
    mutation.mutate();
  };

  const isPending = mutation.isPending;
  const isDisabled = liked || isPending;
  const label = isPending ? "Saving…" : liked ? "Liked" : "Like";
  const px = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handle}
      disabled={isDisabled}
      aria-busy={isPending}
      aria-pressed={liked}
      aria-label={`${label} project`}
      className={`rounded-full ring-1 transition-colors ${px} ${
        liked
          ? "border-red-200 bg-red-50 text-red-600 ring-red-200 hover:bg-red-50 hover:text-red-600"
          : "border-border bg-white text-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      } ${isPending ? "opacity-70" : ""}`}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      <span className="font-medium">{label}</span>
      <span className="font-medium tabular-nums">{count}</span>
    </Button>
  );
}
