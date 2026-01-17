
import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { signIn, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('portaria');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showIntro, setShowIntro] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setShowIntro(false);
      setShowForm(true);
    }, 2800); 

    return () => clearTimeout(introTimer);
  }, []);

  // Adiciona listener global para tecla Enter (atalho para computadores)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showForm && !loading && !authLoading) {
        handleLogin();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showForm, loading, authLoading, username, password]);

  const handleRoleChange = (role: 'PORTEIRO' | 'SINDICO') => {
    if (role === 'PORTEIRO') {
      setUsername('portaria');
      setPassword('123456');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  const handleLogin = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (loading || authLoading) return;

    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(username, password);

      if (error) {
        setError(error.message);
      }
      // If successful, the auth context will handle the state update
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden">
      {showIntro && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#050505]">
           <h1 className="shimmer-text reveal-teaser text-3xl md:text-5xl font-black text-center whitespace-nowrap px-4">GESTÃO DE CONDOMÍNIO</h1>
        </div>
      )}

      <div className={`relative z-10 w-full max-w-md p-4 transition-all duration-1000 ${showForm ? 'opacity-100' : 'opacity-0 scale-95'}`}>
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          
          <div className="relative z-10">
            <header className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-8 relative">
                 <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl" />
                 <div className="relative z-10 w-full h-full rounded-3xl bg-white flex items-center justify-center shadow-2xl">
                    <ShieldCheck className="w-10 h-10 text-black" />
                 </div>
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">Acesso Restrito</p>
            </header>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
              </div>
            )}

            {/* Botões de seleção de perfil */}
            <div className="mb-8 flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => handleRoleChange('PORTEIRO')}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all ${
                  username === 'portaria'
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                Portaria
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('SINDICO')}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all ${
                  username === 'admin'
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                Síndico
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="text" 
                    placeholder="Usuário" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-white/10 text-white text-sm outline-none focus:border-white transition-all placeholder:text-zinc-700 font-medium"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-12 py-3 bg-transparent border-b border-white/10 text-white text-sm outline-none focus:border-white transition-all placeholder:text-zinc-700 font-medium"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || authLoading}
                className="group w-full py-5 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)' }}
              >
                {(loading || authLoading) ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Entrar no Sistema
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
