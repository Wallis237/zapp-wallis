
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: () => void;
  currentUser: any;
}

export function RoomModal({ isOpen, onClose, onRoomCreated, currentUser }: RoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !currentUser?.id) return;

    setIsLoading(true);
    try {
      // Create the room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name: roomName.trim(),
          description: description.trim(),
          creator_id: currentUser.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: currentUser.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Room created successfully!"
      });

      setRoomName('');
      setDescription('');
      onRoomCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter room description"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreateRoom} disabled={!roomName.trim() || isLoading}>
              {isLoading ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
