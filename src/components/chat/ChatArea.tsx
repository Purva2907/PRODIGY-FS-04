import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Image as ImageIcon,
  FileText,
  X,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import EmojiPicker from './EmojiPicker';

interface ChatAreaProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

const ChatArea = ({ onBack, showBackButton }: ChatAreaProps) => {
  const { user } = useAuth();
  const { currentRoom, messages, typingUsers, sendMessage, setTyping } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    // Handle typing indicator
    setTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    await sendMessage(messageInput.trim());
    setMessageInput('');
    setTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getRoomDisplayInfo = () => {
    if (!currentRoom) return null;

    if (currentRoom.is_group) {
      return {
        name: currentRoom.name || 'Group Chat',
        avatar: currentRoom.avatar_url,
        initials: (currentRoom.name || 'GC').slice(0, 2).toUpperCase(),
        subtitle: `${currentRoom.members?.length || 0} members`,
        isOnline: false,
      };
    }

    const otherMember = currentRoom.members?.find(m => m.user_id !== user?.id);
    return {
      name: otherMember?.profile?.display_name || otherMember?.profile?.username || 'Unknown',
      avatar: otherMember?.profile?.avatar_url,
      initials: (otherMember?.profile?.username || 'U').slice(0, 2).toUpperCase(),
      subtitle: otherMember?.profile?.is_online ? 'Online' : 'Offline',
      isOnline: otherMember?.profile?.is_online || false,
    };
  };

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: typeof messages }[] = [];
    
    messages.forEach(message => {
      const date = new Date(message.created_at);
      let dateLabel: string;
      
      if (isToday(date)) {
        dateLabel = 'Today';
      } else if (isYesterday(date)) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = format(date, 'MMMM d, yyyy');
      }
      
      const existingGroup = groups.find(g => g.date === dateLabel);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: dateLabel, messages: [message] });
      }
    });
    
    return groups;
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background chat-pattern">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to ChatFlow</h2>
          <p className="text-muted-foreground max-w-sm">
            Select a conversation from the sidebar or start a new chat to begin messaging
          </p>
        </div>
      </div>
    );
  }

  const roomInfo = getRoomDisplayInfo();
  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="md:hidden rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={roomInfo?.avatar || undefined} />
              <AvatarFallback className="bg-primary/10">
                {currentRoom.is_group ? <Users className="h-5 w-5" /> : roomInfo?.initials}
              </AvatarFallback>
            </Avatar>
            {!currentRoom.is_group && roomInfo?.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full status-online border-2 border-card" />
            )}
          </div>
          
          <div>
            <h2 className="font-semibold">{roomInfo?.name}</h2>
            <p className="text-xs text-muted-foreground">{roomInfo?.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messageGroups.map(({ date, messages: dayMessages }) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center justify-center mb-4">
                <div className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                  {date}
                </div>
              </div>
              
              {/* Messages for this day */}
              <div className="space-y-3">
                {dayMessages.map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  const showAvatar = !isOwn && (
                    index === 0 || 
                    dayMessages[index - 1].sender_id !== message.sender_id
                  );
                  
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <TypingIndicator users={typingUsers} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5" />
            </Button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2">
                <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
              </div>
            )}
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-muted border-0"
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="rounded-xl gradient-primary shadow-glow-sm"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
