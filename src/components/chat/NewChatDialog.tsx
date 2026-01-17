import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, User, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_online: boolean;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewChatDialog = ({ open, onOpenChange }: NewChatDialogProps) => {
  const { user } = useAuth();
  const { searchUsers, createRoom, setCurrentRoom } = useChat();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results.filter(p => p.user_id !== user?.id));
    setSearching(false);
  };

  const toggleUserSelection = (profile: Profile) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.user_id === profile.user_id);
      if (exists) {
        return prev.filter(u => u.user_id !== profile.user_id);
      }
      return [...prev, profile];
    });
  };

  const handleCreateDM = async (profile: Profile) => {
    setLoading(true);
    const room = await createRoom(null, false, [profile.user_id]);
    setLoading(false);
    
    if (room) {
      setCurrentRoom(room);
      onOpenChange(false);
      resetState();
    } else {
      toast.error('Failed to create chat');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    if (selectedUsers.length < 1) {
      toast.error('Please select at least one member');
      return;
    }

    setLoading(true);
    const room = await createRoom(
      groupName,
      true,
      selectedUsers.map(u => u.user_id)
    );
    setLoading(false);

    if (room) {
      setCurrentRoom(room);
      onOpenChange(false);
      resetState();
      toast.success('Group created!');
    } else {
      toast.error('Failed to create group');
    }
  };

  const resetState = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dm" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="dm" className="gap-2">
              <User className="h-4 w-4" />
              Direct Message
            </TabsTrigger>
            <TabsTrigger value="group" className="gap-2">
              <Users className="h-4 w-4" />
              Group Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dm" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[300px]">
              {searching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map(profile => (
                    <button
                      key={profile.user_id}
                      onClick={() => handleCreateDM(profile)}
                      disabled={loading}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback>
                            {profile.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                          profile.is_online ? 'status-online' : 'status-offline'
                        }`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{profile.display_name || profile.username}</p>
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length > 1 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mb-2" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2" />
                  <p>Search for users to start chatting</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Add Members</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(profile => (
                  <div
                    key={profile.user_id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary"
                  >
                    <span className="text-sm font-medium">{profile.username}</span>
                    <button
                      onClick={() => toggleUserSelection(profile)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <ScrollArea className="h-[200px]">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map(profile => {
                    const isSelected = selectedUsers.some(u => u.user_id === profile.user_id);
                    return (
                      <button
                        key={profile.user_id}
                        onClick={() => toggleUserSelection(profile)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-accent'
                        }`}
                      >
                        <Avatar>
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback>
                            {profile.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{profile.display_name || profile.username}</p>
                          <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : searchQuery.length > 1 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mb-2" />
                  <p>No users found</p>
                </div>
              ) : null}
            </ScrollArea>

            <Button
              onClick={handleCreateGroup}
              disabled={loading || !groupName.trim() || selectedUsers.length === 0}
              className="w-full gradient-primary"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Create Group
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;
