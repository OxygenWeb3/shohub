import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { ShelbyBadge } from "@/components/ShelbyBadge";
import { supabase } from "@/integrations/supabase/client";
import { uploadAsset } from "@/lib/storage";
import { CATEGORIES, type Category } from "@/lib/queries";

const COVER_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MB = 1024 * 1024;
const COVER_MAX_BYTES = 8 * MB;
const MEDIA_MAX_BYTES = 100 * MB;
const formatMB = (bytes: number) => `${Math.round(bytes / MB)} MB`;

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a project — Shelby Showcase" },
      { name: "description", content: "Share your Shelby-powered project with the community." },
    ],
  }),
  component: Submit,
});

function Submit() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [builder, setBuilder] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<Category>("AI");
  const [github, setGithub] = useState("");
  const [demo, setDemo] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [media, setMedia] = useState<File | null>(null);
  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [mediaProgress, setMediaProgress] = useState<number | null>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !COVER_TYPES.includes(file.type)) {
      toast.error("Unsupported cover format. Use JPG, PNG, WEBP, or GIF.");
      e.target.value = "";
      setCover(null);
      return;
    }
    if (file && file.size > COVER_MAX_BYTES) {
      toast.error(`Cover image is too large. Max size is ${formatMB(COVER_MAX_BYTES)}.`);
      e.target.value = "";
      setCover(null);
      return;
    }
    setCover(file);
    setCoverProgress(null);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("video/") && file.type !== "application/pdf") {
      toast.error("Unsupported demo file. Upload a video or PDF.");
      e.target.value = "";
      setMedia(null);
      return;
    }
    if (file && file.size > MEDIA_MAX_BYTES) {
      toast.error(`Demo file is too large. Max size is ${formatMB(MEDIA_MAX_BYTES)}.`);
      e.target.value = "";
      setMedia(null);
      return;
    }
    setMedia(file);
    setMediaProgress(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cover) {
      toast.error("Please upload a cover image.");
      return;
    }
    if (!COVER_TYPES.includes(cover.type)) {
      toast.error("Unsupported cover format. Use JPG, PNG, WEBP, or GIF.");
      return;
    }
    if (cover.size > COVER_MAX_BYTES) {
      toast.error(`Cover image is too large. Max size is ${formatMB(COVER_MAX_BYTES)}.`);
      return;
    }
    if (media && !media.type.startsWith("video/") && media.type !== "application/pdf") {
      toast.error("Unsupported demo file. Upload a video or PDF.");
      return;
    }
    if (media && media.size > MEDIA_MAX_BYTES) {
      toast.error(`Demo file is too large. Max size is ${formatMB(MEDIA_MAX_BYTES)}.`);
      return;
    }
    if (desc.length > 120) {
      toast.error("Description must be 120 characters or fewer.");
      return;
    }
    setSubmitting(true);
    setCoverProgress(0);
    setMediaProgress(media ? 0 : null);
    try {
      let cover_path: string;
      try {
        ({ path: cover_path } = await uploadAsset("covers", cover, (p) =>
          setCoverProgress(p.percent),
        ));
      } catch (err) {
        console.error(err);
        toast.error("Cover image failed to upload to Shelby.", {
          description: "Your details are saved — press Publish project to try again.",
        });
        setSubmitting(false);
        setCoverProgress(null);
        setMediaProgress(null);
        return;
      }
      setCoverProgress(1);
      toast.success("Cover image uploaded to Shelby.");
      let media_path: string | null = null;
      let media_kind: "video" | "pdf" | null = null;
      if (media) {
        const kind: "video" | "pdf" = media.type.startsWith("video/") ? "video" : "pdf";
        try {
          const up = await uploadAsset("media", media, (p) => setMediaProgress(p.percent));
          media_path = up.path;
          media_kind = kind;
        } catch (err) {
          console.error(err);
          toast.error(
            `${kind === "video" ? "Demo video" : "PDF"} failed to upload to Shelby.`,
            {
              description:
                "Your details are saved — press Publish project to retry, or choose a different file.",
            },
          );
          setSubmitting(false);
          setMediaProgress(null);
          return;
        }
        setMediaProgress(1);
        toast.success(
          `${media_kind === "video" ? "Demo video" : "PDF"} uploaded to Shelby.`,
        );
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: name.trim(),
          builder_name: builder.trim(),
          description: desc.trim(),
          category,
          github_url: github.trim() || null,
          demo_url: demo.trim() || null,
          cover_path,
          media_path,
          media_kind,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Your project assets are stored on Shelby.");
      toast.success("Project published successfully!");
      navigate({ to: "/project/$id", params: { id: data.id } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <h1 className="text-3xl font-bold tracking-tight">Submit your project</h1>
        <p className="mt-2 text-muted-foreground">
          Share what you're building. Your media is stored on Shelby.
        </p>

        <form onSubmit={submit} className="mt-10 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <Field label="Project name" required>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </Field>
          <Field label="Builder name" required>
            <input required value={builder} onChange={(e) => setBuilder(e.target.value)} className={input} />
          </Field>
          <Field label="Description" hint={`${desc.length}/120`} required>
            <textarea
              required
              maxLength={120}
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className={`${input} resize-none`}
            />
          </Field>
          <Field label="Category" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={input}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="GitHub URL">
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/…"
                className={input}
              />
            </Field>
            <Field label="Demo URL">
              <input
                type="url"
                value={demo}
                onChange={(e) => setDemo(e.target.value)}
                placeholder="https://…"
                className={input}
              />
            </Field>
          </div>
          <Field label="Cover image" hint={`Max ${formatMB(COVER_MAX_BYTES)}`} required>
            <input
              required
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleCoverChange}
              className={fileInput}
            />
            <UploadProgress label="Cover" progress={coverProgress} />
          </Field>
          <Field label="Demo video or PDF (optional)" hint={`Max ${formatMB(MEDIA_MAX_BYTES)}`}>
            <input
              type="file"
              accept="video/*,application/pdf"
              onChange={handleMediaChange}
              className={fileInput}
            />
            <UploadProgress label="Demo" progress={mediaProgress} />
          </Field>

          {coverProgress === 1 && (!media || mediaProgress === 1) && (
            <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <ShelbyBadge />
              <span>Your project assets are stored on Shelby.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !cover}
            aria-busy={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <span
                aria-hidden
                className="size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
              />
            )}
            {submitting ? submitLabel : "Publish project"}
          </button>
        </form>
      </main>
    </div>
  );
}

const input =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/30";
const fileInput =
  "w-full rounded-xl border border-dashed border-border bg-white px-3.5 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground";

function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium">
          {label}
          {required && <span className="ml-0.5 text-primary">*</span>}
        </span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function UploadProgress({ label, progress }: { label: string; progress: number | null }) {
  if (progress === null) return null;
  const pct = Math.round(progress * 100);
  const done = progress >= 1;
  return (
    <div className="mt-2" aria-live="polite">
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{done ? `${label} uploaded to Shelby` : `Uploading ${label.toLowerCase()}…`}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-1.5 w-full overflow-hidden rounded-full bg-blue-100"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
