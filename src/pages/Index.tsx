
import { useState } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatArea } from '@/components/ChatArea';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string>('1');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <ChatSidebar 
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
      />
      <ChatArea 
        chatId={selectedChatId}
        onToggleSidebar={toggleSidebar}
      />
    </div>
  );
};

export default Index;
