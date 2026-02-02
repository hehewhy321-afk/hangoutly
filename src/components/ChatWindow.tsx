import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface ChatSession {
  id: string;
  booking_id: string;
  user_id: string;
  companion_id: string;
  starts_at: string;
  ends_at: string;
  grace_period_ends_at: string;
  is_active: boolean;
}

interface ChatWindowProps {
  chatId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  onClose: () => void;
}

export const ChatWindow = ({ chatId, otherUserName, otherUserAvatar, onClose }: ChatWindowProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [chatStatus, setChatStatus] = useState<'not_started' | 'active' | 'ended'>('not_started');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatData();
    const unsubscribe = subscribeToMessages();
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatSession) {
      updateChatStatus();
      const interval = setInterval(updateChatStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [chatSession]);

  const fetchChatData = async () => {
    setIsLoading(true);
    try {
      // Fetch chat session
      const { data: chat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      setChatSession(chat);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateChatStatus = () => {
    if (!chatSession) return;

    const now = new Date();
    const startsAt = new Date(chatSession.starts_at);
    const gracePeriodEndsAt = new Date(chatSession.grace_period_ends_at);

    if (isBefore(now, startsAt)) {
      setChatStatus('not_started');
    } else if (isAfter(now, gracePeriodEndsAt)) {
      setChatStatus('ended');
    } else {
      setChatStatus('active');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || chatStatus !== 'active') return;

    setIsSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getTimeRemaining = () => {
    if (!chatSession) return '';
    
    const now = new Date();
    const startsAt = new Date(chatSession.starts_at);
    const gracePeriodEndsAt = new Date(chatSession.grace_period_ends_at);

    if (chatStatus === 'not_started') {
      return `Chat opens ${formatDistanceToNow(startsAt, { addSuffix: true })}`;
    } else if (chatStatus === 'active') {
      return `${formatDistanceToNow(gracePeriodEndsAt)} remaining`;
    } else {
      return 'Chat has ended';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed bottom-4 right-4 w-96 h-[500px] z-50 flex flex-col"
    >
      <div className="liquid-glass h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {otherUserAvatar ? (
                <img src={otherUserAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-semibold">{otherUserName[0]}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{otherUserName}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {getTimeRemaining()}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Status Banner */}
        {chatStatus !== 'active' && (
          <div className={`px-4 py-2 text-center text-sm ${
            chatStatus === 'not_started' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {chatStatus === 'not_started' 
              ? 'Chat will open when the booking starts'
              : 'This chat session has ended'}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={chatStatus === 'active' ? 'Type a message...' : 'Chat not available'}
              disabled={chatStatus !== 'active'}
              className="flex-1"
            />
            <Button
              variant="warm"
              size="icon"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || chatStatus !== 'active' || isSending}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
