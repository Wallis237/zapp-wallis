
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: string;
  isSent: boolean;
  timestamp: Date;
  senderName?: string;
  isGroupChat?: boolean;
}

export function MessageBubble({ 
  message, 
  isSent, 
  timestamp, 
  senderName, 
  isGroupChat = false 
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`
        max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg
        ${isSent 
          ? 'message-sent text-white' 
          : 'message-received text-foreground'
        }
        chat-shadow
      `}>
        {!isSent && isGroupChat && senderName && (
          <div className="text-xs font-medium text-primary mb-1">
            {senderName}
          </div>
        )}
        <div className="text-sm leading-relaxed">
          {message}
        </div>
        <div className={`
          text-xs mt-1 
          ${isSent ? 'text-white/70' : 'text-muted-foreground'}
        `}>
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}
