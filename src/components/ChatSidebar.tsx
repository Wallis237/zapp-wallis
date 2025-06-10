
import { useState } from 'react';
import { Users, MessageCircle, Settings, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  isOnline: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
}

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    lastMessage: 'Hey! How are you doing today?',
    timestamp: '2m',
    unread: 2,
    isOnline: true
  },
  {
    id: '2',
    name: 'Bob Smith',
    lastMessage: 'Thanks for your help yesterday!',
    timestamp: '1h',
    unread: 0,
    isOnline: false
  },
  {
    id: '3',
    name: 'Team Chat',
    lastMessage: 'Meeting starts in 10 minutes',
    timestamp: '3h',
    unread: 5,
    isOnline: true
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    lastMessage: 'See you tomorrow!',
    timestamp: '1d',
    unread: 0,
    isOnline: true
  },
  {
    id: '5',
    name: 'Design Team',
    lastMessage: 'New mockups are ready for review',
    timestamp: '2d',
    unread: 1,
    isOnline: false
  }
];

export function ChatSidebar({ isOpen, onToggle, selectedChatId, onChatSelect }: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full w-80 bg-white border-r border-border z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              Chat App
            </h1>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`
                p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50
                ${selectedChatId === chat.id ? 'bg-muted border-r-2 border-r-primary' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {chat.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-chat-online border-2 border-white rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                
                {chat.unread > 0 && (
                  <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon">
              <Users className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
