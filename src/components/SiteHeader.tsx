import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { projectCountQueryOptions } from "@/lib/queries";

export function SiteHeader() {
  const { data: total } = useQuery(projectCountQueryOptions());

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span aria-hidden>⚡</span>
          </span>
          <span className="text-base font-semibold tracking-tight">Shelby Showcase</span>
          {typeof total === "number" && (
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {total} {total === 1 ? "project" : "projects"}
            </span>
          )}
        </Link>

        <Link
          to="/submit"
          className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Submit project
        </Link>
      </div>
    </header>
  );
}
