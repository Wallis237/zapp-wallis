
import { useState, useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical, Menu, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  sender?: {
    display_name: string;
    username: string;
  };
}

interface ChatAreaProps {
  chatId?: string;
  onToggleSidebar: () => void;
  currentUserId?: string;
}

export function ChatArea({ chatId, onToggleSidebar, currentUserId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatPartner, setChatPartner] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chatId && currentUserId) {
      fetchMessages();
      fetchChatPartner();
    }
  }, [chatId, currentUserId]);

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
          filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${currentUserId}))`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUserId]);

  const fetchMessages = async () => {
    if (!chatId || !currentUserId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(display_name, username)
        `)
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

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

  const handleSendMessage = async (content: string) => {
    if (!chatId || !currentUserId || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: chatId,
          content: content.trim()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  if (!currentUserId) {
    return (
      <div className="flex-1 flex items-center justify-center chat-gradient">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Please log in to chat</h2>
          <p className="text-muted-foreground">You need to be authenticated to use the chat</p>
        </div>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center chat-gradient">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Welcome to Chat App</h2>
          <p className="text-muted-foreground">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={chatPartner?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {chatPartner?.display_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            {chatPartner?.is_online && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-chat-online border-2 border-white rounded-full" />
            )}
          </div>
          
          <div>
            <h2 className="font-semibold">{chatPartner?.display_name || 'Unknown User'}</h2>
            <p className="text-xs text-muted-foreground">
              {chatPartner?.is_online ? 'Online' : 'Last seen recently'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 chat-gradient">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message.content}
                isSent={message.sender_id === currentUserId}
                timestamp={new Date(message.created_at)}
                senderName={message.sender?.display_name}
                isGroupChat={false}
              />
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
