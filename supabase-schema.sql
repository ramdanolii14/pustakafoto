-- ============================================================
-- PustakaFoto — Supabase Schema
-- Run in Supabase SQL editor (public schema)
-- ============================================================

-- Better Auth creates its own tables: users, sessions, accounts, verifications
-- We reference better_auth's users.id as our FK source

-- NOTE: Better Auth uses the "users" table in the "public" schema by default.
-- If you configure a custom schema in better-auth, adjust references below.

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  slug        text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title          text NOT NULL,
  character_name text NOT NULL,
  description    text,
  tags           text[] NOT NULL DEFAULT '{}',
  thumbnail_key  text NOT NULL,
  file_count     integer NOT NULL DEFAULT 0,
  upvotes        integer NOT NULL DEFAULT 0,
  downvotes      integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_tags_idx ON posts USING gin(tags);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS posts_fts_idx ON posts USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(character_name, '') || ' ' || coalesce(description, ''))
);

-- ============================================================
-- POST FILES
-- ============================================================
CREATE TABLE IF NOT EXISTS post_files (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  file_key    text NOT NULL,
  file_name   text NOT NULL,
  file_size   bigint NOT NULL DEFAULT 0,
  mime_type   text NOT NULL DEFAULT 'image/jpeg',
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_files_post_id_idx ON post_files(post_id);

-- ============================================================
-- VOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS votes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  vote_type   text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS votes_post_id_idx ON votes(post_id);
CREATE INDEX IF NOT EXISTS votes_user_id_idx ON votes(user_id);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);

-- ============================================================
-- TRIGGER: update posts.updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: keep posts vote counts in sync
-- ============================================================
CREATE OR REPLACE FUNCTION sync_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE posts SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.post_id;
    ELSE
      UPDATE posts SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE posts SET upvotes = GREATEST(upvotes - 1, 0), downvotes = downvotes + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE posts SET downvotes = GREATEST(downvotes - 1, 0), upvotes = upvotes + 1 WHERE id = NEW.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_votes
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION sync_vote_counts();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Tags: public read, no write from client
CREATE POLICY "tags_select" ON tags FOR SELECT USING (true);

-- Posts: public read, owner write
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (true);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (true);

-- Post files: public read, owner write
CREATE POLICY "post_files_select" ON post_files FOR SELECT USING (true);
CREATE POLICY "post_files_insert" ON post_files FOR INSERT WITH CHECK (true);
CREATE POLICY "post_files_delete" ON post_files FOR DELETE USING (true);

-- Votes: public read, authenticated write
CREATE POLICY "votes_select" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "votes_update" ON votes FOR UPDATE USING (true);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (true);

-- Comments: public read, authenticated write
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_update" ON comments FOR UPDATE USING (true);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (true);

-- ============================================================
-- SEED: default tags
-- ============================================================
INSERT INTO tags (name, slug) VALUES
  ('Solo', 'solo'),
  ('Group', 'group'),
  ('Outdoor', 'outdoor'),
  ('Indoor', 'indoor'),
  ('Anime', 'anime'),
  ('Game', 'game'),
  ('Original', 'original'),
  ('Event', 'event'),
  ('Studio', 'studio'),
  ('Concept', 'concept')
ON CONFLICT (slug) DO NOTHING;
