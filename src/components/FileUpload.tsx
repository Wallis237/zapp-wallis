
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, FileText, Video, Music, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File, fileUrl: string, fileType: string, fileName: string) => void;
  onClose: () => void;
  currentUserId?: string;
}

export function FileUpload({ onFileSelect, onClose, currentUserId }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      onFileSelect(file, publicUrl, file.type, file.name);
      
      toast({
        title: "Success",
        description: "File uploaded successfully!"
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  const fileTypes = [
    { label: 'Photos', icon: Image, accept: 'image/*' },
    { label: 'Documents', icon: FileText, accept: '.pdf,.doc,.docx,.txt' },
    { label: 'Videos', icon: Video, accept: 'video/*' },
    { label: 'Audio', icon: Music, accept: 'audio/*' },
    { label: 'All Files', icon: Upload, accept: '*/*' },
  ];

  return (
    <Card className="w-48 shadow-lg">
      <CardContent className="p-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Attach File</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        
        <div className="space-y-1">
          {fileTypes.map((type) => (
            <Button
              key={type.label}
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleFileSelect(type.accept)}
              disabled={isUploading}
            >
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </Button>
          ))}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {isUploading && (
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">Uploading...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
