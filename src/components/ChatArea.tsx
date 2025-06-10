
import { useState, useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface Message {
  id: string;
  text: string;
  isSent: boolean;
  timestamp: Date;
  senderName?: string;
}

interface ChatAreaProps {
  chatId?: string;
  onToggleSidebar: () => void;
}

const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      text: 'Hey! How are you doing today?',
      isSent: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      senderName: 'Alice Johnson'
    },
    {
      id: '2',
      text: "I'm doing great, thanks! Just working on some new projects. How about you?",
      isSent: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 4)
    },
    {
      id: '3',
      text: "That's awesome! I'd love to hear more about your projects.",
      isSent: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      senderName: 'Alice Johnson'
    }
  ],
  '2': [
    {
      id: '1',
      text: 'Thanks for your help yesterday!',
      isSent: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      senderName: 'Bob Smith'
    },
    {
      id: '2',
      text: 'No problem at all! Happy to help.',
      isSent: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 55)
    }
  ],
  '3': [
    {
      id: '1',
      text: 'Meeting starts in 10 minutes',
      isSent: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      senderName: 'Sarah Wilson'
    },
    {
      id: '2',
      text: 'Thanks for the reminder!',
      isSent: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 178)
    },
    {
      id: '3',
      text: 'See you all there!',
      isSent: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 175),
      senderName: 'Mike Davis'
    }
  ]
};

const chatInfo = {
  '1': { name: 'Alice Johnson', isOnline: true, isGroup: false },
  '2': { name: 'Bob Smith', isOnline: false, isGroup: false },
  '3': { name: 'Team Chat', isOnline: true, isGroup: true },
  '4': { name: 'Sarah Wilson', isOnline: true, isGroup: false },
  '5': { name: 'Design Team', isOnline: false, isGroup: true }
};

export function ChatArea({ chatId, onToggleSidebar }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentChat = chatId ? chatInfo[chatId as keyof typeof chatInfo] : null;

  useEffect(() => {
    if (chatId && mockMessages[chatId]) {
      setMessages(mockMessages[chatId]);
    } else {
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!chatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isSent: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! This is a demo response.",
        isSent: false,
        timestamp: new Date(),
        senderName: currentChat?.name
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

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
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentChat?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {currentChat?.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-chat-online border-2 border-white rounded-full" />
            )}
          </div>
          
          <div>
            <h2 className="font-semibold">{currentChat?.name}</h2>
            <p className="text-xs text-muted-foreground">
              {currentChat?.isOnline ? 'Online' : 'Last seen recently'}
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
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message.text}
              isSent={message.isSent}
              timestamp={message.timestamp}
              senderName={message.senderName}
              isGroupChat={currentChat?.isGroup}
            />
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="message-received px-4 py-2 rounded-lg max-w-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
