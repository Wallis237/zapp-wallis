
import { useState, useEffect } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatArea } from '@/components/ChatArea';
import { AuthPage } from '@/components/AuthPage';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [isRoomChat, setIsRoomChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [wallpaperIndex, setWallpaperIndex] = useState(0);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            fetchUserPreferences(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setUserPreferences(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserPreferences(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setUserPreferences(data);
        setTheme(data.theme || 'light');
        setWallpaperIndex(data.wallpaper_index || 0);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSelectedChatId('');
    setIsRoomChat(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChatSelect = (chatId: string, isRoom: boolean = false) => {
    setSelectedChatId(chatId);
    setIsRoomChat(isRoom);
    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleAuthSuccess = () => {
    // Auth success will be handled by the onAuthStateChange listener
  };

  const handleProfileUpdate = () => {
    if (user?.id) {
      fetchUserProfile(user.id);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleWallpaperChange = (index: number) => {
    setWallpaperIndex(index);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <ChatSidebar 
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
        currentUser={userProfile}
        onLogout={handleLogout}
        onProfileUpdate={handleProfileUpdate}
        onThemeChange={handleThemeChange}
        onWallpaperChange={handleWallpaperChange}
        userPreferences={userPreferences}
      />
      <ChatArea 
        chatId={selectedChatId}
        isRoom={isRoomChat}
        onToggleSidebar={toggleSidebar}
        currentUserId={user?.id}
        wallpaperIndex={wallpaperIndex}
      />
    </div>
  );
};

export default Index;
