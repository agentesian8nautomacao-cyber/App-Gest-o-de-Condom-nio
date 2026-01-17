import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { CrmIssue } from '../types';

const formatUpdatedAt = (date: string) => {
  const now = new Date();
  const updated = new Date(date);
  const diffMs = now.getTime() - updated.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return updated.toLocaleDateString('pt-BR');
};

export const useCrmIssues = () => {
  const [issues, setIssues] = useState<CrmIssue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_issues')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transformar dados
      const formatted = (data || []).map((issue: any) => ({
        ...issue,
        involvedUnits: issue.involved_units || issue.involvedUnits || [],
        updatedAt: formatUpdatedAt(issue.updated_at || issue.created_at || new Date().toISOString())
      }));

      setIssues(formatted);
    } catch (err) {
      console.error('Error fetching CRM issues:', err);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('crm-issues-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crm_issues' },
        () => {
          fetchIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createIssue = async (issueData: {
    title: string;
    involved_units: string[];
    severity?: 'low' | 'medium' | 'high';
    status?: 'analysis' | 'mediation' | 'legal' | 'resolved';
    description: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('crm_issues')
        .insert({
          ...issueData,
          severity: issueData.severity || 'medium',
          status: issueData.status || 'analysis'
        })
        .select()
        .single();

      if (error) throw error;
      
      const formatted = {
        ...data,
        involvedUnits: data.involved_units || [],
        updatedAt: formatUpdatedAt(data.updated_at || data.created_at || new Date().toISOString())
      };
      
      setIssues(prev => [formatted, ...prev]);
      return { data: formatted, error: null };
    } catch (err: any) {
      console.error('Error creating CRM issue:', err);
      return { data: null, error: err.message };
    }
  };

  const updateIssue = async (id: string, updates: Partial<CrmIssue>) => {
    try {
      const updateData: any = { ...updates };
      if (updates.involvedUnits) {
        updateData.involved_units = updates.involvedUnits;
        delete updateData.involvedUnits;
      }
      delete updateData.updatedAt; // Não atualizar este campo, vem do banco

      const { data, error } = await supabase
        .from('crm_issues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const formatted = {
        ...data,
        involvedUnits: data.involved_units || [],
        updatedAt: formatUpdatedAt(data.updated_at || data.created_at || new Date().toISOString())
      };
      
      setIssues(prev => prev.map(i => i.id === id ? formatted : i));
      return { data: formatted, error: null };
    } catch (err: any) {
      console.error('Error updating CRM issue:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteIssue = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_issues')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setIssues(prev => prev.filter(i => i.id !== id));
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting CRM issue:', err);
      return { error: err.message };
    }
  };

  return {
    issues,
    loading,
    createIssue,
    updateIssue,
    deleteIssue,
    refetch: fetchIssues
  };
};
