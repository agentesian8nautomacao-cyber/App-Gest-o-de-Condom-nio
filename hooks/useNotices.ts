import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Notice, ChatMessage } from '../types';

export const useNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('notices')
        .select('*')
        .order('pinned', { ascending: false })
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      // Transformar dados
      const formatted = (data || []).map((notice: any) => ({
        ...notice,
        author_role: notice.author_role || notice.authorRole,
        date: notice.date || notice.created_at
      }));

      setNotices(formatted);
    } catch (err: any) {
      console.error('Error fetching notices:', err);
      setError(err.message || 'Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(100);

      if (fetchError) throw fetchError;

      const formatted = (data || []).map((msg: any) => ({
        ...msg,
        sender_role: msg.sender_role || msg.senderRole,
        timestamp: msg.timestamp || msg.created_at
      }));

      setChatMessages(formatted);
    } catch (err: any) {
      console.error('Error fetching chat messages:', err);
    }
  };

  useEffect(() => {
    fetchNotices();
    fetchChatMessages();

    // Real-time subscriptions (com tratamento de erro)
    let noticesChannel: any = null;
    let chatChannel: any = null;
    
    try {
      noticesChannel = supabase
        .channel('notices-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notices' },
          () => {
            fetchNotices();
          }
        )
        .subscribe();

      chatChannel = supabase
        .channel('chat-messages-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'chat_messages' },
          () => {
            fetchChatMessages();
          }
        )
        .subscribe();
    } catch (error) {
      // Silenciar erros de Realtime - não críticos
      console.debug('Realtime subscription error (non-critical):', error);
    }

    return () => {
      try {
        if (noticesChannel) {
          supabase.removeChannel(noticesChannel);
        }
        if (chatChannel) {
          supabase.removeChannel(chatChannel);
        }
      } catch (error) {
        // Silenciar erros ao remover canais
      }
    };
  }, []);

  const createNotice = async (noticeData: {
    title: string;
    content: string;
    author: string;
    author_role: 'SINDICO' | 'PORTEIRO';
    author_id?: string;
    category?: 'Urgente' | 'Manutenção' | 'Social' | 'Institucional';
    priority?: 'high' | 'normal';
    pinned?: boolean;
  }) => {
    try {
      const { data, error: createError } = await supabase
        .from('notices')
        .insert([noticeData])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setNotices(prev => [data, ...prev]);
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating notice:', err);
      return { data: null, error: err.message || 'Erro ao criar aviso' };
    }
  };

  const markNoticeAsRead = async (noticeId: string, userId: string) => {
    try {
      const { error: insertError } = await supabase
        .from('notice_reads')
        .insert([{ notice_id: noticeId, user_id: userId }])
        .select();

      if (insertError && insertError.code !== '23505') { // Ignore duplicate key error
        throw insertError;
      }
      return { error: null };
    } catch (err: any) {
      console.error('Error marking notice as read:', err);
      return { error: err.message || 'Erro ao marcar aviso como lido' };
    }
  };

  const sendChatMessage = async (messageData: {
    text: string;
    sender_role: 'SINDICO' | 'PORTEIRO';
    sender_id?: string;
  }) => {
    try {
      const { data, error: createError } = await supabase
        .from('chat_messages')
        .insert([{
          ...messageData,
          read: false
        }])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setChatMessages(prev => [...prev, data]);
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error sending chat message:', err);
      return { data: null, error: err.message || 'Erro ao enviar mensagem' };
    }
  };

  const updateNotice = async (id: string, updates: Partial<Notice>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('notices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        await fetchNotices();
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating notice:', err);
      return { data: null, error: err.message || 'Erro ao atualizar aviso' };
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notices')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchNotices();
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting notice:', err);
      return { error: err.message || 'Erro ao deletar aviso' };
    }
  };

  const clearChatMessages = async () => {
    try {
      // Deletar todas as mensagens do banco
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todas (condição sempre verdadeira)

      if (deleteError) throw deleteError;
      
      // Limpar o estado local
      setChatMessages([]);
      return { error: null };
    } catch (err: any) {
      console.error('Error clearing chat messages:', err);
      return { error: err.message || 'Erro ao limpar conversa' };
    }
  };

  return {
    notices,
    chatMessages,
    loading,
    error,
    createNotice,
    updateNotice,
    deleteNotice,
    markNoticeAsRead,
    sendChatMessage,
    clearChatMessages,
    refetch: fetchNotices
  };
};