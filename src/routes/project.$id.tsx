import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Copy, Github, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { AssetImage } from "@/components/AssetImage";
import { CategoryChip } from "@/components/CategoryChip";
import { LikeButton } from "@/components/LikeButton";
import { MediaViewer } from "@/components/MediaViewer";
import { ShelbyBadge } from "@/components/ShelbyBadge";
import { Button } from "@/components/ui/button";
import { projectQueryOptions } from "@/lib/queries";
import { extractProjectId, projectSlug, titleFromSlug } from "@/lib/slug";

export const Route = createFileRoute("/project/$id")({
  component: ProjectDetails,
  head: ({ params }) => {
    const name = titleFromSlug(params.id);
    const title = name ? `${name} — Shelby Showcase` : "Project — Shelby Showcase";
    const description = name
      ? `${name} — a builder project served via Shelby decentralized hot storage.`
      : "A builder project served via Shelby decentralized hot storage.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function ProjectDetails() {
  const { id: param } = Route.useParams();
  const id = extractProjectId(param);
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useQuery(projectQueryOptions(id));

  // Normalize the URL to the canonical, shareable slug form.
  useEffect(() => {
    if (!project) return;
    const canonical = projectSlug(project);
    if (canonical !== param) {
      navigate({ to: "/project/$id", params: { id: canonical }, replace: true });
    }
  }, [project, param, navigate]);

  const handleCoverError = useCallback(() => {
    toast.error("Cover image failed to load from Shelby.");
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Project link copied.");
    } catch {
      toast.error("Couldn’t copy the project link.");
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="py-24 text-center text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (error || !project) throw notFound();


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>

        <AssetImage
          bucket="covers"
          path={project.cover_path}
          alt={project.name}
          className="aspect-[16/9] w-full rounded-3xl"
          showBadge
          onLoadError={handleCoverError}
        />

        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CategoryChip category={project.category} />
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{project.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              by <span className="font-medium text-foreground">{project.builder_name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleCopyLink}>
              <Copy aria-hidden="true" /> Copy link
            </Button>
            <LikeButton projectId={project.id} count={project.likes_count} />
          </div>
        </div>

        <p className="mt-6 text-lg leading-relaxed text-foreground">{project.description}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" /> Live demo
            </a>
          )}
        </div>

        {project.media_path && project.media_kind && (
          <section className="mt-12">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Media
              </h2>
              <ShelbyBadge />
            </div>
            <MediaViewer path={project.media_path} kind={project.media_kind} />
          </section>
        )}
      </main>
    </div>
  );
}
