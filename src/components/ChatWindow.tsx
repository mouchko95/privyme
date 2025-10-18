import { useEffect, useState, useRef } from 'react';
import { supabase, type Message, type Conversation, type Profile, type FanWallet, type CreatorSettings } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

type ConversationWithProfiles = Conversation & {
  fan: Profile;
  creator: Profile;
};

type ChatWindowProps = {
  conversation: ConversationWithProfiles;
  onBack: () => void;
};

export function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<FanWallet | null>(null);
  const [creatorSettings, setCreatorSettings] = useState<CreatorSettings | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();
  const { t } = useLanguage();

  const isFan = profile?.id === conversation.fan_id;
  const otherUser = isFan ? conversation.creator : conversation.fan;

  useEffect(() => {
    fetchMessages();
    if (isFan) {
      fetchWallet();
      fetchCreatorSettings();
    }

    const channel = supabase
      .channel(`messages_${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const fetchWallet = async () => {
    const { data } = await supabase
      .from('fan_wallets')
      .select('*')
      .eq('user_id', profile!.id)
      .maybeSingle();
    setWallet(data);
  };

  const fetchCreatorSettings = async () => {
    const { data } = await supabase
      .from('creator_settings')
      .select('*')
      .eq('user_id', conversation.creator_id)
      .maybeSingle();
    setCreatorSettings(data);
  };

  const payEntryFee = async () => {
    if (!wallet || !creatorSettings) return;

    const fee = profile?.currency === 'EUR' ? creatorSettings.entry_fee_eur : creatorSettings.entry_fee_usd;
    const availableCredits = profile?.currency === 'EUR' ? wallet.credits_eur : wallet.credits_usd;

    if (availableCredits < fee) {
      alert(t('insufficientCredits'));
      return;
    }

    const platformFee = fee * 0.05;
    const creatorAmount = fee - platformFee;

    const { error: walletError } = await supabase
      .from('fan_wallets')
      .update({
        credits_eur: profile?.currency === 'EUR' ? wallet.credits_eur - fee : wallet.credits_eur,
        credits_usd: profile?.currency === 'USD' ? wallet.credits_usd - fee : wallet.credits_usd,
      })
      .eq('user_id', profile!.id);

    if (walletError) {
      console.error('Error updating wallet:', walletError);
      return;
    }

    const { error: creatorError } = await supabase
      .from('creator_settings')
      .update({
        pending_payout_eur: profile?.currency === 'EUR' ? creatorSettings.pending_payout_eur + creatorAmount : creatorSettings.pending_payout_eur,
        pending_payout_usd: profile?.currency === 'USD' ? creatorSettings.pending_payout_usd + creatorAmount : creatorSettings.pending_payout_usd,
      })
      .eq('user_id', conversation.creator_id);

    if (creatorError) {
      console.error('Error updating creator settings:', creatorError);
      return;
    }

    const { error: convError } = await supabase
      .from('conversations')
      .update({
        entry_paid: true,
        entry_amount: fee,
        entry_currency: profile?.currency,
      })
      .eq('id', conversation.id);

    if (convError) {
      console.error('Error updating conversation:', convError);
      return;
    }

    await supabase.from('transactions').insert({
      user_id: profile!.id,
      type: 'entry_fee',
      amount: fee,
      currency: profile?.currency || 'EUR',
      platform_fee: platformFee,
      creator_id: conversation.creator_id,
      conversation_id: conversation.id,
      status: 'completed',
      payment_method: 'credits',
    });

    conversation.entry_paid = true;
    fetchWallet();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile) return;

    if (isFan && !conversation.entry_paid) {
      alert(t('payEntryFee'));
      return;
    }

    if (isFan && wallet && creatorSettings) {
      const messagePrice = profile.currency === 'EUR' ? creatorSettings.message_price_eur : creatorSettings.message_price_usd;
      const availableCredits = profile.currency === 'EUR' ? wallet.credits_eur : wallet.credits_usd;

      if (availableCredits < messagePrice) {
        alert(t('insufficientCredits'));
        return;
      }

      const platformFee = messagePrice * 0.05;
      const creatorAmount = messagePrice - platformFee;

      const { error: walletError } = await supabase
        .from('fan_wallets')
        .update({
          credits_eur: profile.currency === 'EUR' ? wallet.credits_eur - messagePrice : wallet.credits_eur,
          credits_usd: profile.currency === 'USD' ? wallet.credits_usd - messagePrice : wallet.credits_usd,
        })
        .eq('user_id', profile.id);

      if (walletError) {
        console.error('Error updating wallet:', walletError);
        return;
      }

      await supabase
        .from('creator_settings')
        .update({
          pending_payout_eur: profile.currency === 'EUR' ? creatorSettings.pending_payout_eur + creatorAmount : creatorSettings.pending_payout_eur,
          pending_payout_usd: profile.currency === 'USD' ? creatorSettings.pending_payout_usd + creatorAmount : creatorSettings.pending_payout_usd,
        })
        .eq('user_id', conversation.creator_id);

      fetchWallet();
    }

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: profile.id,
      content: newMessage,
      media_type: 'text',
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);
    }
  };

  const unlockMedia = async (message: Message) => {
    if (!wallet || !profile) return;

    const unlockPrice = profile.currency === 'EUR' ? message.unlock_price_eur : message.unlock_price_usd;
    const availableCredits = profile.currency === 'EUR' ? wallet.credits_eur : wallet.credits_usd;

    if (availableCredits < unlockPrice) {
      alert(t('insufficientCredits'));
      return;
    }

    const platformFee = unlockPrice * 0.05;

    const { error: walletError } = await supabase
      .from('fan_wallets')
      .update({
        credits_eur: profile.currency === 'EUR' ? wallet.credits_eur - unlockPrice : wallet.credits_eur,
        credits_usd: profile.currency === 'USD' ? wallet.credits_usd - unlockPrice : wallet.credits_usd,
      })
      .eq('user_id', profile.id);

    if (walletError) {
      console.error('Error updating wallet:', walletError);
      return;
    }

    await supabase.from('transactions').insert({
      user_id: profile.id,
      type: 'media_unlock',
      amount: unlockPrice,
      currency: profile.currency,
      platform_fee: platformFee,
      creator_id: conversation.creator_id,
      conversation_id: conversation.id,
      message_id: message.id,
      status: 'completed',
      payment_method: 'credits',
    });

    fetchWallet();
    alert(t('mediaUnlocked'));
  };

  if (loading) {
    return <div className="chat-loading">{t('loading')}</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button onClick={onBack} className="back-button">←</button>
        <div className="chat-header-info">
          <div className="chat-header-name">{otherUser.display_name}</div>
          <div className="chat-header-username">@{otherUser.username}</div>
        </div>
      </div>

      {isFan && !conversation.entry_paid && (
        <div className="entry-fee-banner">
          <p>{t('payEntryFee')}: {profile?.currency} {profile?.currency === 'EUR' ? creatorSettings?.entry_fee_eur : creatorSettings?.entry_fee_usd}</p>
          <button onClick={payEntryFee} className="btn-primary">
            {t('pay')}
          </button>
        </div>
      )}

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender_id === profile?.id ? 'message-sent' : 'message-received'}`}
          >
            {message.media_type === 'text' ? (
              <div className="message-bubble">{message.content}</div>
            ) : message.is_locked && message.sender_id !== profile?.id ? (
              <div className="message-locked" onClick={() => unlockMedia(message)}>
                <div className="locked-overlay">
                  🔒 {t('unlock')} ({profile?.currency} {profile?.currency === 'EUR' ? message.unlock_price_eur : message.unlock_price_usd})
                </div>
              </div>
            ) : (
              <div className="message-media">
                {message.media_type === 'photo' && <img src={message.media_url || ''} alt="Photo" />}
                {message.media_type === 'video' && <video src={message.media_url || ''} controls />}
                {message.media_type === 'voice' && <audio src={message.media_url || ''} controls />}
              </div>
            )}
            <div className="message-time">
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {(!isFan || conversation.entry_paid) && (
        <form onSubmit={sendMessage} className="message-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('typeMessage')}
            className="message-input"
          />
          <button type="submit" className="send-button">
            ➤
          </button>
        </form>
      )}
    </div>
  );
}
