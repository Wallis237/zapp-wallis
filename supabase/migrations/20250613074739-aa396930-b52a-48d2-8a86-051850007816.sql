
-- First enable RLS on the rooms table if not already enabled
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view rooms they are members of" ON public.rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Room creators and admins can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Room creators and admins can delete rooms" ON public.rooms;

-- Create proper RLS policies for rooms
CREATE POLICY "Users can create rooms" ON public.rooms
FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can view rooms they are members of" ON public.rooms
FOR SELECT USING (
  auth.uid() = creator_id OR
  EXISTS (
    SELECT 1 FROM public.room_members 
    WHERE room_id = rooms.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Room creators and admins can update rooms" ON public.rooms
FOR UPDATE USING (
  auth.uid() = creator_id OR 
  EXISTS (
    SELECT 1 FROM public.room_members 
    WHERE room_id = rooms.id AND user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Room creators and admins can delete rooms" ON public.rooms
FOR DELETE USING (
  auth.uid() = creator_id OR 
  EXISTS (
    SELECT 1 FROM public.room_members 
    WHERE room_id = rooms.id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- Also enable RLS on room_members table if not already enabled
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- Fix room_members policies
DROP POLICY IF EXISTS "Users can view room memberships they belong to" ON public.room_members;
DROP POLICY IF EXISTS "Users can insert room memberships" ON public.room_members;
DROP POLICY IF EXISTS "Room admins can update memberships" ON public.room_members;
DROP POLICY IF EXISTS "Room admins can delete memberships" ON public.room_members;

CREATE POLICY "Users can view room memberships" ON public.room_members
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.is_room_member(room_id, auth.uid())
);

CREATE POLICY "Users can insert room memberships" ON public.room_members
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  (user_id = auth.uid() OR public.is_room_admin(room_id, auth.uid()))
);

CREATE POLICY "Room admins can update memberships" ON public.room_members
FOR UPDATE USING (public.is_room_admin(room_id, auth.uid()));

CREATE POLICY "Room admins can delete memberships" ON public.room_members
FOR DELETE USING (
  user_id = auth.uid() OR 
  public.is_room_admin(room_id, auth.uid())
);

-- Enable RLS on user_preferences table if not already enabled
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

CREATE POLICY "Users can view their own preferences" ON public.user_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
FOR UPDATE USING (auth.uid() = user_id);
