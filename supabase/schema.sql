-- ============================================================
-- KotoKotha — Database Schema
-- Run this FIRST in the Supabase SQL Editor.
-- ============================================================

-- 1. CREATE THE POSTS TABLE
-- Every experience someone shares becomes one row here.
CREATE TABLE posts (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT            NOT NULL,
    category    TEXT            NOT NULL,
    institution TEXT            NOT NULL,
    division    TEXT            NOT NULL,
    district    TEXT            NOT NULL,
    rating      INT             NOT NULL CHECK (rating >= 1 AND rating <= 5),
    body        TEXT            NOT NULL,
    approved    BOOLEAN         NOT NULL DEFAULT false,
    upvotes     INT             NOT NULL DEFAULT 0,
    downvotes   INT             NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- 2. ENABLE ROW LEVEL SECURITY
-- Without this, anyone with the anon key could read or change every row.
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 3. SELECT POLICY — visitors can only read approved posts
CREATE POLICY "Anyone can read approved posts"
    ON posts
    FOR SELECT
    TO anon
    USING (approved = true);

-- 4. INSERT POLICY — visitors can submit, but only as hidden + zero votes
CREATE POLICY "Anyone can submit a new post (pending approval)"
    ON posts
    FOR INSERT
    TO anon
    WITH CHECK (
        approved = false
        AND upvotes = 0
        AND downvotes = 0
    );

-- No UPDATE or DELETE policies — anonymous users cannot edit or remove posts.

-- 5. VOTE FUNCTION — the only way visitors can change a row
-- Runs with owner permissions (security definer) so it can update
-- the votes column even though anon has no UPDATE policy.
CREATE OR REPLACE FUNCTION vote_post(post_id UUID, direction TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF direction NOT IN ('up', 'down') THEN
        RAISE EXCEPTION 'direction must be "up" or "down"';
    END IF;

    IF direction = 'up' THEN
        UPDATE posts
           SET upvotes = upvotes + 1
         WHERE id = post_id
           AND approved = true;
    ELSE
        UPDATE posts
           SET downvotes = downvotes + 1
         WHERE id = post_id
           AND approved = true;
    END IF;
END;
$$;

-- Let anonymous visitors call this function
GRANT EXECUTE ON FUNCTION vote_post(UUID, TEXT) TO anon;
