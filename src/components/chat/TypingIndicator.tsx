interface TypingUser {
  id: string;
  username: string;
}

interface TypingIndicatorProps {
  users: TypingUser[];
}

const TypingIndicator = ({ users }: TypingIndicatorProps) => {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing`;
    } else if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing`;
    } else {
      return `${users[0].username} and ${users.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <div className="message-bubble message-bubble-received flex items-center gap-2 py-3 px-4">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{getTypingText()}</span>
    </div>
  );
};

export default TypingIndicator;
