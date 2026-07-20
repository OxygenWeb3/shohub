import { useEffect, useState } from "react";
import { getAssetUrl, type Bucket } from "@/lib/storage";
import { ShelbyBadge } from "./ShelbyBadge";

export function AssetImage({
  bucket,
  path,
  alt,
  className,
  showBadge = false,
}: {
  bucket: Bucket;
  path: string;
  alt: string;
  className?: string;
  showBadge?: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    getAssetUrl(bucket, path)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [bucket, path]);

  return (
    <div className={`relative overflow-hidden bg-blue-50/40 ${className ?? ""}`}>
      {url && (
        <img
          src={url}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {showBadge && loaded && (
        <div className="absolute bottom-3 left-3">
          <ShelbyBadge />
        </div>
      )}
    </div>
  );
}
