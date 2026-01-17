import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Staff } from '../types';

export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setStaff(data || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();

    // Subscribe to real-time changes (com tratamento de erro)
    let channel: any = null;
    try {
      channel = supabase
        .channel('staff-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'staff' },
          () => {
            fetchStaff();
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

  const createStaff = async (staffData: {
    name: string;
    role: string;
    status?: 'Ativo' | 'Férias' | 'Licença';
    shift?: 'Comercial' | 'Manhã' | 'Tarde' | 'Noite' | 'Madrugada';
    phone?: string;
    email?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          ...staffData,
          status: staffData.status || 'Ativo',
          shift: staffData.shift || 'Comercial'
        })
        .select()
        .single();

      if (error) throw error;
      
      setStaff(prev => [...prev, data]);
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating staff:', err);
      return { data: null, error: err.message };
    }
  };

  const updateStaff = async (id: string, updates: Partial<Staff>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setStaff(prev => prev.map(s => s.id === id ? data : s));
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating staff:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setStaff(prev => prev.filter(s => s.id !== id));
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting staff:', err);
      return { error: err.message };
    }
  };

  return {
    staff,
    loading,
    createStaff,
    updateStaff,
    deleteStaff,
    refetch: fetchStaff
  };
};
