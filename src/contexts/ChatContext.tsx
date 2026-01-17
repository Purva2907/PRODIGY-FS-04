import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  status_message: string | null;
  is_online: boolean;
  last_seen: string;
}

interface ChatRoom {
  id: string;
  name: string | null;
  description: string | null;
  avatar_url: string | null;
  is_group: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  members?: RoomMember[];
  lastMessage?: Message | null;
  unreadCount?: number;
}

interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: string;
  is_muted: boolean;
  joined_at: string;
  last_read_at: string;
  profile?: Profile;
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  reply_to_id: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  reactions?: MessageReaction[];
}

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

interface TypingUser {
  id: string;
  username: string;
}

interface ChatContextType {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Message[];
  typingUsers: TypingUser[];
  profiles: Map<string, Profile>;
  loading: boolean;
  setCurrentRoom: (room: ChatRoom | null) => void;
  sendMessage: (content: string, messageType?: string, fileUrl?: string, fileName?: string, fileSize?: number) => Promise<void>;
  createRoom: (name: string | null, isGroup: boolean, memberIds: string[]) => Promise<ChatRoom | null>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<Profile[]>;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageOffset, setMessageOffset] = useState(0);
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  const MESSAGES_PER_PAGE = 50;

  // Fetch user's rooms
  const fetchRooms = useCallback(async () => {
    if (!user) return;

    const { data: memberData } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('user_id', user.id);

    if (!memberData || memberData.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    const roomIds = memberData.map(m => m.room_id);

    const { data: roomsData } = await supabase
      .from('chat_rooms')
      .select('*')
      .in('id', roomIds)
      .order('updated_at', { ascending: false });

    if (roomsData) {
      // Fetch last message for each room
      const roomsWithDetails = await Promise.all(
        roomsData.map(async (room) => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('*')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const { data: members } = await supabase
            .from('room_members')
            .select('*, profile:profiles(*)')
            .eq('room_id', room.id);

          return {
            ...room,
            lastMessage: lastMsg,
            members: members?.map(m => ({
              ...m,
              profile: m.profile as unknown as Profile
            })) || [],
          };
        })
      );

      setRooms(roomsWithDetails);
    }
    setLoading(false);
  }, [user]);

  // Fetch messages for current room
  const fetchMessages = useCallback(async (roomId: string, offset = 0) => {
    const { data, count } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(*), reactions:message_reactions(*)', { count: 'exact' })
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + MESSAGES_PER_PAGE - 1);

    if (data) {
      const formattedMessages = data.map(msg => ({
        ...msg,
        sender: msg.sender as unknown as Profile,
        reactions: msg.reactions as unknown as MessageReaction[],
      })).reverse();

      if (offset === 0) {
        setMessages(formattedMessages);
      } else {
        setMessages(prev => [...formattedMessages, ...prev]);
      }

      setHasMoreMessages((count || 0) > offset + MESSAGES_PER_PAGE);
      setMessageOffset(offset + data.length);
    }
  }, []);

  // Load more messages
  const loadMoreMessages = async () => {
    if (currentRoom && hasMoreMessages) {
      await fetchMessages(currentRoom.id, messageOffset);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!currentRoom || !user) return;

    // Clean up previous subscriptions
    channels.forEach(ch => ch.unsubscribe());

    // Subscribe to messages
    const messagesChannel = supabase
      .channel(`messages:${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${currentRoom.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newMessage } = await supabase
              .from('messages')
              .select('*, sender:profiles!messages_sender_id_fkey(*), reactions:message_reactions(*)')
              .eq('id', payload.new.id)
              .single();

            if (newMessage) {
              setMessages(prev => [...prev, {
                ...newMessage,
                sender: newMessage.sender as unknown as Profile,
                reactions: newMessage.reactions as unknown as MessageReaction[],
              }]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === payload.new.id
                  ? { ...msg, ...payload.new }
                  : msg
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to typing indicators using presence
    const presenceChannel = supabase
      .channel(`typing:${currentRoom.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const typing: TypingUser[] = [];
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.isTyping && presence.user_id !== user.id) {
              typing.push({ id: presence.user_id, username: presence.username });
            }
          });
        });
        setTypingUsers(typing);
      })
      .subscribe();

    setChannels([messagesChannel, presenceChannel]);

    return () => {
      messagesChannel.unsubscribe();
      presenceChannel.unsubscribe();
    };
  }, [currentRoom, user]);

  // Fetch rooms when user changes
  useEffect(() => {
    if (user) {
      fetchRooms();
    } else {
      setRooms([]);
      setCurrentRoom(null);
      setMessages([]);
    }
  }, [user, fetchRooms]);

  // Fetch messages when current room changes
  useEffect(() => {
    if (currentRoom) {
      setMessages([]);
      setMessageOffset(0);
      setHasMoreMessages(true);
      fetchMessages(currentRoom.id, 0);
    }
  }, [currentRoom, fetchMessages]);

  // Send message
  const sendMessage = async (
    content: string,
    messageType = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number
  ) => {
    if (!user || !currentRoom) return;

    await supabase.from('messages').insert({
      room_id: currentRoom.id,
      sender_id: user.id,
      content,
      message_type: messageType,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
    });

    // Update room's updated_at
    await supabase
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', currentRoom.id);
  };

  // Create room
  const createRoom = async (
    name: string | null,
    isGroup: boolean,
    memberIds: string[]
  ): Promise<ChatRoom | null> => {
    if (!user) return null;

    const { data: room, error } = await supabase
      .from('chat_rooms')
      .insert({
        name: isGroup ? name : null,
        is_group: isGroup,
        created_by: user.id,
      })
      .select()
      .single();

    if (error || !room) return null;

    // Add all members including creator
    const allMemberIds = [...new Set([user.id, ...memberIds])];
    await supabase.from('room_members').insert(
      allMemberIds.map((userId, index) => ({
        room_id: room.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member',
      }))
    );

    await fetchRooms();
    return room;
  };

  // Join room
  const joinRoom = async (roomId: string) => {
    if (!user) return;

    await supabase.from('room_members').insert({
      room_id: roomId,
      user_id: user.id,
    });

    await fetchRooms();
  };

  // Leave room
  const leaveRoom = async (roomId: string) => {
    if (!user) return;

    await supabase
      .from('room_members')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    if (currentRoom?.id === roomId) {
      setCurrentRoom(null);
    }

    await fetchRooms();
  };

  // Set typing indicator
  const setTyping = async (isTyping: boolean) => {
    if (!currentRoom || !user) return;

    const channel = supabase.channel(`typing:${currentRoom.id}`);
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single();

    await channel.track({
      user_id: user.id,
      username: profile?.username || 'Unknown',
      isTyping,
    });
  };

  // Add reaction
  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    await supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: user.id,
      emoji,
    });

    // Refresh message reactions
    const { data } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId);

    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, reactions: data as MessageReaction[] }
          : msg
      )
    );
  };

  // Remove reaction
  const removeReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);

    // Refresh message reactions
    const { data } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId);

    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, reactions: data as MessageReaction[] }
          : msg
      )
    );
  };

  // Edit message
  const editMessage = async (messageId: string, content: string) => {
    if (!user) return;

    await supabase
      .from('messages')
      .update({ content, is_edited: true })
      .eq('id', messageId)
      .eq('sender_id', user.id);
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    await supabase
      .from('messages')
      .update({ is_deleted: true, content: 'This message was deleted' })
      .eq('id', messageId)
      .eq('sender_id', user.id);
  };

  // Search users
  const searchUsers = async (query: string): Promise<Profile[]> => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10);

    return (data as Profile[]) || [];
  };

  return (
    <ChatContext.Provider
      value={{
        rooms,
        currentRoom,
        messages,
        typingUsers,
        profiles,
        loading,
        setCurrentRoom,
        sendMessage,
        createRoom,
        joinRoom,
        leaveRoom,
        setTyping,
        addReaction,
        removeReaction,
        editMessage,
        deleteMessage,
        searchUsers,
        loadMoreMessages,
        hasMoreMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
