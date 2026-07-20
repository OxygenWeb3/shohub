import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { AssetImage } from "@/components/AssetImage";
import { CategoryChip } from "@/components/CategoryChip";
import { LikeButton } from "@/components/LikeButton";
import { MediaViewer } from "@/components/MediaViewer";
import { ShelbyBadge } from "@/components/ShelbyBadge";
import { projectQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/project/$id")({
  component: ProjectDetails,
  head: ({ params }) => ({
    meta: [
      { title: `Project — Shelby Showcase` },
      { name: "description", content: `A project on Shelby Showcase (${params.id}).` },
    ],
  }),
});

function ProjectDetails() {
  const { id } = Route.useParams();
  const { data: project, isLoading, error } = useQuery(projectQueryOptions(id));

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
          <LikeButton projectId={project.id} count={project.likes_count} />
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
