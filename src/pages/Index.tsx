
import { useState, useEffect } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatArea } from '@/components/ChatArea';
import { AuthPage } from '@/components/AuthPage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [isRoom, setIsRoom] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserPreferences(null);
        setSelectedChatId(undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserPreferences();
    }
  }, [currentUser]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchUserProfile(user.id);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setCurrentUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    }
  };

  const fetchUserPreferences = async () => {
    if (!currentUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const preferences = data || {
        language: 'en',
        theme: 'light',
        wallpaper_index: 0
      };

      setUserPreferences(preferences);

      // Apply theme from preferences
      if (preferences.theme) {
        handleThemeChange(preferences.theme);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const handleAuthSuccess = () => {
    // This will be called when user successfully logs in
    // The auth state change listener will handle the rest
  };

  const handleChatSelect = (chatId: string, isRoomChat = false) => {
    setSelectedChatId(chatId);
    setIsRoom(isRoomChat);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setUserPreferences(null);
      setSelectedChatId(undefined);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  const handleThemeChange = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleWallpaperChange = (index: number) => {
    // Update user preferences state immediately
    setUserPreferences(prev => ({
      ...prev,
      wallpaper_index: index
    }));
  };

  const handlePreferencesUpdate = () => {
    // Refresh user preferences after settings are saved
    fetchUserPreferences();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="h-screen flex bg-background">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
        currentUser={currentUser}
        onLogout={handleLogout}
        onProfileUpdate={() => fetchUserProfile(currentUser.id)}
        onThemeChange={handleThemeChange}
        onWallpaperChange={handleWallpaperChange}
        userPreferences={userPreferences}
        onPreferencesUpdate={handlePreferencesUpdate}
      />
      
      <ChatArea
        chatId={selectedChatId}
        isRoom={isRoom}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentUserId={currentUser?.id}
        wallpaperIndex={userPreferences?.wallpaper_index || 0}
        currentUser={currentUser}
        onThemeChange={handleThemeChange}
        onWallpaperChange={handleWallpaperChange}
        userPreferences={userPreferences}
        onPreferencesUpdate={handlePreferencesUpdate}
      />
    </div>
  );
}
