import { useEffect, useState } from 'react';
import { supabase, type Conversation, type Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

type ConversationWithProfiles = Conversation & {
  fan: Profile;
  creator: Profile;
};

type ChatListProps = {
  onSelectChat: (conversation: ConversationWithProfiles) => void;
};

export function ChatList({ onSelectChat }: ChatListProps) {
  const [conversations, setConversations] = useState<ConversationWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!profile) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, fan:profiles!conversations_fan_id_fkey(*), creator:profiles!conversations_creator_id_fkey(*)')
        .or(`fan_id.eq.${profile.id},creator_id.eq.${profile.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        setConversations(data || []);
      }
      setLoading(false);
    };

    fetchConversations();

    const channel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `fan_id=eq.${profile.id},creator_id=eq.${profile.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  if (loading) {
    return <div className="chat-list-loading">{t('loading')}</div>;
  }

  if (conversations.length === 0) {
    return <div className="chat-list-empty">{t('noChats')}</div>;
  }

  return (
    <div className="chat-list">
      {conversations.map((conv) => {
        const otherUser = conv.fan_id === profile?.id ? conv.creator : conv.fan;
        return (
          <div
            key={conv.id}
            className="chat-list-item"
            onClick={() => onSelectChat(conv)}
          >
            <div className="chat-avatar">
              {otherUser.avatar_url ? (
                <img src={otherUser.avatar_url} alt={otherUser.display_name} />
              ) : (
                <div className="chat-avatar-placeholder">
                  {otherUser.display_name[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="chat-info">
              <div className="chat-name">{otherUser.display_name}</div>
              <div className="chat-username">@{otherUser.username}</div>
            </div>
            <div className="chat-time">
              {new Date(conv.last_message_at).toLocaleDateString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
