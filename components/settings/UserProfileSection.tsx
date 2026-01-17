import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Save, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';

const UserProfileSection: React.FC = () => {
  const { user, signOut } = useAuth();
  const { updateProfile, updatePassword, getUserProfile, loading } = useUserProfile();
  
  const [profileData, setProfileData] = useState({
    username: '',
    name: '',
    email: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const result = await getUserProfile();
      if (result.data) {
        setProfileData({
          username: result.data.username || '',
          name: result.data.name || '',
          email: result.data.email || '',
          phone: result.data.phone || ''
        });
      }
    };

    if (user?.id) {
      loadProfile();
    }
  }, [user, getUserProfile]);

  const handleSaveProfile = async () => {
    if (!profileData.username.trim() || !profileData.name.trim()) {
      alert('Usuário e nome são obrigatórios');
      return;
    }

    const result = await updateProfile(profileData);
    
    if (result.error) {
      alert(`Erro ao salvar perfil: ${result.error}`);
      return;
    }

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
    
    // Se o username mudou, fazer logout para refazer login
    if (result.data && result.data.username !== user?.user_metadata?.username) {
      setTimeout(() => {
        alert('Nome de usuário alterado. Faça login novamente com o novo usuário.');
        signOut();
      }, 1000);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError(null);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Preencha todos os campos de senha');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    const result = await updatePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (result.error) {
      setPasswordError(result.error);
      return;
    }

    setPasswordSaved(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setTimeout(() => {
      setPasswordSaved(false);
      alert('Senha alterada com sucesso. Faça login novamente.');
      signOut();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Seção de Perfil */}
      <div className="premium-glass rounded-[32px] p-6 md:p-8 border border-[var(--border-color)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--glass-bg)] flex items-center justify-center border border-[var(--border-color)]">
            <User className="w-6 h-6 text-[var(--text-primary)]" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Perfil do Usuário</h3>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-1">
              Editar informações pessoais
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2 text-[var(--text-secondary)]">
              Nome de Usuário
            </label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              placeholder="Nome de usuário para login"
              className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all font-medium"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2 text-[var(--text-secondary)]">
              Nome Completo
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              placeholder="Seu nome completo"
              className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all font-medium"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2 text-[var(--text-secondary)]">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all font-medium"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2 text-[var(--text-secondary)]">
              Telefone
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all font-medium"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={loading || !profileData.username.trim() || !profileData.name.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-color)] rounded-xl font-black uppercase tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {profileSaved ? (
              <>
                <Check className="w-4 h-4" />
                Salvo!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {loading ? 'Salvando...' : 'Salvar Perfil'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Seção de Alteração de Senha */}
      <div className="premium-glass rounded-[32px] p-6 md:p-8 border border-[var(--border-color)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--glass-bg)] flex items-center justify-center border border-[var(--border-color)]">
            <Lock className="w-6 h-6 text-[var(--text-primary)]" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Alterar Senha</h3>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-1">
              Atualize sua senha de acesso
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {passwordError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm font-medium text-red-400">{passwordError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2 text-[var(--text-secondary)]">
              Senha Atual
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Digite sua senha atual"
                className="w-full px-4 py-3 pr-12 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all font-medium"
                style={{ color: 'var(--text-primary)' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2 text-[var(--text-secondary)]">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, newPassword: e.target.value });
                  setPasswordError(null);
                }}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 pr-12 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all font-medium"
                style={{ color: 'var(--text-primary)' }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2 text-[var(--text-secondary)]">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                  setPasswordError(null);
                }}
                placeholder="Digite a nova senha novamente"
                className="w-full px-4 py-3 pr-12 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--text-primary)]/20 transition-all font-medium"
                style={{ color: 'var(--text-primary)' }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSavePassword}
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
          >
            {passwordSaved ? (
              <>
                <Check className="w-4 h-4" />
                Senha Alterada!
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </>
            )}
          </button>

          <p className="text-xs text-[var(--text-secondary)] mt-4">
            ⚠️ Após alterar a senha ou nome de usuário, você será deslogado e precisará fazer login novamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSection;
