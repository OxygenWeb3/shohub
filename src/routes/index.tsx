import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SearchX } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  PAGE_SIZE,
  newestProjectsQueryOptions,
  projectCountQueryOptions,
  projectsQueryOptions,
  type Category,
  type Sort,
} from "@/lib/queries";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Shelby Showcase — Community Projects" },
      {
        name: "description",
        content: "Explore projects built by the Shelby community with media powered by decentralized hot storage.",
      },
      { property: "og:title", content: "Shelby Showcase — Community Projects" },
      {
        property: "og:description",
        content: "Explore projects built by the Shelby community with media powered by decentralized hot storage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);

  const params = useMemo(() => ({ search, category, sort, page }), [search, category, sort, page]);

  const { data, isLoading } = useQuery(projectsQueryOptions(params));
  const projects = data?.items ?? [];
  const matched = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(matched / PAGE_SIZE));
  const { data: newest = [] } = useQuery(newestProjectsQueryOptions());
  const { data: total = 0 } = useQuery(projectCountQueryOptions());

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const updateCategory = (value: Category | "All") => {
    setCategory(value);
    setPage(1);
  };
  const updateSort = (value: Sort) => {
    setSort(value);
    setPage(1);
  };

  const resetBrowse = () => {
    setSearch("");
    setCategory("All");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <section className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Projects built on <span className="text-primary">Shelby</span>.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A showcase of what the Shelby community is building — with media powered by
            decentralized hot storage.
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {total} {total === 1 ? "project" : "projects"} and counting.
          </p>
        </section>

        {newest.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Newest projects
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {newest.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-6 flex flex-col gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                placeholder="Search projects, builders, or ideas…"
                className="w-full rounded-full border border-border bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(["All", ...CATEGORIES] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => updateCategory(c as Category | "All")}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors ${
                      category === c
                        ? "bg-primary text-primary-foreground ring-primary"
                        : "bg-white text-foreground ring-border hover:bg-blue-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <select
                value={sort}
                onChange={(e) => updateSort(e.target.value as Sort)}
                className="rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="newest">Newest</option>
                <option value="most_liked">Most liked</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
          ) : projects.length === 0 ? (
            search.trim() !== "" || category !== "All" ? (
              <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
                <p className="text-base font-medium">No matching projects</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search.trim() !== "" ? (
                    <>
                      Nothing matches “{search.trim()}”
                      {category !== "All" ? ` in ${category}` : ""}.
                    </>
                  ) : (
                    <>No projects in {category} yet.</>
                  )}{" "}
                  Try a different search or filter.
                </p>
                <button
                  onClick={() => {
                    updateSearch("");
                    updateCategory("All");
                  }}

                  className="mt-4 inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
                <p className="text-base font-medium">No projects yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Be the first to share what you're building.
                </p>
              </div>
            )

          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>

              {pageCount > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-10 flex flex-wrap items-center justify-center gap-2"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      aria-current={n === page ? "page" : undefined}
                      className={`min-w-9 rounded-full px-3 py-2 text-sm font-medium ring-1 transition-colors ${
                        n === page
                          ? "bg-primary text-primary-foreground ring-primary"
                          : "bg-white text-foreground ring-border hover:bg-blue-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={page === pageCount}
                    className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              )}

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + projects.length} of{" "}
                {matched} {matched === 1 ? "project" : "projects"}
              </p>
            </>
          )}

        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        Media served via Shelby — decentralized hot storage.
      </footer>
    </div>
  );
}
