
-- Fix RLS policies for rooms table
DROP POLICY IF EXISTS "Users can view rooms they are members of" ON public.rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Room creators can update their rooms" ON public.rooms;

-- Create new RLS policies for rooms
CREATE POLICY "Users can view rooms they are members of" ON public.rooms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.room_members 
    WHERE room_id = rooms.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create rooms" ON public.rooms
FOR INSERT WITH CHECK (auth.uid() = creator_id);

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
