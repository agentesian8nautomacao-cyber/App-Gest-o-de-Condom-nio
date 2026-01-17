
import React from 'react';
import { SearchCode, Search, Package as PackageIcon, ArrowRight, Users, ShieldAlert, ChevronRight, Home } from 'lucide-react';
import RecentEventsBar from '../RecentEventsBar';
import { QuickViewCategory } from '../../types';
import { useAppConfig } from '../../contexts/AppConfigContext';

interface DashboardViewProps {
  globalSearchQuery: string;
  setGlobalSearchQuery: (val: string) => void;
  hasAnyGlobalResult: boolean;
  globalResults: any;
  setActiveTab: (tab: string) => void;
  setResidentSearch: (val: string) => void;
  eventStates: any;
  setQuickViewCategory: (cat: QuickViewCategory) => void;
  setIsNewPackageModalOpen: (val: boolean) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  globalSearchQuery,
  setGlobalSearchQuery,
  hasAnyGlobalResult,
  globalResults,
  setActiveTab,
  setResidentSearch,
  eventStates,
  setQuickViewCategory,
  setIsNewPackageModalOpen
}) => {
  const { config } = useAppConfig();
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 relative">
      <header className="px-2">
          <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-contrast-high leading-tight uppercase">Central Operacional</h3>
          <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-contrast-low">{config.condominiumName} Gestão Premium</p>
      </header>

      <div className="relative group z-[100]">
        <SearchCode className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 opacity-40 group-hover:text-[var(--text-primary)] transition-all" />
        <input 
          type="text" 
          placeholder="Busca Geral: Nome, Unidade, Status..." 
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          className="w-full pl-12 md:pl-16 pr-4 md:pr-6 py-4 md:py-5 lg:py-6 text-base md:text-lg lg:text-xl bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-[24px] md:rounded-[32px] outline-none font-black tracking-tight focus:ring-2 md:focus:ring-4 focus:ring-[var(--text-primary)]/10 transition-all placeholder:opacity-20 shadow-lg min-h-[48px]"
        />

        {/* PAINEL DE BUSCA GLOBAL (COMMAND PALETTE STYLE) */}
        {globalSearchQuery.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 md:mt-3 p-3 md:p-4 premium-glass rounded-[32px] md:rounded-[40px] shadow-2xl animate-in slide-in-from-top-4 duration-300 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* ... Global Search Content ... */}
            {hasAnyGlobalResult ? (
              <div className="space-y-4 md:space-y-6 p-2">
                {globalResults?.residents.length > 0 && (
                  <section>
                    <header className="flex items-center gap-2 mb-3 px-2 md:px-3">
                      <Users className="w-3 h-3 opacity-30 flex-shrink-0" />
                      <span className="text-[10px] md:text-[9px] font-black uppercase tracking-widest opacity-30">Moradores</span>
                    </header>
                    <div className="grid grid-cols-1 gap-2">
                      {globalResults.residents.map((r: any) => (
                        <button 
                          key={r.id} 
                          onClick={() => { setActiveTab('residents'); setGlobalSearchQuery(''); setResidentSearch(r.name); }}
                          className="w-full p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-between text-left transition-all group min-h-[56px] gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <h6 className="text-sm md:text-base font-black uppercase tracking-tight break-words">{r.name}</h6>
                            <p className="text-xs md:text-[10px] opacity-40 uppercase font-black">Unidade {r.unit}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {/* ... other categories (simplified for brevity) ... */}
              </div>
            ) : (
              <div className="py-8 md:py-12 text-center">
                 <Search className="w-6 h-6 md:w-8 md:h-8 opacity-10 mx-auto mb-3 md:mb-4" />
                 <p className="text-xs md:text-sm font-black uppercase tracking-widest opacity-20 px-2 break-words">Nenhum resultado para "{globalSearchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-0">
        <RecentEventsBar eventStates={eventStates} onOpenQuickView={(cat) => setQuickViewCategory(cat)} />

        <div 
          onClick={() => setIsNewPackageModalOpen(true)}
          className="w-full contrast-card rounded-[32px] md:rounded-[48px] p-6 md:p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between transition-all shadow-2xl relative overflow-hidden group cursor-pointer border-none min-h-[140px] md:min-h-[180px]"
        >
          {/* ... Main Card Content ... */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-10 relative z-10 w-full">
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-[24px] md:rounded-[32px] bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-xl flex-shrink-0">
               <PackageIcon className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10" />
            </div>
            <div className="text-center md:text-left min-w-0 flex-1">
              <span className="text-xs md:text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Gestão de Recebimentos</span>
              <h4 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-tight uppercase mt-2 break-words">Registro de Encomendas</h4>
              <p className="text-xs md:text-sm font-medium opacity-60 mt-2 md:mt-3 max-w-lg">Fácil de registrar.</p>
            </div>
            <div className="md:ml-auto flex-shrink-0">
               <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all active:scale-90">
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
               </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-black opacity-[0.02] rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <div onClick={() => setActiveTab('visitors')} className="group secondary-card p-6 md:p-8 h-auto min-h-[180px] md:h-[240px] rounded-[32px] md:rounded-[48px] flex flex-col justify-between cursor-pointer shadow-xl transition-all active:scale-95">
           <Users className="w-7 h-7 md:w-8 md:h-8 opacity-20 flex-shrink-0" />
           <div className="mt-auto">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight">VISITANTES</h3>
              <p className="text-xs md:text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2">Controle de acesso</p>
           </div>
           <div className="flex justify-end mt-4">
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 opacity-20 group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
        
        <div onClick={() => setActiveTab('occurrences')} className="group secondary-card p-6 md:p-8 h-auto min-h-[180px] md:h-[240px] rounded-[32px] md:rounded-[48px] flex flex-col justify-between cursor-pointer shadow-xl transition-all active:scale-95">
           <ShieldAlert className="w-7 h-7 md:w-8 md:h-8 opacity-20 flex-shrink-0" />
           <div className="mt-auto">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight">OCORRÊNCIAS</h3>
              <p className="text-xs md:text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2">Segurança e Relatos</p>
           </div>
           <div className="flex justify-end mt-4">
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 opacity-20 group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
        <div onClick={() => setActiveTab('residents')} className="group secondary-card p-6 md:p-8 h-auto min-h-[180px] md:h-[240px] rounded-[32px] md:rounded-[48px] flex flex-col justify-between cursor-pointer shadow-xl transition-all active:scale-95">
           <Home className="w-7 h-7 md:w-8 md:h-8 opacity-20 flex-shrink-0" />
           <div className="mt-auto">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight">MORADORES</h3>
              <p className="text-xs md:text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2">Base de unidades</p>
           </div>
           <div className="flex justify-end mt-4">
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 opacity-20 group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
