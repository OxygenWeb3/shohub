CREATE POLICY "Anyone can remove their like" ON public.project_likes FOR DELETE USING (true);
GRANT DELETE ON public.project_likes TO anon, authenticated;