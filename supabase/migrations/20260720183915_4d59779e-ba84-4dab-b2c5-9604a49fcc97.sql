
CREATE POLICY "Anyone can read covers/media" ON storage.objects
FOR SELECT USING (bucket_id IN ('covers','media'));

CREATE POLICY "Anyone can upload covers/media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('covers','media'));
