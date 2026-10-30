-- =====================================================
-- OUR LITTLE UNIVERSE 💗 - SUPABASE DATABASE & RLS SCHEMA
-- Run this script in the Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql
-- =====================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  partner_name TEXT DEFAULT '',
  anniversary_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies:
-- Users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Automatically create profile row when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, partner_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', 'Starlight Soulmate 💗'),
    COALESCE(new.raw_user_meta_data->>'partner_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Private User Memories Table (Scrapbook Polaroids)
CREATE TABLE IF NOT EXISTS public.user_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  memory_date DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on user_memories
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

-- Memories RLS Policies:
-- Users can view ONLY their own memories
CREATE POLICY "Users can view own memories"
  ON public.user_memories
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert memories ONLY for themselves
CREATE POLICY "Users can insert own memories"
  ON public.user_memories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update ONLY their own memories
CREATE POLICY "Users can update own memories"
  ON public.user_memories
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete ONLY their own memories
CREATE POLICY "Users can delete own memories"
  ON public.user_memories
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Supabase Storage Bucket & Policies for Private Photos
-- Note: Create bucket 'private-memories' in Supabase Dashboard -> Storage
-- with 'Public bucket' turned OFF (private storage).

-- Policy: Authenticated users can upload to their own folder: (folder name matches user UUID)
-- CREATE POLICY "Allow user upload to own folder"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'private-memories' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Authenticated users can read only from their own folder:
-- CREATE POLICY "Allow user select own files"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'private-memories' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================
-- 5. PRIVATE LOVE VAULT TABLES & ROW LEVEL SECURITY
-- =====================================================

-- 5a. Vault Folders Table
CREATE TABLE IF NOT EXISTS public.vault_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '💗',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vault_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vault folders"
  ON public.vault_folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault folders"
  ON public.vault_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault folders"
  ON public.vault_folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault folders"
  ON public.vault_folders FOR DELETE
  USING (auth.uid() = user_id);

-- 5b. Vault Images Table
CREATE TABLE IF NOT EXISTS public.vault_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.vault_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  caption TEXT DEFAULT '',
  style TEXT DEFAULT 'Couple Studio Art',
  scene TEXT DEFAULT 'Romantic Universe',
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vault_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vault images"
  ON public.vault_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault images"
  ON public.vault_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault images"
  ON public.vault_images FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault images"
  ON public.vault_images FOR DELETE
  USING (auth.uid() = user_id);

-- 5c. Storage Bucket 'private-vault-images'
-- Bucket must be private. Policies ensure users can only access files in their own folder (auth.uid()::text)
-- CREATE POLICY "Allow user upload to private vault"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'private-vault-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- CREATE POLICY "Allow user view private vault files"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'private-vault-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================
-- 6. COUPLE SPACES & EXPIRING INVITATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.couple_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user1_name TEXT DEFAULT 'Partner 1',
  user2_name TEXT DEFAULT 'Partner 2',
  anniversary_date DATE,
  theme TEXT DEFAULT 'Pink Dream',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_couple_pair UNIQUE (user1_id, user2_id),
  CONSTRAINT different_partners CHECK (user1_id <> user2_id)
);

ALTER TABLE public.couple_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own couple space"
  ON public.couple_spaces FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Partners can update own couple space"
  ON public.couple_spaces FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE TABLE IF NOT EXISTS public.couple_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inviter_name TEXT NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.couple_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviters can view own invitations"
  ON public.couple_invitations FOR SELECT
  USING (auth.uid() = inviter_id);

CREATE POLICY "Inviters can create invitations"
  ON public.couple_invitations FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

-- =====================================================
-- 7. SECRET DIARY ENTRIES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT DEFAULT 'blushing',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  visibility TEXT NOT NULL CHECK (visibility IN ('personal', 'shared')),
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own diary entries"
  ON public.diary_entries FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Partners can view shared diary entries"
  ON public.diary_entries FOR SELECT
  USING (
    visibility = 'shared' AND EXISTS (
      SELECT 1 FROM public.couple_spaces cs
      WHERE (cs.user1_id = auth.uid() AND cs.user2_id = diary_entries.user_id)
         OR (cs.user2_id = auth.uid() AND cs.user1_id = diary_entries.user_id)
    )
  );

-- =====================================================
-- 8. OPEN-WHEN LETTERS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.open_when_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  template_type TEXT NOT NULL,
  message TEXT NOT NULL,
  unlock_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.open_when_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can manage own letters"
  ON public.open_when_letters FOR ALL
  USING (auth.uid() = author_id);

CREATE POLICY "Partners can read unlocked letters"
  ON public.open_when_letters FOR SELECT
  USING (
    (unlock_date IS NULL OR unlock_date <= now()) AND EXISTS (
      SELECT 1 FROM public.couple_spaces cs
      WHERE (cs.user1_id = auth.uid() AND cs.user2_id = open_when_letters.author_id)
         OR (cs.user2_id = auth.uid() AND cs.user1_id = open_when_letters.author_id)
    )
  );

-- =====================================================
-- 9. LOVE TIMELINE MILESTONES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.timeline_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  event_date DATE NOT NULL,
  icon TEXT DEFAULT '💖',
  is_pinned BOOLEAN DEFAULT FALSE,
  visibility TEXT NOT NULL CHECK (visibility IN ('personal', 'shared')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.timeline_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own milestones"
  ON public.timeline_milestones FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Partners can view shared milestones"
  ON public.timeline_milestones FOR SELECT
  USING (
    visibility = 'shared' AND EXISTS (
      SELECT 1 FROM public.couple_spaces cs
      WHERE (cs.user1_id = auth.uid() AND cs.user2_id = timeline_milestones.user_id)
         OR (cs.user2_id = auth.uid() AND cs.user1_id = timeline_milestones.user_id)
    )
  );

-- =====================================================
-- 10. 3D LOVE ROOM SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.room_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'pink-dream',
  fairy_lights BOOLEAN DEFAULT TRUE,
  music_playing BOOLEAN DEFAULT FALSE,
  custom_decorations JSONB DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.room_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update own room settings"
  ON public.room_settings FOR ALL
  USING (auth.uid() = user_id);

