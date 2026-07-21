import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAssetUrl } from "@/lib/storage";
import { ShelbyBadge } from "./ShelbyBadge";

export function MediaViewer({ path, kind }: { path: string; kind: "video" | "pdf" }) {
  const [url, setUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    getAssetUrl("media", path)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setFailed(true);
        toast.error(
          `${kind === "video" ? "Demo video" : "PDF"} failed to load from Shelby.`,
        );
      });
    return () => {
      cancelled = true;
    };
  }, [path, kind]);

  const handleMediaError = () => {
    setFailed(true);
    toast.error(
      `${kind === "video" ? "Demo video" : "PDF"} failed to load from Shelby.`,
    );
  };

  if (failed) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-blue-50/50 px-6 text-center text-sm text-muted-foreground">
        This {kind === "video" ? "video" : "PDF"} couldn't be loaded from Shelby.
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-blue-50/50 text-sm text-muted-foreground">
        Loading from Shelby…
      </div>
    );
  }

  return (
    <div className="relative">
      {kind === "video" ? (
        <video
          src={url}
          controls
          onLoadedData={() => setReady(true)}
          onError={handleMediaError}
          className="w-full rounded-2xl bg-black"
        />
      ) : (
        <iframe
          src={url}
          title="Project PDF"
          onLoad={() => setReady(true)}
          onError={handleMediaError}
          className="h-[70vh] w-full rounded-2xl border border-border bg-white"
        />
      )}
      {ready && (
        <div className="absolute bottom-3 right-3">
          <ShelbyBadge />
        </div>
      )}
    </div>
  );
}
