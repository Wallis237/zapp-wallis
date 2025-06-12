
-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Create storage bucket for shared files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-files', 'chat-files', true);

-- Create storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policies for chat files bucket
CREATE POLICY "Chat files are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-files');

CREATE POLICY "Users can upload chat files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-files' 
  AND auth.uid() IS NOT NULL
);

-- Create rooms table for private group chats
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create room members table
CREATE TABLE public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Add room_id to messages table for group messages
ALTER TABLE public.messages ADD COLUMN room_id UUID REFERENCES public.rooms(id);
ALTER TABLE public.messages ADD COLUMN file_url TEXT;
ALTER TABLE public.messages ADD COLUMN file_type TEXT;
ALTER TABLE public.messages ADD COLUMN file_name TEXT;

-- Add user preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  wallpaper_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for rooms
CREATE POLICY "Users can view rooms they are members of" ON public.rooms
FOR SELECT USING (
  id IN (
    SELECT room_id FROM public.room_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create rooms" ON public.rooms
FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Room creators can update their rooms" ON public.rooms
FOR UPDATE USING (auth.uid() = creator_id);

-- RLS policies for room_members
CREATE POLICY "Users can view room memberships" ON public.room_members
FOR SELECT USING (
  user_id = auth.uid() OR 
  room_id IN (
    SELECT room_id FROM public.room_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Room admins can manage members" ON public.room_members
FOR ALL USING (
  room_id IN (
    SELECT room_id FROM public.room_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS policies for user_preferences
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for new tables
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_members REPLICA IDENTITY FULL;
ALTER TABLE public.user_preferences REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_preferences;
