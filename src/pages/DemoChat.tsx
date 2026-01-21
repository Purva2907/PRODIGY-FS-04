import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  LogOut, 
  MessageSquare,
  Users,
  ArrowLeft,
  Smile,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
} from 'lucide-react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  demoRooms, 
  demoProfiles, 
  currentDemoUser, 
  getMessagesForRoom,
  DemoRoom,
  DemoMessage,
} from '@/data/demoData';

const DemoChat = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRoom, setCurrentRoom] = useState<DemoRoom | null>(demoRooms[0]);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    if (currentRoom) {
      setMessages(getMessagesForRoom(currentRoom.id));
      setShowSidebar(window.innerWidth >= 768);
    }
  }, [currentRoom]);

  const filteredRooms = demoRooms.filter(room => {
    const searchLower = searchQuery.toLowerCase();
    if (room.is_group) {
      return room.name?.toLowerCase().includes(searchLower);
    }
    const otherMember = room.members?.find(m => m.user_id !== currentDemoUser.user_id);
    return otherMember?.profile?.username?.toLowerCase().includes(searchLower) ||
           otherMember?.profile?.display_name?.toLowerCase().includes(searchLower);
  });

  const getRoomDisplayInfo = (room: DemoRoom) => {
    if (room.is_group) {
      return {
        name: room.name || 'Group Chat',
        avatar: room.avatar_url,
        initials: (room.name || 'GC').slice(0, 2).toUpperCase(),
        isOnline: false,
      };
    }

    const otherMember = room.members?.find(m => m.user_id !== currentDemoUser.user_id);
    return {
      name: otherMember?.profile?.display_name || otherMember?.profile?.username || 'Unknown',
      avatar: otherMember?.profile?.avatar_url,
      initials: (otherMember?.profile?.username || 'U').slice(0, 2).toUpperCase(),
      isOnline: otherMember?.profile?.is_online || false,
    };
  };

  const formatDateSeparator = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const handleBack = () => {
    setCurrentRoom(null);
    setShowSidebar(true);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentRoom) return;

    const newMessage: DemoMessage = {
      id: `msg-new-${Date.now()}`,
      room_id: currentRoom.id,
      sender_id: currentDemoUser.user_id,
      content: messageInput,
      message_type: 'text',
      file_url: null,
      file_name: null,
      file_size: null,
      reply_to_id: null,
      is_edited: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender: currentDemoUser,
      reactions: [],
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, DemoMessage[]>);

  const roomInfo = currentRoom ? getRoomDisplayInfo(currentRoom) : null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${
        currentRoom && !showSidebar ? 'hidden md:block' : 'block'
      }`}>
        <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold gradient-text">ChatFlow</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-sidebar-accent"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-sidebar-accent border-0"
              />
            </div>
          </div>

          {/* Rooms List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              <div className="space-y-1">
                {filteredRooms.map(room => {
                  const { name, avatar, initials, isOnline } = getRoomDisplayInfo(room);
                  const isActive = currentRoom?.id === room.id;

                  return (
                    <button
                      key={room.id}
                      onClick={() => setCurrentRoom(room)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-sidebar-accent'
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={avatar || undefined} />
                          <AvatarFallback className={isActive ? 'bg-primary text-primary-foreground' : ''}>
                            {room.is_group ? <Users className="h-5 w-5" /> : initials}
                          </AvatarFallback>
                        </Avatar>
                        {!room.is_group && (
                          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-sidebar ${
                            isOnline ? 'status-online' : 'status-offline'
                          }`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{name}</span>
                          {room.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(room.lastMessage.created_at), { addSuffix: false })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {room.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentDemoUser.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentDemoUser.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentDemoUser.display_name}</p>
                <p className="text-xs text-muted-foreground">Demo Mode</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/auth')}
                className="rounded-xl hover:bg-primary/10 hover:text-primary"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 ${!currentRoom ? 'hidden md:flex' : 'flex'} flex-col bg-background`}>
        {currentRoom && roomInfo ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="md:hidden rounded-xl"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={roomInfo.avatar || undefined} />
                  <AvatarFallback>
                    {currentRoom.is_group ? <Users className="h-5 w-5" /> : roomInfo.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{roomInfo.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {currentRoom.is_group 
                      ? `${currentRoom.members?.length || 0} members`
                      : roomInfo.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6 max-w-3xl mx-auto">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                        {formatDateSeparator(new Date(date))}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3">
                      {dateMessages.map((message, index) => {
                        const isOwn = message.sender_id === currentDemoUser.user_id;
                        const showAvatar = !isOwn && (
                          index === 0 || 
                          dateMessages[index - 1].sender_id !== message.sender_id
                        );

                        return (
                          <div
                            key={message.id}
                            className={`flex gap-2 animate-fade-in ${
                              isOwn ? 'flex-row-reverse' : 'flex-row'
                            }`}
                          >
                            {/* Avatar */}
                            {!isOwn && (
                              <div className="w-8 flex-shrink-0">
                                {showAvatar && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={message.sender?.avatar_url || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {message.sender?.username?.slice(0, 2).toUpperCase() || '??'}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            )}

                            {/* Message content */}
                            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                              {/* Sender name (for group chats) */}
                              {showAvatar && !isOwn && currentRoom.is_group && (
                                <span className="text-xs text-muted-foreground mb-1 ml-1">
                                  {message.sender?.display_name || message.sender?.username}
                                </span>
                              )}

                              {/* Bubble */}
                              <div
                                className={`message-bubble ${
                                  isOwn ? 'message-bubble-sent' : 'message-bubble-received'
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              </div>

                              {/* Reactions */}
                              {message.reactions && message.reactions.length > 0 && (
                                <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                  {message.reactions.map((reaction, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded-full text-xs bg-muted"
                                    >
                                      {reaction.emoji}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Time and status */}
                              <div className={`flex items-center gap-1 mt-1 text-[10px] text-muted-foreground ${isOwn ? 'flex-row-reverse' : ''}`}>
                                <span>{format(new Date(message.created_at), 'HH:mm')}</span>
                                {isOwn && (
                                  <CheckCheck className="h-3 w-3 text-primary" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-2 p-2 rounded-2xl bg-muted/50 border border-border">
                  <Button variant="ghost" size="icon" className="rounded-xl flex-shrink-0">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="flex-1 bg-transparent border-0 focus-visible:ring-0"
                  />
                  <Button variant="ghost" size="icon" className="rounded-xl flex-shrink-0">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="rounded-xl gradient-primary shadow-glow-sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Welcome to ChatFlow</h3>
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoChat;
