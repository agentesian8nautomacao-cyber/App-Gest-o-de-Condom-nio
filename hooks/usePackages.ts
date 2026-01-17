import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Package, PackageItem } from '../types';

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar packages com items relacionados
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select(`
          *,
          package_items (*)
        `)
        .order('received_at', { ascending: false });

      if (packagesError) throw packagesError;

      // Transformar dados para o formato esperado
      const formattedPackages = (packagesData || []).map((pkg: any) => ({
        ...pkg,
        recipient_name: pkg.recipient_name || pkg.recipient,
        received_at: pkg.received_at || pkg.receivedAt,
        display_time: pkg.display_time || pkg.displayTime,
        deadline_minutes: pkg.deadline_minutes || pkg.deadlineMinutes,
        resident_phone: pkg.resident_phone || pkg.residentPhone,
        items: pkg.package_items || pkg.items || []
      }));

      setPackages(formattedPackages);
    } catch (err: any) {
      console.error('Error fetching packages:', err);
      setError(err.message || 'Erro ao carregar encomendas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();

    // Real-time subscription
    const channel = supabase
      .channel('packages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'packages' },
        () => {
          fetchPackages();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'package_items' },
        () => {
          fetchPackages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createPackage = async (pkgData: {
    recipient_id?: string;
    recipient_name: string;
    unit: string;
    type: string;
    status?: 'Pendente' | 'Entregue';
    deadline_minutes?: number;
    resident_phone?: string;
    items?: Omit<PackageItem, 'id' | 'package_id' | 'created_at'>[];
  }) => {
    try {
      // Formatar display_time
      const now = new Date();
      const displayTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const { items, ...packageData } = pkgData;
      
      const packageToInsert = {
        ...packageData,
        display_time: displayTime,
        status: packageData.status || 'Pendente',
        deadline_minutes: packageData.deadline_minutes || 45
      };

      const { data: newPackage, error: createError } = await supabase
        .from('packages')
        .insert([packageToInsert])
        .select()
        .single();

      if (createError) throw createError;

      // Inserir items se houver
      if (newPackage && items && items.length > 0) {
        const itemsToInsert = items.map(item => ({
          package_id: newPackage.id,
          name: item.name,
          description: item.description || ''
        }));

        const { error: itemsError } = await supabase
          .from('package_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error creating package items:', itemsError);
        }
      }

      await fetchPackages();
      return { data: newPackage, error: null };
    } catch (err: any) {
      console.error('Error creating package:', err);
      return { data: null, error: err.message || 'Erro ao criar encomenda' };
    }
  };

  const updatePackage = async (id: string, updates: Partial<Package>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setPackages(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
      }
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating package:', err);
      return { data: null, error: err.message || 'Erro ao atualizar encomenda' };
    }
  };

  const deliverPackage = async (id: string, deliveredBy?: string) => {
    return updatePackage(id, {
      status: 'Entregue',
      delivered_at: new Date().toISOString(),
      delivered_by: deliveredBy
    } as any);
  };

  return {
    packages,
    loading,
    error,
    createPackage,
    updatePackage,
    deliverPackage,
    refetch: fetchPackages
  };
};