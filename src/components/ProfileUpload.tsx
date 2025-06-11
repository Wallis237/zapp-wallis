
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileUploadProps {
  currentUser: any;
  onProfileUpdate: () => void;
}

export function ProfileUpload({ currentUser, onProfileUpdate }: ProfileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Profile photo updated successfully!"
      });

      // Trigger profile refresh
      onProfileUpdate();
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile photo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className="w-10 h-10">
          <AvatarImage src={currentUser?.avatar_url} alt="Profile" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {currentUser?.display_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
          </AvatarFallback>
        </Avatar>
        
        <label className="absolute -bottom-1 -right-1 cursor-pointer">
          <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-lg hover:bg-primary/90 transition-colors">
            <Camera className="w-3 h-3" />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>
      
      <label className="cursor-pointer">
        <Button variant="ghost" size="sm" disabled={isUploading} asChild>
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Change Photo'}
          </div>
        </Button>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
