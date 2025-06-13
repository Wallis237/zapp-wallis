
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProfileUpload } from './ProfileUpload';
import { WallpaperSlideshow } from './WallpaperSlideshow';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onProfileUpdate: () => void;
  onThemeChange: (theme: string) => void;
  onWallpaperChange: (index: number) => void;
  userPreferences: any;
  onPreferencesUpdate?: () => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onProfileUpdate,
  onThemeChange,
  onWallpaperChange,
  userPreferences,
  onPreferencesUpdate
}: SettingsModalProps) {
  const [displayName, setDisplayName] = useState(currentUser?.display_name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [isOnline, setIsOnline] = useState(currentUser?.is_online || false);
  const [language, setLanguage] = useState(userPreferences?.language || 'en');
  const [theme, setTheme] = useState(userPreferences?.theme || 'light');
  const [wallpaperIndex, setWallpaperIndex] = useState(userPreferences?.wallpaper_index || 0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userPreferences) {
      setLanguage(userPreferences.language || 'en');
      setTheme(userPreferences.theme || 'light');
      setWallpaperIndex(userPreferences.wallpaper_index || 0);
    }
  }, [userPreferences]);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.display_name || '');
      setUsername(currentUser.username || '');
      setIsOnline(currentUser.is_online || false);
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          username: username.trim(),
          is_online: isOnline,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (profileError) throw profileError;

      // Check if user preferences already exist
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      let prefsError;
      if (existingPrefs) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_preferences')
          .update({
            language,
            theme,
            wallpaper_index: wallpaperIndex,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentUser.id);
        prefsError = error;
      } else {
        // Insert new preferences
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: currentUser.id,
            language,
            theme,
            wallpaper_index: wallpaperIndex,
            updated_at: new Date().toISOString()
          });
        prefsError = error;
      }

      if (prefsError) throw prefsError;

      // Apply changes immediately
      onThemeChange(theme);
      onWallpaperChange(wallpaperIndex);

      // Update preferences in parent component
      if (onPreferencesUpdate) {
        onPreferencesUpdate();
      }

      toast({
        title: "Success",
        description: "Settings updated successfully!"
      });

      onProfileUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWallpaperSelect = (index: number) => {
    setWallpaperIndex(index);
    // Apply wallpaper change immediately for preview
    onWallpaperChange(index);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // Apply theme immediately for preview
    onThemeChange(newTheme);
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      it: 'Italiano',
      pt: 'Português'
    };
    return languages[code] || code;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Profile Photo Section */}
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="flex justify-center">
              <ProfileUpload 
                currentUser={currentUser} 
                onProfileUpdate={onProfileUpdate} 
              />
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Current: {getLanguageName(language)} (Translation coming soon)
            </p>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Wallpaper Selection */}
          <div className="space-y-2">
            <Label>Chat Wallpaper</Label>
            <WallpaperSlideshow 
              wallpaperIndex={wallpaperIndex}
              onWallpaperChange={handleWallpaperSelect}
            />
          </div>

          {/* Online Status */}
          <div className="flex items-center justify-between">
            <Label htmlFor="online-status">Show as online</Label>
            <Switch
              id="online-status"
              checked={isOnline}
              onCheckedChange={setIsOnline}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
