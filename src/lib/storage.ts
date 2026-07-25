// Storage driver abstraction. Today it wraps Lovable Cloud storage;
// tomorrow a Shelby driver can slot in without changing UI code.
import { supabase } from "@/integrations/supabase/client";

export type Bucket = "covers" | "media";

export type UploadProgress = {
  loaded: number;
  total: number;
  /** 0-1 fraction; total may be 0 when unknown, in which case percent is 0. */
  percent: number;
};

function extForFile(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 6) return fromName.toLowerCase();
  const fromType = file.type.split("/").pop() ?? "bin";
  return fromType;
}

function putWithProgress(
  url: string,
  file: File,
  onProgress?: (p: UploadProgress) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    if (file.type) xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (evt) => {
      if (!onProgress) return;
      const total = evt.lengthComputable ? evt.total : file.size;
      const loaded = evt.loaded;
      const percent = total > 0 ? Math.min(1, loaded / total) : 0;
      onProgress({ loaded, total, percent });
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload aborted"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.({ loaded: file.size, total: file.size, percent: 1 });
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    };
    xhr.send(file);
  });
}

export async function uploadAsset(
  bucket: Bucket,
  file: File,
  onProgress?: (p: UploadProgress) => void,
): Promise<{ path: string }> {
  const ext = extForFile(file);
  const path = `${crypto.randomUUID()}.${ext}`;

  // Use a signed upload URL so we can PUT via XHR and observe progress events.
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);
  if (error || !data) throw error ?? new Error("Could not create upload URL");

  onProgress?.({ loaded: 0, total: file.size, percent: 0 });
  await putWithProgress(data.signedUrl, file, onProgress);
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
