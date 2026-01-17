import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Note } from '../types';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      setNotes(data || []);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError(err.message || 'Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();

    // Real-time subscription
    const channel = supabase
      .channel('notes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notes' },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createNote = async (noteData: {
    content: string;
    category?: string;
    scheduled?: string;
    completed?: boolean;
    created_by?: string;
  }) => {
    try {
      const { data, error: createError } = await supabase
        .from('notes')
        .insert([{
          ...noteData,
          completed: noteData.completed || false
        }])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setNotes(prev => [data, ...prev]);
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating note:', err);
      return { data: null, error: err.message || 'Erro ao criar nota' };
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setNotes(prev => prev.map(n => n.id === id ? data : n));
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating note:', err);
      return { data: null, error: err.message || 'Erro ao atualizar nota' };
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setNotes(prev => prev.filter(n => n.id !== id));
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting note:', err);
      return { error: err.message || 'Erro ao deletar nota' };
    }
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes
  };
};