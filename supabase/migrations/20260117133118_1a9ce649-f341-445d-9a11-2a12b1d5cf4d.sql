-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  status_message TEXT DEFAULT 'Hey there! I am using ChatFlow',
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  description TEXT,
  avatar_url TEXT,
  is_group BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room members table
CREATE TABLE public.room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  is_muted BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create read receipts table
CREATE TABLE public.read_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create blocked users table
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat rooms policies
CREATE POLICY "Users can view rooms they are members of" ON public.chat_rooms FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.room_members WHERE room_id = id AND user_id = auth.uid()));
CREATE POLICY "Users can create rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Room admins can update rooms" ON public.chat_rooms FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.room_members WHERE room_id = id AND user_id = auth.uid() AND role = 'admin'));

-- Room members policies
CREATE POLICY "Users can view room members of their rooms" ON public.room_members FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.room_members rm WHERE rm.room_id = room_id AND rm.user_id = auth.uid()));
CREATE POLICY "Room admins can manage members" ON public.room_members FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.room_members WHERE room_id = room_members.room_id AND user_id = auth.uid() AND role IN ('admin', 'moderator'))
  OR auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.room_members FOR DELETE 
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.room_members WHERE room_id = room_members.room_id AND user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can update their own membership" ON public.room_members FOR UPDATE 
  USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their rooms" ON public.messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.room_members WHERE room_id = messages.room_id AND user_id = auth.uid()));
CREATE POLICY "Users can send messages to their rooms" ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.room_members WHERE room_id = messages.room_id AND user_id = auth.uid()));
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE 
  USING (auth.uid() = sender_id);
CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE 
  USING (auth.uid() = sender_id);

-- Message reactions policies
CREATE POLICY "Users can view reactions in their rooms" ON public.message_reactions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.messages m JOIN public.room_members rm ON m.room_id = rm.room_id WHERE m.id = message_id AND rm.user_id = auth.uid()));
CREATE POLICY "Users can add reactions" ON public.message_reactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their reactions" ON public.message_reactions FOR DELETE 
  USING (auth.uid() = user_id);

-- Read receipts policies
CREATE POLICY "Users can view read receipts in their rooms" ON public.read_receipts FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.messages m JOIN public.room_members rm ON m.room_id = rm.room_id WHERE m.id = message_id AND rm.user_id = auth.uid()));
CREATE POLICY "Users can create their own read receipts" ON public.read_receipts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Blocked users policies
CREATE POLICY "Users can view their blocked users" ON public.blocked_users FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can block others" ON public.blocked_users FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can unblock others" ON public.blocked_users FOR DELETE USING (auth.uid() = blocker_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON public.chat_rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;