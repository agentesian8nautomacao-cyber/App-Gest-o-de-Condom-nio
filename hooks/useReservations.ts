import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Reservation } from '../types';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<any[]>([]);

  const fetchAreas = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('areas')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;
      setAreas(data || []);
    } catch (err: any) {
      console.error('Error fetching areas:', err);
    }
  };

  const fetchReservations = async (date?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('reservations')
        .select(`
          *,
          areas:area_id (name, capacity),
          residents:resident_id (name, unit)
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transformar dados
      const formatted = (data || []).map((res: any) => ({
        ...res,
        area: res.areas?.name || res.area || '',
        area_id: res.area_id || res.area,
        resident: res.residents?.name || res.resident_name || res.resident || '',
        resident_id: res.resident_id || res.resident,
        resident_name: res.resident_name || res.residents?.name,
        unit: res.unit || res.residents?.unit,
        time: `${res.start_time} - ${res.end_time}`,
        date: res.date
      }));

      setReservations(formatted);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError(err.message || 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
    fetchReservations();

    // Real-time subscription (com tratamento de erro)
    let channel: any = null;
    try {
      channel = supabase
        .channel('reservations-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'reservations' },
          () => {
            fetchReservations();
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

  const createReservation = async (reservationData: {
    area_id: string;
    resident_id: string;
    resident_name: string;
    unit: string;
    date: string;
    start_time: string;
    end_time: string;
    status?: 'scheduled' | 'active' | 'completed' | 'canceled';
  }) => {
    try {
      const { data, error: createError } = await supabase
        .from('reservations')
        .insert([{
          ...reservationData,
          status: reservationData.status || 'scheduled'
        }])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        await fetchReservations();
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      return { data: null, error: err.message || 'Erro ao criar reserva' };
    }
  };

  const updateReservation = async (id: string, updates: Partial<Reservation>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        await fetchReservations();
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating reservation:', err);
      return { data: null, error: err.message || 'Erro ao atualizar reserva' };
    }
  };

  return {
    reservations,
    areas,
    loading,
    error,
    createReservation,
    updateReservation,
    refetch: fetchReservations
  };
};