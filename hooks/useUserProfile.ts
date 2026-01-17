import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useUserProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (updates: {
    username?: string;
    name?: string;
    email?: string;
    phone?: string;
  }) => {
    if (!user?.id) {
      return { error: 'Usuário não autenticado' };
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      const errorMessage = err.message || 'Erro ao atualizar perfil';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.id) {
      return { error: 'Usuário não autenticado' };
    }

    try {
      setLoading(true);
      setError(null);

      // Primeiro, verificar senha atual
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('username, password_hash')
        .eq('id', user.id)
        .single();

      if (fetchError || !userData) {
        throw new Error('Erro ao buscar dados do usuário');
      }

      // Verificar senha atual (para desenvolvimento: senhas simples)
      // Para produção, use bcrypt.compare
      let isValidPassword = false;
      
      // Check if password_hash starts with 'plain:' (senha alterada pelo usuário)
      if (userData.password_hash && userData.password_hash.startsWith('plain:')) {
        const plainPassword = userData.password_hash.replace('plain:', '');
        isValidPassword = currentPassword === plainPassword;
      } else {
        // Check against common defaults (desenvolvimento)
        if (currentPassword === '123456' && userData.username === 'portaria') {
          isValidPassword = true;
        } else if (currentPassword === 'admin123' && userData.username === 'admin') {
          isValidPassword = true;
        } else if (currentPassword === 'dev' && userData.username === 'desenvolvedor') {
          isValidPassword = true;
        }
      }

      if (!isValidPassword) {
        return { error: 'Senha atual incorreta' };
      }

      // Atualizar senha
      // NOTA: Em produção, você deve hashear a senha antes de salvar
      // Para desenvolvimento, vamos apenas salvar a senha em texto plano
      // IMPORTANTE: Isso é apenas para desenvolvimento! Em produção use bcrypt
      const { data, error: updateError } = await supabase
        .from('users')
        .update({ password_hash: `plain:${newPassword}` }) // Marcador temporário
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating password:', err);
      const errorMessage = err.message || 'Erro ao atualizar senha';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async () => {
    if (!user?.id) {
      return { data: null, error: 'Usuário não autenticado' };
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, username, name, email, phone, role, is_active')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      return { data, error: null };
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      const errorMessage = err.message || 'Erro ao buscar perfil';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    updatePassword,
    getUserProfile,
    loading,
    error
  };
};
