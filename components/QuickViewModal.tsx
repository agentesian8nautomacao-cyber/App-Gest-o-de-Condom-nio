
import React from 'react';
import { Package, UserCircle, AlertCircle, Calendar, Edit3, Bell, Plus, X, ChevronRight, Check, ExternalLink as LinkIcon } from 'lucide-react';
import { QuickViewCategory } from '../types';

interface QuickViewModalProps {
  category: QuickViewCategory;
  data: any[];
  onClose: () => void;
  onGoToPage: (cat: string) => void;
  onSelectItem: (item: any) => void;
  onMarkAsDone?: (item: any) => void;
  onAddNew?: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ 
  category, 
  data, 
  onClose, 
  onGoToPage,
  onSelectItem,
  onMarkAsDone,
  onAddNew
}) => {
  if (!category) return null;

  const config = {
    packages: { title: 'Volumes Pendentes', icon: Package, color: 'text-blue-500', tab: 'packages' },
    visitors: { title: 'Visitantes no Prédio', icon: UserCircle, color: 'text-purple-500', tab: 'visitors' },
    occurrences: { title: 'Ocorrências Ativas', icon: AlertCircle, color: 'text-red-500', tab: 'occurrences' },
    reservations: { title: 'Agenda de Hoje', icon: Calendar, color: 'text-amber-500', tab: 'reservations' },
    notes: { title: 'Lembretes do Turno', icon: Edit3, color: 'text-zinc-400', tab: 'notes' },
    notices: { title: 'Últimos Comunicados', icon: Bell, color: 'text-green-500', tab: 'notices' },
  }[category];

  const isClickable = category === 'packages' || category === 'visitors' || category === 'occurrences' || category === 'notes' || category === 'notices';

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-lg premium-glass rounded-[32px] md:rounded-[40px] shadow-2xl p-6 md:p-8 lg:p-10 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto border border-[var(--border-color)]">
        <header className="flex justify-between items-start gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <div className={`p-3 md:p-4 rounded-2xl md:rounded-3xl flex-shrink-0 ${config.color}`} style={{ backgroundColor: 'var(--glass-bg)' }}>
              <config.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>{config.title}</h4>
              <p className="text-xs md:text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Visualização Rápida</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {category === 'visitors' && onAddNew && (
              <button 
                onClick={onAddNew}
                className="px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-transform flex items-center gap-2 whitespace-nowrap active:scale-95 min-h-[44px]"
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)' }}
              >
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Acesso</span>
              </button>
            )}
            <button onClick={onClose} className="p-2.5 md:p-3 rounded-xl md:rounded-2xl hover:opacity-70 transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ backgroundColor: 'var(--glass-bg)', color: 'var(--text-primary)' }}><X className="w-5 h-5"/></button>
          </div>
        </header>

        <div className="space-y-3 mb-6 md:mb-8 max-h-[40vh] md:max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
          {data && data.length > 0 ? (
            data.map((item: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => isClickable ? onSelectItem(item) : null}
                className={`p-4 md:p-5 bg-zinc-50 border border-black/5 rounded-2xl md:rounded-3xl flex items-center justify-between group transition-all gap-3 ${isClickable ? 'cursor-pointer hover:bg-zinc-100 hover:scale-[1.02] active:scale-95 min-h-[60px]' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <h6 className="font-black text-sm md:text-base uppercase break-words">{item.title || item.recipient || item.visitorNames || item.area || item.content || item.residentName}</h6>
                  <p className="text-xs md:text-sm opacity-50 font-medium break-words">{item.subtitle || (item.unit ? `Unidade ${item.unit}` : null) || item.date}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                   <span className="text-xs md:text-[10px] font-black whitespace-nowrap" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>{item.time || item.displayTime || ''}</span>
                   
                   {category === 'notes' && onMarkAsDone && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); onMarkAsDone(item); }}
                       className="p-2 rounded-full hover:bg-green-500 hover:text-white transition-all mr-1 shadow-sm z-10 active:scale-95 min-w-[36px] min-h-[36px] flex items-center justify-center border"
                       style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                       title="Concluir"
                     >
                       <Check className="w-3 h-3" />
                     </button>
                   )}

                   {isClickable && <ChevronRight className="w-4 h-4 opacity-10 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center opacity-20 italic font-black uppercase text-xs border-2 border-dashed border-zinc-100 rounded-3xl">
              Nenhuma informação pendente
            </div>
          )}
        </div>

        <button 
          onClick={() => { onGoToPage(config.tab); onClose(); }}
          className="w-full py-4 md:py-5 rounded-[20px] md:rounded-[24px] font-black uppercase text-xs md:text-[11px] tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all min-h-[52px]"
          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)' }}
        >
          <LinkIcon className="w-4 h-4 flex-shrink-0" /> <span className="whitespace-nowrap">Acessar Gestão Completa</span>
        </button>
      </div>
    </div>
  );
};

export default QuickViewModal;
