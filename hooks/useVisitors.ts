import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { VisitorLog } from '../types';

export const useVisitors = () => {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('visitors')
        .select('*')
        .order('entry_time', { ascending: false });

      if (fetchError) throw fetchError;

      // Transformar dados para o formato esperado
      const formattedVisitors = (data || []).map((visitor: any) => ({
        ...visitor,
        resident_name: visitor.resident_name || visitor.residentName,
        visitor_count: visitor.visitor_count || visitor.visitorCount || 1,
        visitor_names: visitor.visitor_names || visitor.visitorNames || '',
        entry_time: visitor.entry_time || visitor.entryTime,
        exit_time: visitor.exit_time || visitor.exitTime
      }));

      setVisitors(formattedVisitors);
    } catch (err: any) {
      console.error('Error fetching visitors:', err);
      setError(err.message || 'Erro ao carregar visitantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();

    // Real-time subscription (com tratamento de erro)
    let channel: any = null;
    try {
      channel = supabase
        .channel('visitors-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'visitors' },
          () => {
            fetchVisitors();
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

  const createVisitor = async (visitorData: {
    resident_id?: string;
    resident_name: string;
    unit: string;
    visitor_count?: number;
    visitor_names: string;
    type: 'Visita' | 'Prestador' | 'Delivery';
    doc?: string;
    vehicle?: string;
    plate?: string;
    registered_by?: string;
  }) => {
    try {
      const { data, error: createError } = await supabase
        .from('visitors')
        .insert([{
          ...visitorData,
          visitor_count: visitorData.visitor_count || 1,
          status: 'active'
        }])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        const formatted = {
          ...data,
          resident_name: data.resident_name,
          visitor_count: data.visitor_count || 1,
          visitor_names: data.visitor_names,
          entry_time: data.entry_time,
          exit_time: data.exit_time
        };
        setVisitors(prev => [formatted, ...prev]);
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating visitor:', err);
      return { data: null, error: err.message || 'Erro ao registrar visitante' };
    }
  };

  const checkOutVisitor = async (id: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from('visitors')
        .update({
          status: 'completed',
          exit_time: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setVisitors(prev => prev.map(v => v.id === id ? {
          ...v,
          ...data,
          exit_time: data.exit_time,
          status: 'completed' as const
        } : v));
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error checking out visitor:', err);
      return { data: null, error: err.message || 'Erro ao registrar saída' };
    }
  };

  return {
    visitors,
    loading,
    error,
    createVisitor,
    checkOutVisitor,
    refetch: fetchVisitors
  };
};