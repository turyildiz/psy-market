CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_profile_id, following_profile_id),
  CHECK (follower_profile_id != following_profile_id)
);

CREATE INDEX follows_follower_idx ON public.follows(follower_profile_id);
CREATE INDEX follows_following_idx ON public.follows(following_profile_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows_select" ON public.follows FOR SELECT USING (true);

CREATE POLICY "follows_insert" ON public.follows FOR INSERT WITH CHECK (
  follower_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "follows_delete" ON public.follows FOR DELETE USING (
  follower_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
