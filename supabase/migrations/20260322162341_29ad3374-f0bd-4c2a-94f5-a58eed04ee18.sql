
DROP POLICY IF EXISTS "Anyone authenticated can read news" ON public.news_items;
CREATE POLICY "Anyone can read news" ON public.news_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone authenticated can read highlights" ON public.highlight_videos;
CREATE POLICY "Anyone can read highlights" ON public.highlight_videos FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone authenticated can read transfers" ON public.transfers;
CREATE POLICY "Anyone can read transfers" ON public.transfers FOR SELECT TO anon, authenticated USING (true);
