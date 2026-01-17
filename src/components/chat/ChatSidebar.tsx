import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  Settings, 
  LogOut, 
  MessageSquare,
  Users,
  Hash
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import NewChatDialog from './NewChatDialog';

const ChatSidebar = () => {
  const { user, signOut } = useAuth();
  const { rooms, currentRoom, setCurrentRoom, loading } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  const filteredRooms = rooms.filter(room => {
    const searchLower = searchQuery.toLowerCase();
    if (room.is_group) {
      return room.name?.toLowerCase().includes(searchLower);
    }
    // For DMs, search by other user's name
    const otherMember = room.members?.find(m => m.user_id !== user?.id);
    return otherMember?.profile?.username?.toLowerCase().includes(searchLower) ||
           otherMember?.profile?.display_name?.toLowerCase().includes(searchLower);
  });

  const getRoomDisplayInfo = (room: typeof rooms[0]) => {
    if (room.is_group) {
      return {
        name: room.name || 'Group Chat',
        avatar: room.avatar_url,
        initials: (room.name || 'GC').slice(0, 2).toUpperCase(),
        isOnline: false,
      };
    }

    const otherMember = room.members?.find(m => m.user_id !== user?.id);
    return {
      name: otherMember?.profile?.display_name || otherMember?.profile?.username || 'Unknown',
      avatar: otherMember?.profile?.avatar_url,
      initials: (otherMember?.profile?.username || 'U').slice(0, 2).toUpperCase(),
      isOnline: otherMember?.profile?.is_online || false,
    };
  };

  return (
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
            onClick={() => setShowNewChat(true)}
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
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-sidebar-accent" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-sidebar-accent rounded w-24" />
                    <div className="h-3 bg-sidebar-accent rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-sidebar-accent flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No conversations yet</p>
              <Button
                variant="link"
                className="mt-2 text-primary"
                onClick={() => setShowNewChat(true)}
              >
                Start a new chat
              </Button>
            </div>
          ) : (
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
          )}
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <NewChatDialog open={showNewChat} onOpenChange={setShowNewChat} />
    </div>
  );
};

export default ChatSidebar;
