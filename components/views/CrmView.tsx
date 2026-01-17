
import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  Kanban as KanbanIcon, 
  Sparkles, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Gavel, 
  MessageCircle, 
  MoreHorizontal,
  X,
  User,
  ShieldAlert,
  TrendingUp,
  Tag
} from 'lucide-react';
import { CrmUnit, CrmIssue, UnitStatus } from '../../types';
import { useCrmUnits } from '../../hooks/useCrmUnits';
import { useCrmIssues } from '../../hooks/useCrmIssues';

const CrmView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'heatmap' | 'kanban'>('heatmap');
  const [selectedUnit, setSelectedUnit] = useState<CrmUnit | null>(null);

  // Hooks do Supabase
  const { units: crmUnits, loading: unitsLoading } = useCrmUnits();
  const { issues: crmIssues, loading: issuesLoading, updateIssue } = useCrmIssues();

  // Processar unidades para o heatmap
  const processedUnits = useMemo(() => {
    // Se não houver unidades no banco, criar a partir dos residents
    // Por enquanto, vamos usar os dados do banco ou criar unidades vazias
    return crmUnits.map((unit: any) => ({
      ...unit,
      floor: unit.floor || `${unit.unit.substring(0, 1)}º Andar`,
      residentName: unit.resident_name || unit.residentName || 'Vazio',
      status: (unit.status || 'calm') as UnitStatus,
      tags: unit.tags || [],
      npsScore: unit.nps_score || unit.npsScore || 100,
      lastIncident: unit.last_incident ? new Date(unit.last_incident).toLocaleDateString('pt-BR') : undefined
    }));
  }, [crmUnits]);

  // Se não houver unidades, criar estrutura básica a partir dos residents (isso pode ser feito em uma função separada)
  // Por enquanto, vamos usar os dados que temos ou um array vazio
  const displayUnits = processedUnits.length > 0 ? processedUnits : [];

  // Processar issues
  const displayIssues = useMemo(() => {
    return crmIssues.map((issue: any) => ({
      ...issue,
      involvedUnits: issue.involved_units || issue.involvedUnits || []
    }));
  }, [crmIssues]);

  // INSIGHTS MOCK
  const insights = [
    { type: 'warning', text: 'Unidade 302 reservou o salão 3x este mês. Histórico de barulho.' },
    { type: 'info', text: 'Aumento de entregas "iFood" após 23h. Reforçar regras de delivery.' }
  ];

  // Render Helpers
  const getStatusColor = (status: UnitStatus) => {
    switch (status) {
      case 'calm': return 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]';
      case 'critical': return 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 animate-pulse shadow-[0_0_15px_-5px_rgba(239,68,68,0.5)]';
    }
  };

  const floors = [...new Set(displayUnits.map(u => u.floor))].reverse();

  // Função para mover issue entre colunas (drag and drop)
  const handleMoveIssue = async (issueId: string, newStatus: 'analysis' | 'mediation' | 'legal' | 'resolved') => {
    const result = await updateIssue(issueId, { status: newStatus });
    if (result.error) {
      console.error('Erro ao mover issue:', result.error);
    }
  };

  return (
    <div className="relative min-h-screen pb-20 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-lg">
                <Sparkles className="w-5 h-5" />
             </div>
             <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Harmony CRM</h3>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Gestão de Relacionamento & Conflitos</p>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-2xl border border-white/5">
           <button 
             onClick={() => setViewMode('heatmap')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'heatmap' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
           >
              <LayoutGrid className="w-4 h-4" /> Mapa Térmico
           </button>
           <button 
             onClick={() => setViewMode('kanban')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
           >
              <KanbanIcon className="w-4 h-4" /> Pipeline
           </button>
        </div>
      </div>

      {/* AI INSIGHTS WIDGET */}
      {displayIssues.length > 0 && (
         <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayIssues.filter(i => i.severity === 'high').slice(0, 1).map((issue) => (
               <div key={issue.id} className="premium-glass p-5 rounded-[24px] flex items-center gap-4 group hover:border-white/20 transition-all border-amber-500/20">
                  <div className="p-3 rounded-full bg-amber-500/10 text-amber-500">
                     <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                     <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Alerta de Alta Prioridade</span>
                     <p className="text-xs font-bold leading-tight mt-1">{issue.title}</p>
                  </div>
               </div>
            ))}
            {displayIssues.length > 3 && (
               <div className="premium-glass p-5 rounded-[24px] flex items-center gap-4 group hover:border-white/20 transition-all border-blue-500/20">
                  <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                     <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                     <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Sentinela Insight</span>
                     <p className="text-xs font-bold leading-tight mt-1">Total de {displayIssues.length} conflitos em gestão. Requer atenção sistêmica.</p>
                  </div>
               </div>
            )}
         </div>
      )}
      
      {/* Loading state */}
      {(unitsLoading || issuesLoading) && displayUnits.length === 0 && displayIssues.length === 0 && (
         <div className="text-center py-20 opacity-40">
            <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-sm font-black uppercase">Carregando dados do CRM...</p>
         </div>
      )}
      
      {/* Empty state */}
      {!unitsLoading && !issuesLoading && displayUnits.length === 0 && displayIssues.length === 0 && (
         <div className="text-center py-20 opacity-40 border-2 border-dashed border-white/10 rounded-[48px]">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-black uppercase">Nenhum dado CRM disponível</p>
            <p className="text-xs mt-2 opacity-60">Os dados do CRM serão criados automaticamente quando necessário</p>
         </div>
      )}

      {/* VIEW: HEATMAP */}
      {viewMode === 'heatmap' && (
        <div className="space-y-6">
           {floors.map(floor => (
              <div key={floor} className="flex flex-col md:flex-row gap-4">
                 <div className="w-24 py-4 flex items-center justify-center bg-zinc-900/50 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 -rotate-90 md:rotate-0">{floor.split(' ')[0]}</span>
                 </div>
                 <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {displayUnits.filter(u => u.floor === floor).map(unit => (
                       <button 
                          key={unit.id}
                          onClick={() => setSelectedUnit(unit)}
                          className={`relative group p-6 rounded-[24px] border transition-all duration-300 flex flex-col justify-between h-32 ${getStatusColor(unit.status)}`}
                       >
                          <div className="flex justify-between w-full">
                             <span className="text-2xl font-black tracking-tighter opacity-80">{unit.unit}</span>
                             {unit.status !== 'calm' && <AlertTriangle className="w-5 h-5" />}
                          </div>
                          
                          <div className="text-left">
                             {(unit.tags || []).length > 0 && (
                                <div className="flex gap-1 mb-2 flex-wrap">
                                   {unit.tags.slice(0, 2).map((t: string, idx: number) => (
                                      <span key={idx} className="text-[7px] bg-black/20 px-1.5 py-0.5 rounded uppercase font-bold">{t}</span>
                                   ))}
                                </div>
                             )}
                             <div className="w-full bg-black/20 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-current transition-all duration-1000" style={{ width: `${unit.npsScore || unit.nps_score || 100}%` }} />
                             </div>
                          </div>
                       </button>
                    ))}
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* VIEW: KANBAN */}
      {viewMode === 'kanban' && (
         <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4">
            {[
               { id: 'analysis', title: 'Em Análise', color: 'border-zinc-700', icon: Search },
               { id: 'mediation', title: 'Mediação', color: 'border-amber-500/50', icon: MessageCircle },
               { id: 'legal', title: 'Jurídico', color: 'border-red-500/50', icon: Gavel },
               { id: 'resolved', title: 'Resolvido', color: 'border-green-500/50', icon: CheckCircle2 },
            ].map(col => (
               <div key={col.id} className="flex-1 min-w-[280px] bg-zinc-900/30 rounded-[32px] p-4 border border-white/5 flex flex-col">
                  <header className={`flex items-center gap-3 p-4 border-b-2 ${col.color} mb-4`}>
                     <col.icon className="w-4 h-4 opacity-60" />
                     <h5 className="font-black uppercase text-xs tracking-widest">{col.title}</h5>
                     <span className="ml-auto text-[10px] bg-white/10 px-2 py-1 rounded-lg font-bold">
                        {displayIssues.filter(i => i.status === col.id).length}
                     </span>
                  </header>
                  
                  <div className="space-y-3 flex-1">
                     {displayIssues.filter(i => i.status === col.id).map(issue => (
                        <div 
                           key={issue.id} 
                           className="p-5 bg-zinc-800/50 hover:bg-zinc-800 rounded-[24px] border border-white/5 cursor-grab active:cursor-grabbing group transition-all hover:-translate-y-1 shadow-lg"
                           draggable
                           onDragEnd={(e) => {
                             // Implementação básica de drag and drop
                             // Para uma implementação completa, usar uma biblioteca como react-beautiful-dnd
                           }}
                        >
                           <div className="flex justify-between items-start mb-3">
                              <div className="flex gap-1 flex-wrap">
                                 {(issue.involved_units || issue.involvedUnits || []).map((u: string) => (
                                    <span key={u} className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-black uppercase">UN {u}</span>
                                 ))}
                              </div>
                              <button 
                                 onClick={() => {
                                   // Abrir modal de edição de issue
                                   // Por enquanto, apenas log
                                   console.log('Editar issue:', issue);
                                 }}
                                 className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                 <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                              </button>
                           </div>
                           <h6 className="font-bold text-sm leading-tight mb-2">{issue.title}</h6>
                           <p className="text-[10px] text-zinc-400 line-clamp-2">{issue.description}</p>
                           
                           <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                              <span className={`text-[9px] font-black uppercase tracking-widest ${issue.severity === 'high' ? 'text-red-500' : issue.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'}`}>
                                 {issue.severity === 'high' ? 'Alta Prioridade' : issue.severity === 'medium' ? 'Atenção' : 'Baixa'}
                              </span>
                              <span className="text-[9px] text-zinc-600 font-bold">{issue.updatedAt || issue.updated_at || 'Recente'}</span>
                           </div>
                        </div>
                     ))}
                     
                     {displayIssues.filter(i => i.status === col.id).length === 0 && (
                        <div className="p-8 text-center opacity-30 border-2 border-dashed border-white/5 rounded-[24px]">
                           <p className="text-[10px] font-black uppercase tracking-widest">Nenhum item</p>
                        </div>
                     )}
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* SIDE PANEL (DRAWER) - RESIDENT PROFILE 360 */}
      {selectedUnit && (
         <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUnit(null)} />
            <div className="relative w-full max-w-md bg-[#09090b] border-l border-white/10 h-full p-8 overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl">
               <button onClick={() => setSelectedUnit(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
               
               {/* Profile Header */}
               <div className="mt-8 text-center">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-black border-4 ${selectedUnit.status === 'calm' ? 'border-blue-500/20 bg-blue-500/10 text-blue-500' : selectedUnit.status === 'warning' ? 'border-amber-500/20 bg-amber-500/10 text-amber-500' : 'border-red-500/20 bg-red-500/10 text-red-500 animate-pulse'}`}>
                     {selectedUnit.unit}
                  </div>
                  <h2 className="text-2xl font-black uppercase mt-4">{selectedUnit.residentName}</h2>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{selectedUnit.floor}</p>
               </div>

               {/* Tags */}
               {(selectedUnit.tags || []).length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                     {selectedUnit.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border border-white/5">
                           <Tag className="w-3 h-3 opacity-50" /> {tag}
                        </span>
                     ))}
                  </div>
               )}

               {/* Stats Grid */}
               <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 text-center">
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">NPS Score</span>
                     <div className="text-2xl font-black text-white mt-1 flex items-center justify-center gap-2">
                        {selectedUnit.npsScore || selectedUnit.nps_score || 100} <TrendingUp className="w-4 h-4 text-green-500" />
                     </div>
                  </div>
                  <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 text-center">
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ocorrências</span>
                     <div className="text-2xl font-black text-white mt-1 flex items-center justify-center gap-2">
                        {selectedUnit.status === 'calm' ? '0' : '3'} <ShieldAlert className={`w-4 h-4 ${selectedUnit.status === 'calm' ? 'text-zinc-600' : 'text-red-500'}`} />
                     </div>
                  </div>
               </div>

               {/* Timeline */}
               <div className="mt-10">
                  <h5 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Linha do Tempo Unificada</h5>
                  <div className="space-y-6 relative pl-4 border-l border-white/10 ml-2">
                     {[
                        { icon: MessageCircle, title: 'Contato via WhatsApp', time: 'Hoje, 10:00', text: 'Perguntou sobre reserva do salão.' },
                        { icon: AlertTriangle, title: 'Notificação de Barulho', time: 'Ontem, 23:40', text: 'Som alto detectado. Porteiro interfonou.' },
                        { icon: CheckCircle2, title: 'Encomenda Recebida', time: '23/05 - 14:00', text: 'Pacote Amazon entregue.' },
                     ].map((item, idx) => (
                        <div key={idx} className="relative pl-6">
                           <div className="absolute -left-[21px] top-0 w-8 h-8 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center">
                              <item.icon className="w-3 h-3 text-zinc-400" />
                           </div>
                           <h6 className="text-sm font-bold text-white">{item.title}</h6>
                           <span className="text-[10px] text-zinc-500 font-bold uppercase">{item.time}</span>
                           <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.text}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Private Notes */}
               <div className="mt-10 p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2 text-yellow-500">
                     <User className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Notas Privadas do Síndico</span>
                  </div>
                  <textarea 
                     className="w-full bg-transparent text-sm font-medium text-yellow-100/80 outline-none resize-none placeholder:text-yellow-500/30" 
                     rows={3} 
                     placeholder="Toque para adicionar observações sensíveis..."
                     defaultValue="Morador costuma viajar nos feriados. Reclama se o jornal não for entregue na porta."
                  />
               </div>

            </div>
         </div>
      )}

    </div>
  );
};

export default CrmView;
