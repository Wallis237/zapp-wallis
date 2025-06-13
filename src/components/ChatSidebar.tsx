import { useState, useEffect } from 'react';
import { Users, MessageCircle, Settings, Search, Menu, X, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileUpload } from './ProfileUpload';
import { SettingsModal } from './SettingsModal';
import { RoomModal } from './RoomModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen: string;
}

interface Room {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  is_private: boolean;
  created_at: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedChatId?: string;
  onChatSelect: (chatId: string, isRoom?: boolean) => void;
  currentUser?: any;
  onLogout: () => void;
  onProfileUpdate?: () => void;
  onThemeChange: (theme: string) => void;
  onWallpaperChange: (index: number) => void;
  userPreferences: any;
  onPreferencesUpdate: () => void;
}

export function ChatSidebar({ 
  isOpen, 
  onToggle, 
  selectedChatId, 
  onChatSelect, 
  currentUser,
  onLogout,
  onProfileUpdate,
  onThemeChange,
  onWallpaperChange,
  userPreferences,
  onPreferencesUpdate
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchRooms();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser?.id)
        .order('display_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          room_members!inner(user_id)
        `)
        .eq('room_members.user_id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRooms = rooms.filter(room =>
    room.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const handleProfileUpdateSuccess = () => {
    if (onProfileUpdate) {
      onProfileUpdate();
    }
    fetchUsers();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full w-80 bg-background border-r border-border z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              Chat App
            </h1>
            <div className="flex items-center gap-2">
              {currentUser && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onLogout}
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onToggle}
                className="lg:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {currentUser && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <ProfileUpload 
                currentUser={currentUser} 
                onProfileUpdate={handleProfileUpdateSuccess} 
              />
              <div className="mt-2">
                <p className="text-sm font-medium truncate">{currentUser.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{currentUser.username}</p>
              </div>
            </div>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users and rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs for Users and Rooms */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="users" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="flex-1 overflow-y-auto mt-2">
              {!currentUser ? (
                <div className="p-4 text-center text-muted-foreground">
                  Please log in to see users
                </div>
              ) : isLoading ? (
                <div className="p-4 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm ? 'No users found' : 'No users available'}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => onChatSelect(user.id, false)}
                    className={`
                      p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50
                      ${selectedChatId === user.id ? 'bg-muted border-r-2 border-r-primary' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.display_name?.split(' ').map(n => n[0]).join('') || user.username?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {user.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-chat-online border-2 border-background rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{user.display_name || user.username}</h3>
                          <span className="text-xs text-muted-foreground">
                            {user.is_online ? 'Online' : formatLastSeen(user.last_seen)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="rooms" className="flex-1 overflow-y-auto mt-2">
              <div className="p-4 border-b border-border">
                <Button onClick={() => setShowRoomModal(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </div>

              {filteredRooms.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm ? 'No rooms found' : 'No rooms available'}
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => onChatSelect(room.id, true)}
                    className={`
                      p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50
                      ${selectedChatId === room.id ? 'bg-muted border-r-2 border-r-primary' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {room.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{room.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {room.description || 'Private room'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => { fetchUsers(); fetchRooms(); }} title="Refresh">
              <Users className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} title="Settings">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentUser={currentUser}
        onProfileUpdate={handleProfileUpdateSuccess}
        onThemeChange={onThemeChange}
        onWallpaperChange={onWallpaperChange}
        userPreferences={userPreferences}
        onPreferencesUpdate={onPreferencesUpdate}
      />

      <RoomModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        onRoomCreated={fetchRooms}
        currentUser={currentUser}
      />
    </>
  );
}
