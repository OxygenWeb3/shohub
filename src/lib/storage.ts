// Storage driver abstraction. Today it wraps Lovable Cloud storage;
// tomorrow a Shelby driver can slot in without changing UI code.
import { supabase } from "@/integrations/supabase/client";

export type Bucket = "covers" | "media";

function extForFile(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 6) return fromName.toLowerCase();
  const fromType = file.type.split("/").pop() ?? "bin";
  return fromType;
}

export async function uploadAsset(bucket: Bucket, file: File): Promise<{ path: string }> {
  const ext = extForFile(file);
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return { path };
}

const urlCache = new Map<string, { url: string; expires: number }>();

export async function getAssetUrl(bucket: Bucket, path: string): Promise<string> {
  const key = `${bucket}/${path}`;
  const now = Date.now();
  const cached = urlCache.get(key);
  if (cached && cached.expires > now + 60_000) return cached.url;

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  if (error || !data) throw error ?? new Error("Could not sign URL");
  urlCache.set(key, { url: data.signedUrl, expires: now + 60 * 60 * 1000 });
  return data.signedUrl;
}
