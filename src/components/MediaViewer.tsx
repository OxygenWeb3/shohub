import { useEffect, useState } from "react";
import { getAssetUrl } from "@/lib/storage";
import { ShelbyBadge } from "./ShelbyBadge";

export function MediaViewer({ path, kind }: { path: string; kind: "video" | "pdf" }) {
  const [url, setUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAssetUrl("media", path).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

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
          className="w-full rounded-2xl bg-black"
        />
      ) : (
        <iframe
          src={url}
          title="Project PDF"
          onLoad={() => setReady(true)}
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
