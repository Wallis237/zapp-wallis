
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, FileText, Video, Music, Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClose: () => void;
}

export function FileUpload({ onFileSelect, onClose }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
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
      </CardContent>
    </Card>
  );
}
