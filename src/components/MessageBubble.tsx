
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: string;
  isSent: boolean;
  timestamp: Date;
  senderName?: string;
  isGroupChat?: boolean;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
}

export function MessageBubble({ 
  message, 
  isSent, 
  timestamp, 
  senderName, 
  isGroupChat = false,
  fileUrl,
  fileType,
  fileName
}: MessageBubbleProps) {
  const renderFileContent = () => {
    if (!fileUrl) return null;

    if (fileType?.startsWith('image/')) {
      return (
        <div className="mt-2">
          <img 
            src={fileUrl} 
            alt={fileName}
            className="max-w-xs rounded-lg cursor-pointer"
            onClick={() => window.open(fileUrl, '_blank')}
          />
        </div>
      );
    }

    if (fileType?.startsWith('video/')) {
      return (
        <div className="mt-2">
          <video 
            src={fileUrl} 
            controls
            className="max-w-xs rounded-lg"
          />
        </div>
      );
    }

    return (
      <div className="mt-2">
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          📎 {fileName || 'Download file'}
        </a>
      </div>
    );
  };

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isSent 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-background text-foreground border'
      }`}>
        {isGroupChat && !isSent && senderName && (
          <p className="text-xs font-medium mb-1 text-muted-foreground">{senderName}</p>
        )}
        <p className="break-words">{message}</p>
        {renderFileContent()}
        <p className={`text-xs mt-1 ${
          isSent 
            ? 'text-primary-foreground/70' 
            : 'text-muted-foreground'
        }`}>
          {format(timestamp, 'HH:mm')}
        </p>
      </div>
    </div>
  );
}
