import { useState, useEffect } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatArea } from '@/components/ChatArea';
import { AuthPage } from '@/components/AuthPage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [isRoom, setIsRoom] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const { toast } = useToast();
  const { setLanguage } = useLanguage();

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

      // Apply theme and language from preferences
      if (preferences.theme) {
        handleThemeChange(preferences.theme);
      }
      if (preferences.language) {
        setLanguage(preferences.language);
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

  const handleLanguageChange = (language: string) => {
    setLanguage(language);
    // Update user preferences state immediately
    setUserPreferences(prev => ({
      ...prev,
      language: language
    }));
  };

  const handlePreferencesUpdate = () => {
    // Refresh user preferences after settings are saved
    fetchUserPreferences();
  };

  // This effect updates wallpaper immediately when changed, not only after preference is saved
  useEffect(() => {
    if (userPreferences?.wallpaper_index !== undefined) {
      handleWallpaperChange(userPreferences.wallpaper_index);
    }
  }, [userPreferences?.wallpaper_index]);

  // Instant wallpaper switching when selected
  const handleWallpaperChange = (index: number) => {
    const wallpapers = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&h=1080&fit=crop'
    ];
    // Also update wallpaper immediately
    document.body.style.backgroundImage = `url(${wallpapers[index]})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    // Update user preferences state immediately
    setUserPreferences(prev => ({
      ...prev,
      wallpaper_index: index
    }));
  };

  // Add useEffect to update wallpaper on preference change
  useEffect(() => {
    if (userPreferences?.wallpaper_index !== undefined) {
      handleWallpaperChange(userPreferences.wallpaper_index);
    }
  }, [userPreferences?.wallpaper_index]);

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
    <div className="h-screen flex bg-background"
      style={{
        backgroundImage: userPreferences?.wallpaper_index !== undefined
          ? `url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop)`
          : undefined
      }}
    >
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
        onLanguageChange={handleLanguageChange}
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
        onLanguageChange={handleLanguageChange}
        userPreferences={userPreferences}
        onPreferencesUpdate={handlePreferencesUpdate}
      />
    </div>
  );
}
