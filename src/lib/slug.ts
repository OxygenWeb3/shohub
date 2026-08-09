const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** Shareable URL segment: "my-project-name-<uuid>" */
export function projectSlug(project: { id: string; name: string }): string {
  const s = slugify(project.name);
  return s ? `${s}-${project.id}` : project.id;
}

/** Accepts a bare id or a "name-<uuid>" slug and returns the id. */
export function extractProjectId(param: string): string {
  const match = param.match(UUID_RE);
  return match ? match[0] : param;
}

/** Human-readable title guess from the slug part, for metadata before data loads. */
export function titleFromSlug(param: string): string | null {
  const withoutId = param.replace(UUID_RE, "").replace(/-+$/g, "");
  if (!withoutId) return null;
  return withoutId
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
