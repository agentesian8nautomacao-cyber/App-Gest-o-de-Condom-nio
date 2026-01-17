import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Resident } from '../types';

export const useResidents = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('residents')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setResidents(data || []);
    } catch (err: any) {
      console.error('Error fetching residents:', err);
      setError(err.message || 'Erro ao carregar moradores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();

    // Real-time subscription (com tratamento de erro)
    let channel: any = null;
    try {
      channel = supabase
        .channel('residents-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'residents' },
          () => {
            fetchResidents();
          }
        )
        .subscribe();
    } catch (error) {
      // Silenciar erros de Realtime - não críticos
      console.debug('Realtime subscription error (non-critical):', error);
    }

    return () => {
      try {
        if (channel) {
          supabase.removeChannel(channel);
        }
      } catch (error) {
        // Silenciar erros ao remover canal
      }
    };
  }, []);

  const createResident = async (resident: Omit<Resident, 'id' | 'created_at'>) => {
    try {
      const { data, error: createError } = await supabase
        .from('residents')
        .insert([resident])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setResidents(prev => [data, ...prev]);
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating resident:', err);
      return { data: null, error: err.message || 'Erro ao criar morador' };
    }
  };

  const updateResident = async (id: string, updates: Partial<Resident>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('residents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setResidents(prev => prev.map(r => r.id === id ? data : r));
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating resident:', err);
      return { data: null, error: err.message || 'Erro ao atualizar morador' };
    }
  };

  const deleteResident = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('residents')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setResidents(prev => prev.filter(r => r.id !== id));
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting resident:', err);
      return { error: err.message || 'Erro ao deletar morador' };
    }
  };

  return {
    residents,
    loading,
    error,
    createResident,
    updateResident,
    deleteResident,
    refetch: fetchResidents
  };
};