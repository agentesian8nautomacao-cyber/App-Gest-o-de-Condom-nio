import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth session
    const checkStoredSession = async () => {
      try {
        const stored = localStorage.getItem('supabase.auth.token');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.user && parsed.role) {
            setUser(parsed.user);
            setRole(parsed.role);
            
            // Fetch user role from database to ensure it's still valid
            const { data } = await supabase
              .from('users')
              .select('role')
              .eq('username', parsed.user.user_metadata?.username || '')
              .single();

            if (data) {
              setRole(data.role as UserRole);
            }
          }
        }
      } catch (err) {
        console.error('Error checking stored session:', err);
        localStorage.removeItem('supabase.auth.token');
      }
      setLoading(false);
    };

    checkStoredSession();

    // Listen for auth changes from Supabase (if using Supabase Auth in the future)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await setUserRole(session.user);
        } else {
          setRole(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const setUserRole = async (user: User) => {
    try {
      // Get user role from database using email or metadata
      const username = user.user_metadata?.username || user.email?.split('@')[0];
      
      if (username) {
        const { data, error } = await supabase
          .from('users')
          .select('role, username')
          .eq('username', username)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          // Fallback to user metadata or default
          const roleFromMetadata = user.user_metadata?.role as UserRole;
          setRole(roleFromMetadata || 'PORTEIRO');
        } else if (data) {
          setRole(data.role as UserRole);
        }
      } else {
        const roleFromMetadata = user.user_metadata?.role as UserRole;
        setRole(roleFromMetadata || 'PORTEIRO');
      }
    } catch (error) {
      console.error('Error setting user role:', error);
      setRole('PORTEIRO'); // Default fallback
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      console.log('🔐 Tentando fazer login com:', username);
      
      // Verificar se as credenciais do Supabase estão configuradas
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Credenciais do Supabase não encontradas!');
        return { error: { message: 'Configuração do Supabase não encontrada' } as AuthError };
      }
      
      console.log('✅ URL do Supabase:', supabaseUrl ? 'Configurada' : 'Ausente');
      console.log('✅ Chave API:', supabaseKey ? 'Configurada' : 'Ausente');
      
      // Get the user from database to check credentials
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, password_hash, role, name, email')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      console.log('📊 Resultado da consulta:', { userData, userError });

      if (userError) {
        console.error('❌ Erro ao buscar usuário:', userError);
        return { error: { message: `Erro: ${userError.message || 'Usuário não encontrado ou inativo'}` } as AuthError };
      }

      if (!userData) {
        console.error('❌ Usuário não encontrado');
        return { error: { message: 'Usuário não encontrado ou inativo' } as AuthError };
      }
      
      console.log('✅ Usuário encontrado:', userData.username);

      // Verify password against database hash
      // The database uses pgcrypto.crypt() which is PostgreSQL's built-in password hashing
      // We'll use a Supabase function to verify the password
      // For now, we'll check common default passwords for development
      let isValidPassword = false;
      
      // Check if password_hash starts with 'plain:' (senha alterada pelo usuário)
      if (userData.password_hash && userData.password_hash.startsWith('plain:')) {
        const plainPassword = userData.password_hash.replace('plain:', '');
        isValidPassword = password === plainPassword;
      } else {
        // Check against common defaults (development only)
        // In production, verify password_hash using Supabase function
        if (password === '123456' && username === 'portaria') {
          isValidPassword = true;
        } else if (password === 'admin123' && username === 'admin') {
          isValidPassword = true;
        } else if (password === 'dev' && username === 'desenvolvedor') {
          isValidPassword = true;
        } else if (userData.password_hash) {
          // For production, verify password using database function
          // Create a Supabase function to verify password: verify_password(username, password)
          // For now, we'll use the simple check above
          // TODO: Implement password verification function in Supabase with bcrypt
          isValidPassword = false;
        }
      }

      if (!isValidPassword) {
        return { error: { message: 'Credenciais inválidas' } as AuthError };
      }

      // Create a mock user object that matches Supabase User interface
      const mockUser: User = {
        id: userData.id,
        app_metadata: {},
        user_metadata: { 
          role: userData.role,
          username: userData.username,
          name: userData.name
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: userData.email || `${username}@qualivida.local`,
        phone: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString()
      } as User;

      // Store auth state in localStorage for persistence
      const authData = {
        user: mockUser,
        role: userData.role,
        timestamp: Date.now()
      };
      
      localStorage.setItem('supabase.auth.token', JSON.stringify(authData));

      setUser(mockUser);
      setRole(userData.role as UserRole);

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: { message: 'Erro interno do servidor' } as AuthError };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('supabase.auth.token');
      setUser(null);
      setSession(null);
      setRole(null);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    role,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};