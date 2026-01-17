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
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);

        // Set role based on user metadata or database lookup
        if (session?.user) {
          await setUserRole(session.user);
        }
      }

      setLoading(false);
    };

    getSession();

    // Listen for auth changes
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
      // Get user role from database
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        // Fallback to user metadata or default
        const roleFromMetadata = user.user_metadata?.role as UserRole;
        setRole(roleFromMetadata || 'PORTEIRO');
      } else {
        setRole(data.role as UserRole);
      }
    } catch (error) {
      console.error('Error setting user role:', error);
      setRole('PORTEIRO'); // Default fallback
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      // First, get the user from database to check credentials
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, password_hash, role')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        return { error: { message: 'Usuário não encontrado' } as AuthError };
      }

      // For now, we'll use a simple password check
      // In production, you should use proper password hashing
      const isValidPassword = password === '123456' && username === 'portaria' ||
                             password === 'admin123' && username === 'admin' ||
                             password === 'dev' && username === 'desenvolvedor';

      if (!isValidPassword) {
        return { error: { message: 'Credenciais inválidas' } as AuthError };
      }

      // Create a custom auth session (since we're using custom auth)
      // In a real implementation, you'd use Supabase Auth with proper email/password
      const mockUser = {
        id: `mock-${Date.now()}`,
        email: `${username}@qualivida.local`,
        user_metadata: { role: userData.role }
      };

      // Store auth state in localStorage for persistence
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: mockUser,
        role: userData.role
      }));

      setUser(mockUser as any);
      setRole(userData.role as UserRole);

      return { error: null };
    } catch (error) {
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