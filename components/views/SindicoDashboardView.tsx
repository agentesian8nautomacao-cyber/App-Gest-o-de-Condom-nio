import React, { useMemo } from 'react';
import { 
  BrainCircuit, 
  MessageSquare, 
  FileText, 
  Megaphone, 
  Users, 
  Package, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  ArrowRight,
  BarChart3,
  AlertTriangle,
  Clock,
  Zap,
  Target,
  TrendingDown,
  Calendar,
  Award,
  Home,
  Timer,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAppConfig } from '../../contexts/AppConfigContext';

interface SindicoDashboardViewProps {
  allPackages: any[];
  visitorLogs: any[];
  allOccurrences: any[];
  allResidents: any[];
  setActiveTab: (tab: string) => void;
  setActiveNoticeTab: (tab: 'wall' | 'chat') => void;
}

const SindicoDashboardView: React.FC<SindicoDashboardViewProps> = ({
  allPackages,
  visitorLogs,
  allOccurrences,
  allResidents,
  setActiveTab,
  setActiveNoticeTab
}) => {
  const { config } = useAppConfig();

  // Cálculos e análises avançadas
  const metrics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Visitantes
    const activeVisitors = visitorLogs.filter(v => v.status === 'active').length;
    const todayVisitors = visitorLogs.filter(v => {
      const entryDate = new Date(v.entryTime);
      return entryDate >= today;
    }).length;
    const yesterdayVisitors = visitorLogs.filter(v => {
      const entryDate = new Date(v.entryTime);
      return entryDate >= yesterday && entryDate < today;
    }).length;
    const visitorTrend = yesterdayVisitors > 0 
      ? Math.round(((todayVisitors - yesterdayVisitors) / yesterdayVisitors) * 100) 
      : todayVisitors > 0 ? 100 : 0;

    // Encomendas
    const pendingPackages = allPackages.filter(p => p.status === 'Pendente').length;
    const todayPackages = allPackages.filter(p => {
      const receivedDate = new Date(p.receivedAt);
      return receivedDate >= today;
    }).length;
    const urgentPackages = allPackages.filter(p => {
      if (p.status !== 'Pendente') return false;
      const receivedDate = new Date(p.receivedAt);
      const diffMinutes = (now.getTime() - receivedDate.getTime()) / 60000;
      return diffMinutes > (p.deadlineMinutes || 45);
    }).length;
    const avgDeliveryTime = allPackages
      .filter(p => p.status === 'Entregue' && p.deliveredAt)
      .map(p => {
        const received = new Date(p.receivedAt).getTime();
        const delivered = new Date(p.deliveredAt).getTime();
        return (delivered - received) / 60000; // minutos
      });
    const avgDeliveryMinutes = avgDeliveryTime.length > 0
      ? Math.round(avgDeliveryTime.reduce((a, b) => a + b, 0) / avgDeliveryTime.length)
      : 0;

    // Ocorrências
    const openOccurrences = allOccurrences.filter(o => o.status === 'Aberto').length;
    const resolvedOccurrences = allOccurrences.filter(o => o.status === 'Resolvido').length;
    const inProgressOccurrences = allOccurrences.filter(o => o.status === 'Em Andamento').length;
    const totalOccurrences = allOccurrences.length;
    const resolutionRate = totalOccurrences > 0 ? Math.round((resolvedOccurrences / totalOccurrences) * 100) : 100;
    
    // Ocorrências por prioridade (baseado em tempo aberto)
    const urgentOccurrences = allOccurrences.filter(o => {
      if (o.status !== 'Aberto') return false;
      const occurrenceDate = new Date(o.date);
      const daysOpen = (now.getTime() - occurrenceDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysOpen > 3;
    }).length;

    // Estatísticas de moradores
    const totalResidents = allResidents.length;
    const uniqueUnits = new Set(allResidents.map(r => r.unit)).size;
    const occupancyRate = uniqueUnits > 0 ? Math.round((totalResidents / (uniqueUnits * 3)) * 100) : 0; // Assumindo média de 3 moradores por unidade

    // Tendências semanais
    const weekPackages = allPackages.filter(p => {
      const receivedDate = new Date(p.receivedAt);
      return receivedDate >= lastWeek;
    }).length;
    const weekOccurrences = allOccurrences.filter(o => {
      const occurrenceDate = new Date(o.date);
      return occurrenceDate >= lastWeek;
    }).length;

    return {
      activeVisitors,
      todayVisitors,
      visitorTrend,
      pendingPackages,
      todayPackages,
      urgentPackages,
      avgDeliveryMinutes,
      openOccurrences,
      resolvedOccurrences,
      inProgressOccurrences,
      urgentOccurrences,
      resolutionRate,
      totalResidents,
      uniqueUnits,
      occupancyRate,
      weekPackages,
      weekOccurrences,
      totalOccurrences
    };
  }, [visitorLogs, allPackages, allOccurrences, allResidents]);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-white bg-white/10 border-white/20';
    if (value <= thresholds.warning) return 'text-white bg-white/10 border-white/20';
    return 'text-white bg-white/10 border-white/20';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-400';
    if (trend < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* HEADER MODERNO MELHORADO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-white/20 to-white/10 border border-white/20 rounded-2xl text-white shadow-lg backdrop-blur-xl">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[var(--background)] animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-contrast-high flex items-center gap-2 md:gap-3 flex-wrap">
                <span>Painel Executivo</span>
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 animate-pulse flex-shrink-0" />
              </h2>
              <p className="text-xs md:text-[10px] lg:text-[11px] font-bold uppercase tracking-widest text-contrast-low mt-1 break-words">
                {config.condominiumName} • Gestão Estratégica • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-xl">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50 flex-shrink-0" />
            <span className="text-xs md:text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">
              Sistema Operacional
            </span>
          </div>
          {(metrics.urgentPackages > 0 || metrics.urgentOccurrences > 0) && (
            <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-red-500/20 border border-red-500/30 rounded-full backdrop-blur-xl animate-pulse">
              <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
              <span className="text-xs md:text-[10px] font-black uppercase tracking-widest text-red-300 whitespace-nowrap">
                {metrics.urgentPackages + metrics.urgentOccurrences} Urgente{metrics.urgentPackages + metrics.urgentOccurrences !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* MÉTRICAS PRINCIPAIS MELHORADAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Card Visitantes */}
        <div className={`premium-glass rounded-[20px] md:rounded-[24px] p-5 md:p-6 border transition-all hover:scale-[1.02] active:scale-95 ${
          metrics.activeVisitors > 5 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-[var(--border-color)]'
        }`}>
          <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
            <div className={`p-2.5 md:p-3 rounded-xl text-white flex-shrink-0 ${
              metrics.activeVisitors > 5 ? 'bg-yellow-500/20' : 'bg-white/10'
            }`}>
              <Users className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
              {getTrendIcon(metrics.visitorTrend)}
              <span className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] truncate">
                Visitantes
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            <h3 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
              {metrics.activeVisitors}
            </h3>
            <span className="text-xs text-[var(--text-secondary)]">
              ativos agora
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs text-[var(--text-secondary)]">
              {metrics.todayVisitors} hoje
            </p>
            <span className={`text-[10px] md:text-xs font-black ${getTrendColor(metrics.visitorTrend)} whitespace-nowrap`}>
              {metrics.visitorTrend > 0 ? '+' : ''}{metrics.visitorTrend}%
            </span>
          </div>
          {metrics.activeVisitors > 5 && (
            <div className="mt-3 pt-3 border-t border-yellow-500/20">
              <p className="text-xs md:text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                ⚠ Alto fluxo detectado
              </p>
            </div>
          )}
        </div>

        {/* Card Encomendas */}
        <div className={`premium-glass rounded-[20px] md:rounded-[24px] p-5 md:p-6 border transition-all hover:scale-[1.02] active:scale-95 ${
          metrics.urgentPackages > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-[var(--border-color)]'
        }`}>
          <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
            <div className={`p-2.5 md:p-3 rounded-xl text-white flex-shrink-0 ${
              metrics.urgentPackages > 0 ? 'bg-red-500/20' : 'bg-white/10'
            }`}>
              <Package className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
              {metrics.urgentPackages > 0 && <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-400 flex-shrink-0" />}
              <span className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] truncate">
                Encomendas
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            <h3 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
              {metrics.pendingPackages}
            </h3>
            <span className="text-xs text-[var(--text-secondary)]">
              pendentes
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs text-[var(--text-secondary)]">
              {metrics.todayPackages} recebidas hoje
            </p>
            {metrics.avgDeliveryMinutes > 0 && (
              <span className="text-[10px] md:text-xs font-black text-[var(--text-secondary)] whitespace-nowrap">
                Média: {metrics.avgDeliveryMinutes}min
              </span>
            )}
          </div>
          {metrics.urgentPackages > 0 && (
            <div className="mt-3 pt-3 border-t border-red-500/20">
              <p className="text-xs md:text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {metrics.urgentPackages} fora do prazo
              </p>
            </div>
          )}
        </div>

        {/* Card Ocorrências */}
        <div className={`premium-glass rounded-[20px] md:rounded-[24px] p-5 md:p-6 border transition-all hover:scale-[1.02] active:scale-95 ${
          metrics.urgentOccurrences > 0 ? 'border-orange-500/30 bg-orange-500/5' : 'border-[var(--border-color)]'
        }`}>
          <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
            <div className={`p-2.5 md:p-3 rounded-xl text-white flex-shrink-0 ${
              metrics.urgentOccurrences > 0 ? 'bg-orange-500/20' : 'bg-white/10'
            }`}>
              <ShieldAlert className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
              {metrics.urgentOccurrences > 0 && <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-400 flex-shrink-0" />}
              <span className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] truncate">
                Ocorrências
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            <h3 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
              {metrics.openOccurrences}
            </h3>
            <span className="text-xs text-[var(--text-secondary)]">
              abertas
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs text-[var(--text-secondary)]">
              {metrics.inProgressOccurrences} em andamento
            </p>
            <span className="text-[10px] md:text-xs font-black text-green-400 whitespace-nowrap">
              {metrics.resolvedOccurrences} resolvidas
            </span>
          </div>
          {metrics.urgentOccurrences > 0 && (
            <div className="mt-3 pt-3 border-t border-orange-500/20">
              <p className="text-xs md:text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                <Timer className="w-3 h-3 flex-shrink-0" />
                {metrics.urgentOccurrences} requerem atenção urgente
              </p>
            </div>
          )}
        </div>

        {/* Card Taxa de Resolução */}
        <div className="premium-glass rounded-[20px] md:rounded-[24px] p-5 md:p-6 border border-[var(--border-color)] transition-all hover:scale-[1.02] active:scale-95">
          <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
            <div className="p-2.5 md:p-3 bg-white/10 rounded-xl text-white flex-shrink-0">
              <Target className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] truncate">
              Taxa Resolução
            </span>
          </div>
          <div className="mb-3">
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
                {metrics.resolutionRate}%
              </h3>
            </div>
            {/* Barra de progresso visual */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  metrics.resolutionRate >= 80 ? 'bg-green-400' :
                  metrics.resolutionRate >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${metrics.resolutionRate}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {metrics.resolvedOccurrences} de {metrics.totalOccurrences} resolvidas
          </p>
        </div>
      </div>

      {/* AÇÕES RÁPIDAS MELHORADAS */}
      <div>
        <div className="flex items-center justify-between mb-4 gap-4">
          <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-contrast-high flex items-center gap-2">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 flex-shrink-0" />
            <span>Ações Rápidas</span>
          </h3>
          <span className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">
            Acesso Direto
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <button
            onClick={() => { setActiveTab('notices'); setActiveNoticeTab('chat'); }}
            className="group premium-glass rounded-[20px] md:rounded-[24px] p-5 md:p-6 text-left transition-all hover:scale-[1.02] active:scale-95 border border-[var(--border-color)] hover:border-white/30 relative overflow-hidden min-h-[120px]"
          >
            <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full -mr-8 -mt-8 md:-mr-10 md:-mt-10 group-hover:scale-150 transition-transform" />
            <div className="flex items-center gap-3 md:gap-4 mb-3 relative z-10">
              <div className="p-2.5 md:p-3 bg-gradient-to-br from-blue-500/20 to-blue-400/10 rounded-xl text-white group-hover:scale-110 transition-transform border border-blue-500/20 flex-shrink-0">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base md:text-lg font-black uppercase tracking-tight text-[var(--text-primary)] break-words">
                  Chat Portaria
                </h4>
                <p className="text-xs md:text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-1">
                  Comunicação direta
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all relative z-10 flex-shrink-0" />
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className="group premium-glass rounded-[20px] md:rounded-[24px] p-5 md:p-6 text-left transition-all hover:scale-[1.02] active:scale-95 border border-[var(--border-color)] hover:border-white/30 relative overflow-hidden min-h-[120px]"
          >
            <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full -mr-8 -mt-8 md:-mr-10 md:-mt-10 group-hover:scale-150 transition-transform" />
            <div className="flex items-center gap-3 md:gap-4 mb-3 relative z-10">
              <div className="p-2.5 md:p-3 bg-gradient-to-br from-purple-500/20 to-purple-400/10 rounded-xl text-white group-hover:scale-110 transition-transform border border-purple-500/20 flex-shrink-0">
                <FileText className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base md:text-lg font-black uppercase tracking-tight text-[var(--text-primary)] break-words">
                  Relatórios IA
                </h4>
                <p className="text-xs md:text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-1">
                  Análise inteligente
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all relative z-10 flex-shrink-0" />
          </button>

          <button
            onClick={() => { setActiveTab('notices'); setActiveNoticeTab('wall'); }}
            className="group premium-glass rounded-[20px] md:rounded-[24px] p-5 md:p-6 text-left transition-all hover:scale-[1.02] active:scale-95 border border-[var(--border-color)] hover:border-white/30 relative overflow-hidden min-h-[120px]"
          >
            <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full -mr-8 -mt-8 md:-mr-10 md:-mt-10 group-hover:scale-150 transition-transform" />
            <div className="flex items-center gap-3 md:gap-4 mb-3 relative z-10">
              <div className="p-2.5 md:p-3 bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-xl text-white group-hover:scale-110 transition-transform border border-green-500/20 flex-shrink-0">
                <Megaphone className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base md:text-lg font-black uppercase tracking-tight text-[var(--text-primary)] break-words">
                  Comunicado
                </h4>
                <p className="text-xs md:text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-1">
                  Mural digital
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all relative z-10 flex-shrink-0" />
          </button>

          <button
            onClick={() => setActiveTab('occurrences')}
            className={`group premium-glass rounded-[20px] md:rounded-[24px] p-5 md:p-6 text-left transition-all hover:scale-[1.02] active:scale-95 border relative overflow-hidden min-h-[120px] ${
              metrics.urgentOccurrences > 0 
                ? 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50' 
                : 'border-[var(--border-color)] hover:border-white/30'
            }`}
          >
            <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full -mr-8 -mt-8 md:-mr-10 md:-mt-10 group-hover:scale-150 transition-transform" />
            <div className="flex items-center gap-3 md:gap-4 mb-3 relative z-10">
              <div className={`p-2.5 md:p-3 rounded-xl text-white group-hover:scale-110 transition-transform border flex-shrink-0 ${
                metrics.urgentOccurrences > 0
                  ? 'bg-gradient-to-br from-orange-500/20 to-orange-400/10 border-orange-500/20'
                  : 'bg-gradient-to-br from-red-500/20 to-red-400/10 border-red-500/20'
              }`}>
                <ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base md:text-lg font-black uppercase tracking-tight text-[var(--text-primary)] break-words">
                  Ocorrências
                </h4>
                <p className="text-xs md:text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-1">
                  {metrics.urgentOccurrences > 0 ? `${metrics.urgentOccurrences} urgentes` : 'Gestão completa'}
                </p>
              </div>
            </div>
            {metrics.urgentOccurrences > 0 && (
              <div className="mb-2 relative z-10">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-[10px] md:text-[9px] font-black uppercase text-orange-300">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  Atenção
                </span>
              </div>
            )}
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all relative z-10 flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* INSIGHTS E ALERTAS MELHORADOS */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-[var(--text-primary)] flex-shrink-0" />
            <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-contrast-high">
              Insights em Tempo Real
            </h3>
          </div>
          <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">
              Atualizado agora
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Card de Visitantes Melhorado */}
          <div className={`premium-glass rounded-[24px] md:rounded-[32px] p-5 md:p-6 lg:p-8 border transition-all hover:scale-[1.01] active:scale-95 relative overflow-hidden ${
            metrics.activeVisitors > 5 
              ? 'border-yellow-500/30 bg-yellow-500/5' 
              : 'border-[var(--border-color)]'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-white/5 rounded-full -mr-16 -mt-16 md:-mr-20 md:-mt-20" />
            <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10 gap-2 flex-wrap">
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`p-2.5 md:p-3 rounded-xl flex-shrink-0 ${
                  metrics.activeVisitors > 5 ? 'bg-yellow-500/20' : 'bg-black/20'
                }`}>
                  <Users className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-60 whitespace-nowrap">
                  Fluxo de Acesso
                </span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                {getTrendIcon(metrics.visitorTrend)}
                <span className={`px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                  metrics.activeVisitors > 5 
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                    : 'bg-black/20'
                }`}>
                  {metrics.activeVisitors > 5 ? 'Atenção' : 'Estável'}
                </span>
              </div>
            </div>
            
            <div className="relative z-10">
              <h4 className="text-xl md:text-2xl font-black uppercase text-[var(--text-primary)] mb-2 md:mb-3 leading-tight">
                {metrics.activeVisitors > 5 ? 'Alto Fluxo Detectado' : 'Fluxo Normal'}
              </h4>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed mb-3 md:mb-4">
                {metrics.activeVisitors > 5 
                  ? `Detectado ${metrics.activeVisitors} visitantes simultâneos. A portaria pode estar sobrecarregada. Considere reforço temporário.`
                  : `Fluxo controlado com ${metrics.activeVisitors} visitante${metrics.activeVisitors !== 1 ? 's' : ''} no momento. Operação dentro da normalidade.`}
              </p>
              
              {/* Estatísticas adicionais */}
              <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="p-2.5 md:p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                    Hoje
                  </p>
                  <p className="text-base md:text-lg font-black text-[var(--text-primary)]">
                    {metrics.todayVisitors}
                  </p>
                </div>
                <div className="p-2.5 md:p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                    Tendência
                  </p>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metrics.visitorTrend)}
                    <p className={`text-base md:text-lg font-black ${getTrendColor(metrics.visitorTrend)}`}>
                      {Math.abs(metrics.visitorTrend)}%
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveTab('visitors')} 
                className="text-xs md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity text-[var(--text-primary)] group min-h-[32px]"
              >
                <span className="whitespace-nowrap">Ver Detalhes Completos</span> <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>
            </div>
          </div>

          {/* Card de Ocorrências Melhorado */}
          <div className={`premium-glass rounded-[24px] md:rounded-[32px] p-5 md:p-6 lg:p-8 border transition-all hover:scale-[1.01] active:scale-95 relative overflow-hidden ${
            metrics.urgentOccurrences > 0 
              ? 'border-orange-500/30 bg-orange-500/5' 
              : metrics.openOccurrences > 0
              ? 'border-yellow-500/30 bg-yellow-500/5'
              : 'border-[var(--border-color)]'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-white/5 rounded-full -mr-16 -mt-16 md:-mr-20 md:-mt-20" />
            <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10 gap-2 flex-wrap">
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`p-2.5 md:p-3 rounded-xl flex-shrink-0 ${
                  metrics.urgentOccurrences > 0 
                    ? 'bg-orange-500/20' 
                    : metrics.openOccurrences > 0
                    ? 'bg-yellow-500/20'
                    : 'bg-black/20'
                }`}>
                  <ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-60 whitespace-nowrap">
                  Segurança & Social
                </span>
              </div>
              {metrics.urgentOccurrences > 0 && (
                <span className="px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-[9px] font-black uppercase tracking-widest bg-orange-500/20 text-orange-300 border border-orange-500/30 animate-pulse flex items-center gap-1 whitespace-nowrap">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  Urgente
                </span>
              )}
              {metrics.openOccurrences > 0 && metrics.urgentOccurrences === 0 && (
                <span className="px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-[9px] font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
                  Atenção
                </span>
              )}
            </div>
            
            <div className="relative z-10">
              <h4 className="text-xl md:text-2xl font-black uppercase text-[var(--text-primary)] mb-2 md:mb-3 leading-tight">
                {metrics.urgentOccurrences > 0 
                  ? 'Ação Urgente Necessária' 
                  : metrics.openOccurrences > 0
                  ? 'Incidentes Ativos'
                  : 'Perímetro Seguro'}
              </h4>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed mb-3 md:mb-4">
                {metrics.urgentOccurrences > 0 
                  ? `${metrics.urgentOccurrences} ocorrência${metrics.urgentOccurrences !== 1 ? 's' : ''} aberta${metrics.urgentOccurrences !== 1 ? 's' : ''} há mais de 3 dias requerendo mediação imediata.`
                  : metrics.openOccurrences > 0
                  ? `Existem ${metrics.openOccurrences} ocorrência${metrics.openOccurrences !== 1 ? 's' : ''} em aberto. ${metrics.inProgressOccurrences > 0 ? `${metrics.inProgressOccurrences} ${metrics.inProgressOccurrences === 1 ? 'está' : 'estão'} em andamento.` : ''}`
                  : `Nenhuma ocorrência em aberto. O ambiente condominial encontra-se pacífico e seguro.`}
              </p>
              
              {/* Estatísticas adicionais */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="p-2.5 md:p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                    Abertas
                  </p>
                  <p className="text-base md:text-lg font-black text-[var(--text-primary)]">
                    {metrics.openOccurrences}
                  </p>
                </div>
                <div className="p-2.5 md:p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                    Em Andamento
                  </p>
                  <p className="text-base md:text-lg font-black text-yellow-400">
                    {metrics.inProgressOccurrences}
                  </p>
                </div>
                <div className="p-2.5 md:p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                    Resolvidas
                  </p>
                  <p className="text-base md:text-lg font-black text-green-400">
                    {metrics.resolvedOccurrences}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveTab('occurrences')} 
                className="text-xs md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity text-[var(--text-primary)] group min-h-[32px]"
              >
                <span className="whitespace-nowrap">{metrics.urgentOccurrences > 0 ? 'Resolver Urgente' : 'Ver Detalhes'}</span> <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS DO CONDOMÍNIO MELHORADAS */}
      <div>
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-contrast-high flex items-center gap-2">
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-[var(--text-primary)] flex-shrink-0" />
            <span>Estatísticas do Condomínio</span>
          </h3>
          <span className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">
            Visão Geral
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Ocupação */}
          <div className="premium-glass rounded-[16px] md:rounded-[20px] p-4 md:p-5 border border-[var(--border-color)] transition-all hover:scale-[1.02] active:scale-95 group">
            <div className="flex items-center justify-between mb-2 gap-2">
              <Home className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--text-secondary)] opacity-50 flex-shrink-0" />
              <span className="text-[10px] md:text-[9px] font-black uppercase text-[var(--text-secondary)] truncate">
                Ocupação
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-2xl font-black text-[var(--text-primary)]">
                {metrics.occupancyRate}%
              </p>
              <span className="text-[10px] text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                style={{ width: `${metrics.occupancyRate}%` }}
              />
            </div>
            <p className="text-[9px] text-[var(--text-secondary)] mt-2">
              {metrics.uniqueUnits} unidades ocupadas
            </p>
          </div>

          {/* Moradores */}
          <div className="premium-glass rounded-[20px] p-5 border border-[var(--border-color)] transition-all hover:scale-[1.02] group">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-4 h-4 text-[var(--text-secondary)] opacity-50" />
              <span className="text-[9px] font-black uppercase text-[var(--text-secondary)]">
                Moradores
              </span>
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)] mb-2">
              {metrics.totalResidents}
            </p>
            <p className="text-[9px] text-[var(--text-secondary)]">
              {metrics.uniqueUnits} unidades cadastradas
            </p>
          </div>

          {/* Encomendas Semanais */}
          <div className="premium-glass rounded-[20px] p-5 border border-[var(--border-color)] transition-all hover:scale-[1.02] group">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-4 h-4 text-[var(--text-secondary)] opacity-50" />
              <span className="text-[9px] font-black uppercase text-[var(--text-secondary)]">
                Encomendas
              </span>
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)] mb-2">
              {metrics.weekPackages}
            </p>
            <p className="text-[9px] text-[var(--text-secondary)]">
              Últimos 7 dias
            </p>
          </div>

          {/* Taxa de Resolução */}
          <div className="premium-glass rounded-[20px] p-5 border border-[var(--border-color)] transition-all hover:scale-[1.02] group">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-4 h-4 text-[var(--text-secondary)] opacity-50" />
              <span className="text-[9px] font-black uppercase text-[var(--text-secondary)]">
                Eficiência
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <p className={`text-2xl font-black ${
                metrics.resolutionRate >= 80 ? 'text-green-400' :
                metrics.resolutionRate >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {metrics.resolutionRate}%
              </p>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  metrics.resolutionRate >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                  metrics.resolutionRate >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                  'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${metrics.resolutionRate}%` }}
              />
            </div>
            <p className="text-[9px] text-[var(--text-secondary)] mt-2">
              Taxa de resolução
            </p>
          </div>
        </div>

        {/* Estatísticas Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="premium-glass rounded-[20px] p-5 border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-4 h-4 text-[var(--text-secondary)] opacity-50" />
              <span className="text-[9px] font-black uppercase text-[var(--text-secondary)]">
                Ocorrências Semanais
              </span>
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)]">
              {metrics.weekOccurrences}
            </p>
            <p className="text-[9px] text-[var(--text-secondary)] mt-1">
              Últimos 7 dias
            </p>
          </div>

          <div className="premium-glass rounded-[20px] p-5 border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-4 h-4 text-[var(--text-secondary)] opacity-50" />
              <span className="text-[9px] font-black uppercase text-[var(--text-secondary)]">
                Tempo Médio Entrega
              </span>
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)]">
              {metrics.avgDeliveryMinutes > 0 ? `${metrics.avgDeliveryMinutes}min` : 'N/A'}
            </p>
            <p className="text-[9px] text-[var(--text-secondary)] mt-1">
              {metrics.avgDeliveryMinutes > 0 && metrics.avgDeliveryMinutes <= 45 ? 'Dentro do prazo' : metrics.avgDeliveryMinutes > 0 ? 'Acima do prazo' : 'Sem dados'}
            </p>
          </div>

          <div className="premium-glass rounded-[20px] p-5 border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-4 h-4 text-[var(--text-secondary)] opacity-50" />
              <span className="text-[9px] font-black uppercase text-[var(--text-secondary)]">
                Visitantes Hoje
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-[var(--text-primary)]">
                {metrics.todayVisitors}
              </p>
              {metrics.visitorTrend !== 0 && (
                <span className={`text-xs font-black flex items-center gap-1 ${getTrendColor(metrics.visitorTrend)}`}>
                  {getTrendIcon(metrics.visitorTrend)}
                  {Math.abs(metrics.visitorTrend)}%
                </span>
              )}
            </div>
            <p className="text-[9px] text-[var(--text-secondary)] mt-1">
              vs. ontem
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SindicoDashboardView;
