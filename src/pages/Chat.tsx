import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatArea from '@/components/chat/ChatArea';
import { Loader2 } from 'lucide-react';

const ChatContent = () => {
  const { currentRoom, setCurrentRoom } = useChat();
  const [showSidebar, setShowSidebar] = useState(true);

  // On mobile, hide sidebar when room is selected
  useEffect(() => {
    if (currentRoom) {
      setShowSidebar(window.innerWidth >= 768);
    }
  }, [currentRoom]);

  const handleBack = () => {
    setCurrentRoom(null);
    setShowSidebar(true);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${
        currentRoom && !showSidebar ? 'hidden md:block' : 'block'
      }`}>
        <ChatSidebar />
      </div>

      {/* Chat area */}
      <div className={`flex-1 ${!currentRoom ? 'hidden md:flex' : 'flex'}`}>
        <ChatArea 
          onBack={handleBack}
          showBackButton={!!currentRoom}
        />
      </div>
    </div>
  );
};

const Chat = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ChatFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
};

export default Chat;
