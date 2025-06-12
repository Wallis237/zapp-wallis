
-- Fix the infinite recursion error in room_members policies
DROP POLICY IF EXISTS "Room admins can manage members" ON public.room_members;
DROP POLICY IF EXISTS "Users can view room memberships" ON public.room_members;

-- Create a security definer function to check room membership
CREATE OR REPLACE FUNCTION public.is_room_member(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.room_members 
    WHERE room_id = room_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a security definer function to check if user is room admin
CREATE OR REPLACE FUNCTION public.is_room_admin(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.room_members 
    WHERE room_id = room_uuid AND user_id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policies using the security definer functions
CREATE POLICY "Users can view room memberships they belong to" ON public.room_members
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.is_room_member(room_id, auth.uid())
);

CREATE POLICY "Users can insert room memberships" ON public.room_members
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Room admins can update memberships" ON public.room_members
FOR UPDATE USING (public.is_room_admin(room_id, auth.uid()));

CREATE POLICY "Room admins can delete memberships" ON public.room_members
FOR DELETE USING (public.is_room_admin(room_id, auth.uid()));

-- Fix messages policies to allow room messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can view messages" ON public.messages
FOR SELECT USING (
  sender_id = auth.uid() OR 
  receiver_id = auth.uid() OR
  (room_id IS NOT NULL AND public.is_room_member(room_id, auth.uid()))
);

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  (receiver_id IS NOT NULL OR (room_id IS NOT NULL AND public.is_room_member(room_id, auth.uid())))
);
