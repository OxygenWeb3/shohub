import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { ShelbyBadge } from "@/components/ShelbyBadge";
import { supabase } from "@/integrations/supabase/client";
import { uploadAsset } from "@/lib/storage";
import { CATEGORIES, type Category } from "@/lib/queries";

const COVER_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !COVER_TYPES.includes(file.type)) {
      toast.error("Unsupported cover format. Use JPG, PNG, WEBP, or GIF.");
      e.target.value = "";
      setCover(null);
      return;
    }
    setCover(file);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("video/") && file.type !== "application/pdf") {
      toast.error("Unsupported demo file. Upload a video or PDF.");
      e.target.value = "";
      setMedia(null);
      return;
    }
    setMedia(file);
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
    if (media && !media.type.startsWith("video/") && media.type !== "application/pdf") {
      toast.error("Unsupported demo file. Upload a video or PDF.");
      return;
    }
    if (desc.length > 120) {
      toast.error("Description must be 120 characters or fewer.");
      return;
    }
    setSubmitting(true);
    try {
      let cover_path: string;
      try {
        ({ path: cover_path } = await uploadAsset("covers", cover));
      } catch (err) {
        console.error(err);
        toast.error("Cover image failed to upload to Shelby. Please try again.");
        setSubmitting(false);
        return;
      }
      toast.success("Cover image uploaded to Shelby.");
      let media_path: string | null = null;
      let media_kind: "video" | "pdf" | null = null;
      if (media) {
        const kind: "video" | "pdf" = media.type.startsWith("video/") ? "video" : "pdf";
        try {
          const up = await uploadAsset("media", media);
          media_path = up.path;
          media_kind = kind;
        } catch (err) {
          console.error(err);
          toast.error(
            `${kind === "video" ? "Demo video" : "PDF"} failed to upload to Shelby. Please try again.`,
          );
          setSubmitting(false);
          return;
        }
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
          <Field label="Cover image" required>
            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
              className={fileInput}
            />
          </Field>
          <Field label="Demo video or PDF (optional)">
            <input
              type="file"
              accept="video/*,application/pdf"
              onChange={(e) => setMedia(e.target.files?.[0] ?? null)}
              className={fileInput}
            />
          </Field>

          {(cover || media) && (
            <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <ShelbyBadge />
              <span>Your project assets are stored on Shelby.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Publish project"}
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
