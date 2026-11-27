-- ============================================================
-- KotoKotha — Admin Panel Setup
-- Run this in the Supabase SQL Editor AFTER schema.sql.
--
-- What it does:
--   1. Creates an `admins` allowlist (who is allowed to moderate).
--   2. Adds an is_admin() helper used by the security policies.
--   3. Lets ONLY listed admins read, edit and delete every post.
--
-- Visitors (the anon role) are not affected — they keep the same
-- permissions as before (read approved posts, submit, vote).
-- ============================================================

-- 1. ADMIN ALLOWLIST
-- One row per admin. Rows point at a Supabase Auth user.
CREATE TABLE IF NOT EXISTS public.admins (
    user_id     UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- RLS on, and NO policies on purpose: nobody can read or change this
-- table through the public API. Manage it only from the SQL Editor.
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 2. is_admin() — true when the logged-in user is in the allowlist.
-- SECURITY DEFINER lets it look inside `admins` even though the table
-- has no public policies.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admins WHERE user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. POSTS POLICIES FOR ADMINS
-- These apply only to logged-in users (role "authenticated") who pass is_admin().
GRANT SELECT, UPDATE, DELETE ON public.posts TO authenticated;

CREATE POLICY "Admins can read all posts"
    ON public.posts
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can update posts"
    ON public.posts
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete posts"
    ON public.posts
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ============================================================
-- 4. MAKE YOURSELF AN ADMIN  (do this part by hand)
--
--   a) Supabase dashboard → Authentication → Users → "Add user"
--      → "Create new user". Enter your email + a strong password
--      and tick "Auto Confirm User".
--
--   b) Replace the email below with that same email, then run ONLY
--      the INSERT (remove the leading "-- "):
--
--   -- INSERT INTO public.admins (user_id)
--   -- SELECT id FROM auth.users WHERE email = 'you@example.com';
--
--   c) Authentication → Sign In / Providers → turn OFF
--      "Allow new users to sign up", so nobody else can create
--      accounts. (Even if they did, they could not moderate —
--      only users in `admins` can.)
-- ============================================================
