import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Reply,
  Copy,
  Edit,
  Trash2,
  Smile,
  Check,
  CheckCheck,
} from 'lucide-react';
import { format } from 'date-fns';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
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

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

const MessageBubble = ({ message, isOwn, showAvatar }: MessageBubbleProps) => {
  const { user } = useAuth();
  const { addReaction, removeReaction, editMessage, deleteMessage } = useChat();
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');

  const handleReaction = async (emoji: string) => {
    const existingReaction = message.reactions?.find(
      r => r.user_id === user?.id && r.emoji === emoji
    );

    if (existingReaction) {
      await removeReaction(message.id, emoji);
    } else {
      await addReaction(message.id, emoji);
    }
    setShowReactions(false);
  };

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
    }
  };

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await editMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteMessage(message.id);
  };

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction.user_id);
    return acc;
  }, {} as Record<string, string[]>) || {};

  return (
    <div
      className={`flex gap-2 group animate-fade-in ${
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
        {showAvatar && !isOwn && (
          <span className="text-xs text-muted-foreground mb-1 ml-1">
            {message.sender?.display_name || message.sender?.username}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`relative group/bubble ${
            isOwn ? 'message-bubble-sent' : 'message-bubble-received'
          } message-bubble`}
        >
          {/* Message text */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                className="bg-transparent border-none outline-none flex-1 min-w-[200px]"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleEdit}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : message.is_deleted ? (
            <span className="italic opacity-70">This message was deleted</span>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Actions (on hover) */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1 ${
              isOwn ? '-left-24' : '-right-24'
            }`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-background shadow-sm"
              onClick={() => setShowReactions(!showReactions)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full bg-background shadow-sm"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                {isOwn && !message.is_deleted && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick reactions popup */}
          {showReactions && (
            <div
              className={`absolute bottom-full mb-2 flex items-center gap-1 p-1.5 rounded-full bg-card shadow-lg border border-border ${
                isOwn ? 'right-0' : 'left-0'
              }`}
            >
              {QUICK_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(groupedReactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                  users.includes(user?.id || '')
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span>{emoji}</span>
                <span>{users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Time and status */}
        <div className={`flex items-center gap-1 mt-1 text-[10px] text-muted-foreground ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span>{format(new Date(message.created_at), 'HH:mm')}</span>
          {message.is_edited && <span>• edited</span>}
          {isOwn && (
            <CheckCheck className="h-3 w-3 text-primary" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
