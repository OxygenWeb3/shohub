
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  builder_name text NOT NULL,
  description text NOT NULL CHECK (char_length(description) <= 120 AND char_length(description) > 0),
  category text NOT NULL CHECK (category IN ('AI','DePIN','Gaming','Infrastructure','Storage','Other')),
  github_url text,
  demo_url text,
  cover_path text NOT NULL,
  media_path text,
  media_kind text CHECK (media_kind IN ('video','pdf')),
  likes_count integer NOT NULL DEFAULT 0
);

GRANT SELECT, INSERT ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Anyone can submit projects" ON public.projects FOR INSERT WITH CHECK (true);

CREATE TABLE public.project_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, visitor_id)
);

GRANT SELECT, INSERT ON public.project_likes TO anon, authenticated;
GRANT ALL ON public.project_likes TO service_role;

ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.project_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can like" ON public.project_likes FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.tg_project_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects SET likes_count = likes_count + 1 WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER project_likes_count_trg
AFTER INSERT OR DELETE ON public.project_likes
FOR EACH ROW EXECUTE FUNCTION public.tg_project_likes_count();

CREATE INDEX projects_created_at_idx ON public.projects (created_at DESC);
CREATE INDEX projects_likes_idx ON public.projects (likes_count DESC);
CREATE INDEX projects_category_idx ON public.projects (category);
