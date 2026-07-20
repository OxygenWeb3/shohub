
# Shelby Showcase — Build Plan

A lightweight "Product Hunt for Shelby builders" with project submission, browsing, likes, and media hosting. Minimal white UI with blue accents, rounded cards, generous whitespace.

## A note on the stack

Your brief mentions Next.js, but this Lovable project runs on **TanStack Start + React + Tailwind CSS + Lovable Cloud (Supabase)** — same capabilities (SSR, server functions, file-based routing, Postgres, storage), just Lovable's default stack. I'll build it here unless you'd rather I stop.

## A note on Shelby storage

Shelby is a decentralized hot storage network; it's not currently a Lovable connector, and integrating a real Shelby SDK/gateway isn't in scope for a few-days MVP. Plan:
- Store uploads in **Lovable Cloud Storage** behind a thin `storage` module (`uploadAsset`, `getAssetUrl`) so a real Shelby driver can be swapped in later without touching UI code.
- Show the "Your project assets are stored on Shelby" message on upload and the "⚡ Served via Shelby" badge on media load, per the brief.
- If you later provide a Shelby endpoint/API key, we replace the driver internals — no schema or UI changes needed.

## Pages / routes

- `/` — Home: search bar, category filters, sort dropdown (Newest / Most Liked), total project count, "Newest Projects" strip, responsive grid of project cards.
- `/submit` — Submit form (all fields listed in the brief), cover image upload + optional video/PDF, success toast + storage message.
- `/project/$id` — Details: large cover, description, builder, category chip, like button, GitHub + Demo buttons, embedded media viewer (image / `<video>` / PDF `<iframe>`), Shelby badge.
- 404 already handled by root.

Header: "Shelby Showcase" wordmark left, "Submit Project" CTA right. No auth, no profiles.

## Data model (Lovable Cloud / Postgres)

`projects`
- `id uuid pk`, `created_at timestamptz`
- `name text`, `builder_name text`, `description text` (≤120 char, validated client + check constraint)
- `category text` (enum-checked: AI, DePIN, Gaming, Infrastructure, Storage, Other)
- `github_url text`, `demo_url text`
- `cover_path text` (storage key), `media_path text null`, `media_kind text null` ('video' | 'pdf')
- `likes_count int default 0`

`project_likes`
- `id uuid pk`, `project_id uuid fk`, `visitor_id text`, `created_at`
- Unique(`project_id`, `visitor_id`) to prevent double-likes from the same browser (visitor_id = random uuid stored in `localStorage`).
- Trigger keeps `projects.likes_count` in sync.

RLS: public SELECT on `projects`; public INSERT on `projects` and `project_likes` (no auth per brief). Likes increment via a SECURITY DEFINER RPC that inserts + returns new count.

Storage buckets: `covers` (public), `media` (public). Uploads go through a small helper that returns `{ path }`; public URL fetched via `getPublicUrl`.

## Components

- `ProjectCard` — rounded-2xl card, cover image, name, 120-char desc, builder, category chip, heart + count.
- `ProjectGrid` — responsive 1/2/3 columns.
- `SearchAndFilters` — text search (name/builder/description), category pills, sort select.
- `LikeButton` — optimistic increment, calls RPC, disables if already liked (localStorage guard).
- `ShelbyBadge` — small "⚡ Served via Shelby" chip; overlaid on media once loaded (`onLoad` / `onLoadedData`).
- `MediaViewer` — chooses `<img>` / `<video controls>` / PDF `<iframe>` from `media_kind`.
- `SubmitForm` — react-hook-form + zod, char counter on description, file inputs with type/size checks, "Your project assets are stored on Shelby" message after successful upload.

## Data fetching

TanStack Query is already wired. Loaders `ensureQueryData` + components `useSuspenseQuery`.
- `projectsQuery({ search, category, sort })` — filters/sort server-side via Supabase query.
- `projectQuery(id)` — single project.
- Mutations: `submitProject`, `likeProject` — invalidate list + detail queries.

## Design system

- Background `#ffffff`, foreground near-black, primary blue accent (~oklch equivalent of `#2563eb`), border and muted stay light gray.
- Update `--primary` and `--ring` in `src/styles.css` to blue; keep the rest of the palette.
- Typography: Inter (or system-ui stack) via `<link>` in `__root.tsx` head — modern, readable.
- Cards `rounded-2xl`, shadow-sm, hover: shadow-md + slight translate-y. No other animations.
- Category chip colors: subtle blue-tinted backgrounds.

## SEO / metadata

- Update `__root.tsx` head: title "Shelby Showcase — Projects built on Shelby", matching description, og:title/description, twitter:card. No root og:image.
- `/submit` and `/project/$id` get their own `head()` (dynamic title from loader on detail page).

## Extras (included, per brief)

- Total project count shown above the grid.
- "Newest Projects" section (top 3 by created_at) above the main grid.
- Sort by Newest / Most Liked via the query key.

## Technical details

- Migration creates the two tables, check constraints, RLS policies, `increment_like` RPC, and a trigger updating `likes_count`.
- Storage buckets created via the storage tool (public), with policies allowing anonymous read + insert.
- `src/lib/storage.ts` — thin driver interface (`uploadAsset(bucket, file) → { path }`, `getAssetUrl(bucket, path) → url`). Current impl uses Supabase Storage; Shelby driver can slot in later.
- `src/lib/likes.ts` — visitor id + like RPC.
- Home is `src/routes/index.tsx` (replaces the placeholder). Other routes as above.
- No auth, no user accounts, no dark mode.

## Out of scope

Comments, profiles, auth, admin moderation, real Shelby SDK wiring, edit/delete of submissions.

Confirm and I'll build it.
