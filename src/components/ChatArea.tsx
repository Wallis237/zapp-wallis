
import { useState, useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical, Menu, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { CallModal } from './CallModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  room_id?: string;
  file_url?: string;
  file_type?: string;
  file_name?: string;
  created_at: string;
  sender?: {
    display_name: string;
    username: string;
  };
}

interface ChatAreaProps {
  chatId?: string;
  isRoom?: boolean;
  onToggleSidebar: () => void;
  currentUserId?: string;
  wallpaperIndex: number;
}

export function ChatArea({ chatId, isRoom = false, onToggleSidebar, currentUserId, wallpaperIndex }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatPartner, setChatPartner] = useState<any>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    if (chatId && currentUserId) {
      fetchMessages();
      if (isRoom) {
        fetchRoomInfo();
      } else {
        fetchChatPartner();
      }
    }
  }, [chatId, currentUserId, isRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!chatId || !currentUserId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Check if message belongs to current conversation
          const isRelevant = isRoom 
            ? newMessage.room_id === chatId
            : (newMessage.sender_id === currentUserId && newMessage.receiver_id === chatId) ||
              (newMessage.sender_id === chatId && newMessage.receiver_id === currentUserId);

          if (isRelevant) {
            setMessages(prev => {
              if (prev.find(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUserId, isRoom]);

  const fetchMessages = async () => {
    if (!chatId || !currentUserId) return;

    setIsLoading(true);
    try {
      let query = supabase.from('messages').select('*');

      if (isRoom) {
        query = query.eq('room_id', chatId);
      } else {
        query = query.or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${currentUserId})`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatPartner = async () => {
    if (!chatId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) throw error;
      setChatPartner(data);
    } catch (error) {
      console.error('Error fetching chat partner:', error);
    }
  };

  const fetchRoomInfo = async () => {
    if (!chatId) return;

    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) throw error;
      setRoomInfo(data);
    } catch (error) {
      console.error('Error fetching room info:', error);
    }
  };

  const handleSendMessage = async (content: string, fileUrl?: string, fileType?: string, fileName?: string) => {
    if (!chatId || !currentUserId || (!content.trim() && !fileUrl)) return;

    try {
      const messageData: any = {
        sender_id: currentUserId,
        content: content.trim() || (fileName ? `📎 ${fileName}` : ''),
        file_url: fileUrl,
        file_type: fileType,
        file_name: fileName
      };

      if (isRoom) {
        messageData.room_id = chatId;
        messageData.receiver_id = currentUserId; // For room messages, we use sender as receiver too
      } else {
        messageData.receiver_id = chatId;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      console.log('Message sent successfully:', data);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleVoiceCall = () => {
    setIsVideoCall(false);
    setShowCallModal(true);
  };

  const handleVideoCall = () => {
    setIsVideoCall(true);
    setShowCallModal(true);
  };

  const renderFileMessage = (message: Message) => {
    if (!message.file_url) return message.content;

    if (message.file_type?.startsWith('image/')) {
      return (
        <div className="space-y-2">
          <img 
            src={message.file_url} 
            alt={message.file_name}
            className="max-w-xs rounded-lg cursor-pointer"
            onClick={() => window.open(message.file_url, '_blank')}
          />
          {message.content && <p>{message.content}</p>}
        </div>
      );
    }

    if (message.file_type?.startsWith('video/')) {
      return (
        <div className="space-y-2">
          <video 
            src={message.file_url} 
            controls
            className="max-w-xs rounded-lg"
          />
          {message.content && <p>{message.content}</p>}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <a 
          href={message.file_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          📎 {message.file_name || 'Download file'}
        </a>
        {message.content && <p>{message.content}</p>}
      </div>
    );
  };

  if (!currentUserId) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-white flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleSidebar}
            className="text-primary"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold">Chat App</h1>
          <div className="w-10"></div>
        </div>
        
        <div 
          className="flex-1 flex items-center justify-center"
          style={{
            backgroundImage: `url(${wallpapers[wallpaperIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-lg">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please log in to chat</h2>
            <p className="text-muted-foreground">You need to be authenticated to use the chat</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-white flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleSidebar}
            className="text-primary"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold">Chat App</h1>
          <div className="w-10"></div>
        </div>
        
        <div 
          className="flex-1 flex items-center justify-center"
          style={{
            backgroundImage: `url(${wallpapers[wallpaperIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-lg">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Welcome to Chat App</h2>
            <p className="text-muted-foreground mb-4">Select a conversation to start chatting</p>
            <Button onClick={onToggleSidebar} className="bg-primary text-white">
              Browse Users & Rooms
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const displayInfo = isRoom ? roomInfo : chatPartner;
  const displayName = isRoom ? roomInfo?.name : (chatPartner?.display_name || 'Unknown User');

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={!isRoom ? chatPartner?.avatar_url : undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {displayName?.split(' ').map((n: string) => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            {!isRoom && chatPartner?.is_online && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-chat-online border-2 border-white rounded-full" />
            )}
          </div>
          
          <div>
            <h2 className="font-semibold">{displayName}</h2>
            <p className="text-xs text-muted-foreground">
              {isRoom 
                ? (roomInfo?.description || 'Private room')
                : (chatPartner?.is_online ? 'Online' : 'Last seen recently')
              }
            </p>
          </div>
        </div>
        
        {!isRoom && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleVoiceCall}>
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleVideoCall}>
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundImage: `url(${wallpapers[wallpaperIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={renderFileMessage(message)}
                isSent={message.sender_id === currentUserId}
                timestamp={new Date(message.created_at)}
                senderName={message.sender?.display_name}
                isGroupChat={isRoom}
              />
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput 
        onSendMessage={handleSendMessage} 
        currentUserId={currentUserId}
      />

      {/* Call Modal */}
      {showCallModal && (
        <CallModal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          isVideoCall={isVideoCall}
          contactName={displayName}
          contactAvatar={!isRoom ? chatPartner?.avatar_url : undefined}
        />
      )}
    </div>
  );
}
