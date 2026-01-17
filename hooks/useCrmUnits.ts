import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { CrmUnit } from '../types';

export const useCrmUnits = () => {
  const [units, setUnits] = useState<CrmUnit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_units')
        .select('*')
        .order('unit', { ascending: true });

      if (error) throw error;
      
      // Transformar dados
      const formatted = (data || []).map((unit: any) => ({
        ...unit,
        residentName: unit.resident_name || unit.residentName,
        npsScore: unit.nps_score || unit.npsScore,
        lastIncident: unit.last_incident ? new Date(unit.last_incident).toLocaleDateString('pt-BR') : undefined
      }));

      setUnits(formatted);
    } catch (err) {
      console.error('Error fetching CRM units:', err);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('crm-units-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crm_units' },
        () => {
          fetchUnits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createUnit = async (unitData: {
    unit: string;
    floor?: string;
    resident_id?: string;
    resident_name: string;
    status?: 'calm' | 'warning' | 'critical';
    tags?: string[];
    last_incident?: string;
    nps_score?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('crm_units')
        .insert({
          ...unitData,
          status: unitData.status || 'calm',
          tags: unitData.tags || [],
          nps_score: unitData.nps_score || 100
        })
        .select()
        .single();

      if (error) throw error;
      
      setUnits(prev => [...prev, { ...data, residentName: data.resident_name, npsScore: data.nps_score }]);
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating CRM unit:', err);
      return { data: null, error: err.message };
    }
  };

  const updateUnit = async (id: string, updates: Partial<CrmUnit>) => {
    try {
      const updateData: any = { ...updates };
      if (updates.residentName) {
        updateData.resident_name = updates.residentName;
        delete updateData.residentName;
      }
      if (updates.npsScore !== undefined) {
        updateData.nps_score = updates.npsScore;
        delete updateData.npsScore;
      }

      const { data, error } = await supabase
        .from('crm_units')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setUnits(prev => prev.map(u => u.id === id ? { ...data, residentName: data.resident_name, npsScore: data.nps_score } : u));
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating CRM unit:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteUnit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_units')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setUnits(prev => prev.filter(u => u.id !== id));
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting CRM unit:', err);
      return { error: err.message };
    }
  };

  return {
    units,
    loading,
    createUnit,
    updateUnit,
    deleteUnit,
    refetch: fetchUnits
  };
};
