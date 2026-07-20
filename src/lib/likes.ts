const KEY = "shelby.visitor_id";
const LIKED_KEY = "shelby.liked_projects";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
}

export function getLikedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function markLiked(projectId: string) {
  const set = getLikedSet();
  set.add(projectId);
  localStorage.setItem(LIKED_KEY, JSON.stringify([...set]));
}

export function hasLiked(projectId: string): boolean {
  return getLikedSet().has(projectId);
}
