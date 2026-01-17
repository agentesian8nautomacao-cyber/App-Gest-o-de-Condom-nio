import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Occurrence } from '../types';

export const useOccurrences = () => {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOccurrences = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('occurrences')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      // Transformar dados
      const formatted = (data || []).map((occ: any) => ({
        ...occ,
        resident_name: occ.resident_name || occ.residentName,
        reported_by: occ.reported_by || occ.reportedBy,
        date: occ.date || occ.created_at
      }));

      setOccurrences(formatted);
    } catch (err: any) {
      console.error('Error fetching occurrences:', err);
      setError(err.message || 'Erro ao carregar ocorrências');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccurrences();

    // Real-time subscription (com tratamento de erro)
    let channel: any = null;
    try {
      channel = supabase
        .channel('occurrences-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'occurrences' },
          () => {
            fetchOccurrences();
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

  const createOccurrence = async (occurrenceData: {
    resident_id?: string;
    resident_name: string;
    unit: string;
    description: string;
    status?: 'Aberto' | 'Em Andamento' | 'Resolvido';
    reported_by: string;
    reported_by_user_id?: string;
  }) => {
    try {
      const { data, error: createError } = await supabase
        .from('occurrences')
        .insert([{
          ...occurrenceData,
          status: occurrenceData.status || 'Aberto'
        }])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setOccurrences(prev => [data, ...prev]);
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating occurrence:', err);
      return { data: null, error: err.message || 'Erro ao criar ocorrência' };
    }
  };

  const updateOccurrence = async (id: string, updates: Partial<Occurrence>) => {
    try {
      const updateData: any = { ...updates };
      
      // Se estiver resolvendo, adicionar resolved_at
      if (updates.status === 'Resolvido' && !updates.resolved_at) {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error: updateError } = await supabase
        .from('occurrences')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setOccurrences(prev => prev.map(o => o.id === id ? data : o));
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating occurrence:', err);
      return { data: null, error: err.message || 'Erro ao atualizar ocorrência' };
    }
  };

  const resolveOccurrence = async (id: string, resolvedBy?: string) => {
    return updateOccurrence(id, {
      status: 'Resolvido',
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy
    } as any);
  };

  return {
    occurrences,
    loading,
    error,
    createOccurrence,
    updateOccurrence,
    resolveOccurrence,
    refetch: fetchOccurrences
  };
};