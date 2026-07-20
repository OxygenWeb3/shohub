import { useState } from "react";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorId, hasLiked, markLiked } from "@/lib/likes";

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
  const [optimistic, setOptimistic] = useState(count);

  const mutation = useMutation({
    mutationFn: async () => {
      const visitor_id = getVisitorId();
      const { error } = await supabase
        .from("project_likes")
        .insert({ project_id: projectId, visitor_id });
      if (error && error.code !== "23505") throw error;
    },
    onSuccess: () => {
      markLiked(projectId);
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      setLiked(false);
      setOptimistic((c) => c - 1);
    },
  });

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked || mutation.isPending) return;
    setLiked(true);
    setOptimistic((c) => c + 1);
    mutation.mutate();
  };

  const px = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <button
      onClick={handle}
      disabled={liked}
      aria-label="Like project"
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 transition-colors ${px} ${
        liked
          ? "bg-red-50 text-red-600 ring-red-200"
          : "bg-white text-foreground ring-border hover:bg-red-50 hover:text-red-600 hover:ring-red-200"
      }`}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      <span className="font-medium tabular-nums">{optimistic}</span>
    </button>
  );
}
