
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';
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

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile photo updated successfully!"
      });

      onProfileUpdate();
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile photo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="w-10 h-10">
        <AvatarImage src={currentUser?.avatar_url} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {currentUser?.display_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
        </AvatarFallback>
      </Avatar>
      
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
        />
      </label>
    </div>
  );
}
