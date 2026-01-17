
import React from 'react';
import { X, Edit2, MessageCircle, Mail, Package as PackageIcon, CheckCircle2, Check, ShieldCheck, UserCircle, Plus, Clock, ArrowUpRight, LogOut, AlertTriangle, Save, Trash2, Bell } from 'lucide-react';
import { Resident, Package, VisitorLog, Occurrence, Notice } from '../../types';

// --- PROFILE RESIDENTE 360 ---
export const ResidentProfileModal = ({
  resident, onClose, onEdit, allPackages, visitorLogs, onPackageSelect, onCheckOutVisitor
}: { resident: Resident | null, onClose: () => void, onEdit: () => void, allPackages: Package[], visitorLogs: VisitorLog[], onPackageSelect: (p: Package) => void, onCheckOutVisitor: (id: string) => void }) => {
  if (!resident) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-zinc-900 text-white rounded-[32px] md:rounded-[48px] shadow-2xl p-6 md:p-8 lg:p-12 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-12 pb-6 md:pb-8 border-b border-white/10">
          <div className="flex items-center gap-4 md:gap-6">
             <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-[24px] md:rounded-[32px] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-black shadow-lg flex-shrink-0">
                {resident.name.substring(0, 2).toUpperCase()}
             </div>
             <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight break-words">{resident.name}</h2>
                  <button onClick={onEdit} className="flex-shrink-0 p-2 bg-white/5 rounded-xl hover:bg-white text-white hover:text-black transition-all active:scale-95 min-w-[36px] min-h-[36px] flex items-center justify-center" title="Editar"><Edit2 className="w-4 h-4" /></button>
                </div>
                <span className="inline-block px-3 py-1 rounded-lg text-xs md:text-[10px] font-black uppercase tracking-widest mt-2" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)' }}>Unidade {resident.unit}</span>
                <div className="flex gap-3 mt-4">
                   {resident.whatsapp && <button onClick={() => window.open(`https://wa.me/${resident.whatsapp}`, '_blank')} className="p-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all"><MessageCircle className="w-5 h-5" /></button>}
                   <button className="p-2 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all"><Mail className="w-5 h-5" /></button>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-3 md:p-4 bg-white/5 rounded-2xl md:rounded-3xl hover:bg-white/20 transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"><X className="w-5 h-5 md:w-6 md:h-6"/></button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          <div className="space-y-8">
             <div className="flex items-center gap-3 mb-4"><PackageIcon className="w-6 h-6 text-blue-400" /><h3 className="text-xl font-black uppercase tracking-tight">Logística</h3></div>
             {allPackages.filter(p => p.recipient === resident.name && p.status === 'Pendente').length > 0 ? (
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-[32px] space-y-4">
                   <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse">Aguardando Retirada</span><span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-[10px] font-bold">Prioridade</span></div>
                   {allPackages.filter(p => p.recipient === resident.name && p.status === 'Pendente').map(pkg => (
                      <div key={pkg.id} className="p-4 bg-zinc-900/50 rounded-2xl flex justify-between items-center group cursor-pointer hover:bg-black/40 transition-all" onClick={() => onPackageSelect(pkg)}>
                         <div><h6 className="font-bold text-sm uppercase text-blue-100">{pkg.type}</h6><p className="text-[10px] opacity-60 font-medium">Chegou às {pkg.displayTime}</p></div>
                         <div className="p-2 bg-blue-500 text-white rounded-xl shadow-lg group-hover:scale-110 transition-transform"><MessageCircle className="w-4 h-4" /></div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="p-6 bg-white/5 border border-white/5 rounded-[32px] flex items-center justify-center gap-3 opacity-40"><CheckCircle2 className="w-5 h-5" /><span className="text-xs font-black uppercase">Nada pendente</span></div>
             )}
             <div className="bg-white/5 rounded-[32px] p-6">
                <h6 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">Histórico</h6>
                <div className="space-y-6 relative pl-2">
                   <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/10" />
                   {allPackages.filter(p => p.recipient === resident.name && p.status === 'Entregue').slice(0, 4).map(pkg => (
                      <div key={pkg.id} className="relative flex items-center gap-4 pl-6 group">
                         <div className="absolute left-0 w-8 h-8 rounded-full bg-zinc-800 border-2 border-green-500 flex items-center justify-center z-10"><Check className="w-3 h-3 text-green-500" /></div>
                         <div className="flex-1 p-3 rounded-xl hover:bg-white/5 transition-all"><h6 className="text-sm font-bold uppercase">{pkg.type}</h6><p className="text-[10px] opacity-40">Entregue em {new Date(pkg.receivedAt).toLocaleDateString()}</p></div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
          <div className="space-y-8">
             <div className="flex items-center gap-3 mb-4"><ShieldCheck className="w-6 h-6 text-purple-400" /><h3 className="text-xl font-black uppercase tracking-tight">Acessos</h3></div>
             <div className="space-y-4">
                <h6 className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Visitantes (Agora)</h6>
                {visitorLogs.filter(v => v.residentName === resident.name && v.status === 'active').map(visitor => (
                   <div key={visitor.id} className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-[32px] flex justify-between items-center">
                      <div><h6 className="font-black text-sm uppercase text-purple-200">{visitor.visitorNames}</h6><p className="text-[10px] text-purple-300/60 font-medium">Entrada: {new Date(visitor.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p></div>
                      <button onClick={() => onCheckOutVisitor(visitor.id)} className="px-4 py-2 bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-purple-400 transition-colors">Saída</button>
                   </div>
                ))}
             </div>
             <div className="bg-white/5 rounded-[32px] p-6">
                <h6 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Frequentes</h6>
                <div className="grid grid-cols-1 gap-2">
                   <div className="p-3 hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer group transition-all"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black"><UserCircle className="w-4 h-4" /></div><div><h6 className="text-xs font-bold uppercase">Maria (Mãe)</h6><p className="text-[9px] opacity-40">12 visitas este mês</p></div></div><Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MODAL DETALHE PACOTE ---
export const PackageDetailModal = ({ pkg, onClose, onDeliver, onNotify, calculatePermanence }: any) => {
  if (!pkg) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white text-black rounded-[32px] md:rounded-[48px] shadow-2xl p-6 md:p-8 lg:p-12 animate-in zoom-in duration-500 overflow-hidden max-h-[90vh] overflow-y-auto">
        <header className="flex justify-between items-start gap-4 mb-6 md:mb-10">
          <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
            <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl bg-zinc-50 flex items-center justify-center shadow-inner flex-shrink-0"><PackageIcon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 opacity-40" /></div>
            <div className="min-w-0 flex-1"><h4 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tighter leading-tight break-words">{pkg.recipient}</h4><p className="text-xs md:text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-1 md:mt-2">Unidade {pkg.unit} • Bloco Central</p></div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-3 md:p-4 bg-zinc-50 rounded-2xl md:rounded-3xl hover:bg-zinc-100 transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"><X className="w-5 h-5 md:w-6 md:h-6"/></button>
        </header>
        <div className="space-y-6 md:space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 md:p-8 bg-zinc-50 rounded-[24px] md:rounded-[32px] border border-black/5 shadow-inner"><span className="text-[9px] md:text-[8px] font-black uppercase tracking-widest opacity-30 block mb-2">Registro de Entrada</span><div className="flex items-center gap-2"><Clock className="w-4 h-4 opacity-40" /><span className="text-base md:text-lg font-black uppercase">{pkg.displayTime}</span></div></div>
              <div className="p-6 md:p-8 bg-black text-white rounded-[24px] md:rounded-[32px] shadow-2xl relative overflow-hidden"><span className="text-[9px] md:text-[8px] font-black uppercase tracking-widest opacity-40 block mb-2">Tempo em Custódia</span><div className="flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-blue-400" /><span className="text-base md:text-lg font-black uppercase">{pkg.status === 'Entregue' ? 'FINALIZADO' : calculatePermanence(pkg.receivedAt)}</span></div><div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 opacity-10 rounded-full blur-2xl -mr-10 -mt-10" /></div>
           </div>
           <section className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-2">Detalhes do Volume</label>
              <div className="p-8 bg-zinc-50 rounded-[40px] border border-black/5 space-y-4">
                 <div className="flex justify-between items-center pb-4 border-b border-black/5"><span className="text-xs font-bold opacity-40 uppercase">Transportadora</span><span className="text-sm font-black uppercase">{pkg.type}</span></div>
                 {pkg.items && pkg.items.length > 0 ? (<div className="space-y-3 pt-2"><span className="text-[9px] font-black uppercase opacity-20 block">Inventário</span>{pkg.items.map((it: any, idx: number) => (<div key={idx} className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-black mt-1.5" /><div><p className="text-sm font-bold uppercase">{it.name}</p>{it.description && <p className="text-[10px] opacity-40">{it.description}</p>}</div></div>))}</div>) : (<p className="text-xs opacity-20 italic">Nenhum item específico detalhado.</p>)}
              </div>
           </section>
           <div className="flex flex-col gap-4">
             {pkg.status === 'Pendente' ? (
               <>
                 <button onClick={() => onNotify(pkg)} className="w-full py-8 bg-green-600 text-white rounded-[32px] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"><MessageCircle className="w-6 h-6" /> Notificar Morador agora</button>
                 <button onClick={() => onDeliver(pkg.id)} className="w-full py-8 bg-zinc-100 text-black rounded-[32px] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-zinc-200 active:scale-95 transition-all shadow-xl"><CheckCircle2 className="w-6 h-6" /> Marcar como Entregue</button>
               </>
             ) : (
               <div className="w-full py-8 bg-zinc-50 border border-black/5 rounded-[32px] flex items-center justify-center gap-4"><Check className="w-6 h-6 text-green-600" /><span className="text-[11px] font-black uppercase tracking-widest opacity-40 text-black">Este volume já foi entregue</span></div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- MODAL DETALHE VISITANTE ---
export const VisitorDetailModal = ({ visitor, onClose, onCheckout, calculatePermanence }: any) => {
  if (!visitor) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white text-black rounded-[32px] md:rounded-[48px] shadow-2xl p-6 md:p-8 lg:p-12 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
         <header className="flex justify-between items-start gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
               <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl md:rounded-3xl bg-zinc-100 flex items-center justify-center text-xl md:text-2xl lg:text-3xl font-black shadow-inner flex-shrink-0">{visitor.visitorNames?.substring(0, 1).toUpperCase()}</div>
               <div className="min-w-0 flex-1"><h4 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight break-words">{visitor.visitorNames}</h4><span className={`inline-block mt-2 px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-[9px] font-black uppercase tracking-widest ${visitor.type === 'Prestador' ? 'bg-amber-100 text-amber-600' : visitor.type === 'Delivery' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>{visitor.type || 'Visita'}</span></div>
            </div>
            <button onClick={onClose} className="flex-shrink-0 p-2.5 md:p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"><X className="w-5 h-5"/></button>
         </header>
         <div className="space-y-5 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-4 md:p-5 bg-zinc-50 rounded-[20px] md:rounded-[24px] border border-black/5"><p className="text-[10px] md:text-[9px] font-black uppercase opacity-30 mb-1">Destino</p><p className="text-sm md:text-base font-bold uppercase break-words">{visitor.unit} - {visitor.residentName}</p></div>
               <div className="p-4 md:p-5 bg-zinc-50 rounded-[20px] md:rounded-[24px] border border-black/5"><p className="text-[10px] md:text-[9px] font-black uppercase opacity-30 mb-1">Entrada</p><p className="text-sm md:text-base font-bold uppercase">{new Date(visitor.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p></div>
            </div>
            <div className="p-5 md:p-6 bg-zinc-50 rounded-[24px] md:rounded-[32px] border border-black/5 flex items-center gap-3 md:gap-4"><div className="p-2.5 md:p-3 bg-white rounded-full shadow-sm flex-shrink-0"><Clock className="w-4 h-4 md:w-5 md:h-5 opacity-40"/></div><div className="min-w-0 flex-1"><p className="text-xs md:text-[10px] font-black uppercase opacity-30 tracking-widest">Permanência Atual</p><p className="text-lg md:text-xl font-black uppercase">{calculatePermanence(visitor.entryTime)}</p></div></div>
            <button onClick={() => { onCheckout(visitor.id); onClose(); }} className="w-full py-4 md:py-5 lg:py-6 bg-black text-white rounded-[24px] md:rounded-[32px] font-black uppercase text-xs md:text-[11px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 min-h-[52px]"><LogOut className="w-4 h-4" /> Registrar Saída Agora</button>
         </div>
      </div>
    </div>
  );
};

// --- MODAL DETALHE OCORRENCIA ---
export const OccurrenceDetailModal = ({ occurrence, onClose, onSave, setOccurrence }: any) => {
  if (!occurrence) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white text-black rounded-[32px] md:rounded-[48px] shadow-2xl p-6 md:p-8 lg:p-12 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
         <header className="flex justify-between items-start gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
               <div className={`p-3 md:p-4 rounded-2xl md:rounded-3xl flex-shrink-0 ${occurrence.status === 'Aberto' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}><AlertTriangle className="w-5 h-5 md:w-6 md:h-6" /></div>
               <div className="min-w-0 flex-1"><h4 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight">Ocorrência</h4><p className="text-xs md:text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Detalhes & Edição</p></div>
            </div>
            <button onClick={onClose} className="flex-shrink-0 p-2.5 md:p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"><X className="w-5 h-5"/></button>
         </header>
         <div className="space-y-5 md:space-y-6">
            <div className="p-4 md:p-5 bg-zinc-50 rounded-[20px] md:rounded-[24px] border border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
               <div className="min-w-0 flex-1"><p className="text-[10px] md:text-[9px] font-black uppercase opacity-30 mb-1">Unidade Afetada</p><p className="text-sm md:text-base font-bold uppercase break-words">{occurrence.unit} - {occurrence.residentName}</p></div>
               <div className="text-left sm:text-right flex-shrink-0"><p className="text-[10px] md:text-[9px] font-black uppercase opacity-30 mb-1">Data</p><p className="text-xs md:text-sm font-bold uppercase opacity-60">{occurrence.date}</p></div>
            </div>
            <div>
               <label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Status Atual</label>
               <div className="flex gap-2">
                  {['Aberto', 'Em Andamento', 'Resolvido'].map(status => (
                     <button key={status} onClick={() => setOccurrence({...occurrence, status: status as any})} className={`flex-1 py-3 md:py-3.5 rounded-[14px] md:rounded-[16px] text-[10px] md:text-[9px] font-black uppercase tracking-widest transition-all border min-h-[44px] ${occurrence.status === status ? (status === 'Aberto' ? 'bg-red-500 text-white border-red-500' : status === 'Resolvido' ? 'bg-green-500 text-white border-green-500' : 'bg-amber-500 text-white border-amber-500') : 'bg-white border-zinc-100 text-zinc-400 hover:bg-zinc-50'}`}>{status}</button>
                  ))}
               </div>
            </div>
            <div>
               <label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Descrição (Editável)</label>
               <textarea value={occurrence.description} onChange={(e) => setOccurrence({...occurrence, description: e.target.value})} className="w-full h-32 md:h-36 p-4 md:p-5 bg-zinc-50 rounded-[20px] md:rounded-[24px] font-medium text-sm md:text-base outline-none border-2 border-transparent focus:border-black/5 resize-none shadow-inner" />
            </div>
            <button onClick={onSave} className="w-full py-4 md:py-5 lg:py-6 bg-black text-white rounded-[24px] md:rounded-[32px] font-black uppercase text-xs md:text-[11px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 min-h-[52px]"><Save className="w-4 h-4" /> Salvar Alterações</button>
         </div>
      </div>
    </div>
  );
};

// --- MODAL FORMULARIO RESIDENTE ---
export const ResidentFormModal = ({ isOpen, onClose, data, setData, onSave }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-6">
       <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
       <div className="relative w-full max-w-lg bg-white text-black rounded-[32px] md:rounded-[48px] shadow-2xl p-6 md:p-8 lg:p-10 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
          <header className="flex justify-between items-start gap-4 mb-6 md:mb-8">
             <div className="min-w-0 flex-1"><h4 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight">{data.id ? 'Editar Morador' : 'Novo Morador'}</h4><p className="text-xs md:text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] mt-1">Cadastro de Unidade</p></div>
             <button onClick={onClose} className="flex-shrink-0 p-2.5 md:p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"><X className="w-5 h-5"/></button>
          </header>
          <div className="space-y-4 md:space-y-5">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2"><label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">Nome Completo</label><input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full p-3 md:p-4 bg-zinc-50 rounded-2xl font-bold text-sm md:text-base outline-none border focus:border-black/10 min-h-[44px]" placeholder="Ex: Carlos Silva" /></div>
                <div><label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">Unidade</label><input type="text" value={data.unit} onChange={e => setData({...data, unit: e.target.value})} className="w-full p-3 md:p-4 bg-zinc-50 rounded-2xl font-bold text-sm md:text-base outline-none border focus:border-black/10 min-h-[44px]" placeholder="Ex: 101A" /></div>
                <div><label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">Telefone</label><input type="text" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} className="w-full p-3 md:p-4 bg-zinc-50 rounded-2xl font-bold text-sm md:text-base outline-none border focus:border-black/10 min-h-[44px]" placeholder="Apenas números" /></div>
                <div className="col-span-1 sm:col-span-2"><label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">WhatsApp (Opcional)</label><input type="text" value={data.whatsapp} onChange={e => setData({...data, whatsapp: e.target.value})} className="w-full p-3 md:p-4 bg-zinc-50 rounded-2xl font-bold text-sm md:text-base outline-none border focus:border-black/10 min-h-[44px]" placeholder="5511999999999" /></div>
                <div className="col-span-1 sm:col-span-2"><label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">Email (Opcional)</label><input type="email" value={data.email} onChange={e => setData({...data, email: e.target.value})} className="w-full p-3 md:p-4 bg-zinc-50 rounded-2xl font-bold text-sm md:text-base outline-none border focus:border-black/10 min-h-[44px]" placeholder="email@exemplo.com" /></div>
             </div>
             <button onClick={onSave} className="w-full py-4 md:py-5 bg-black text-white rounded-[20px] md:rounded-[24px] font-black uppercase text-xs md:text-[11px] tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 min-h-[52px]"><Save className="w-4 h-4" /> <span className="whitespace-nowrap">{data.id ? 'Atualizar Dados' : 'Cadastrar Morador'}</span></button>
          </div>
       </div>
    </div>
  );
};

// --- MODAL CRIAR OCORRENCIA ---
export const NewOccurrenceModal = ({ isOpen, onClose, description, setDescription, onSave }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white text-black rounded-[32px] md:rounded-[40px] shadow-2xl p-6 md:p-8 lg:p-10 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
         <header className="flex justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
           <h4 className="text-xl md:text-2xl font-black uppercase leading-tight">Reportar Ocorrência</h4>
           <button onClick={onClose} className="flex-shrink-0 p-2.5 md:p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"><X className="w-5 h-5"/></button>
         </header>
         <div className="space-y-4 md:space-y-5">
            <textarea placeholder="Descreva o ocorrido..." value={description} onChange={e => setDescription(e.target.value)} className="w-full h-32 md:h-36 p-4 bg-zinc-50 rounded-2xl outline-none font-medium text-sm md:text-base resize-none border border-transparent focus:border-red-100" />
            <button onClick={onSave} className="w-full py-4 md:py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs md:text-[10px] shadow-xl mt-4 min-h-[52px] flex items-center justify-center">Registrar</button>
         </div>
      </div>
    </div>
  );
};

// --- MODAL EDITAR AVISO (MURAL) ---
export const NoticeEditModal = ({ notice, onClose, onChange, onSave, onDelete }: any) => {
  if (!notice) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white text-black rounded-[32px] md:rounded-[48px] shadow-2xl p-6 md:p-8 lg:p-12 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
         <header className="flex justify-between items-start gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
              <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-green-100 text-green-600 flex-shrink-0"><Bell className="w-5 h-5 md:w-6 md:h-6" /></div>
              <div className="min-w-0 flex-1"><h4 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight">Aviso Mural</h4><p className="text-xs md:text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Editar Comunicado</p></div>
            </div>
            <button onClick={onClose} className="flex-shrink-0 p-2.5 md:p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"><X className="w-5 h-5"/></button>
         </header>
         <div className="space-y-5 md:space-y-6">
            <div><label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Título</label><input type="text" value={notice.title} onChange={(e) => onChange({...notice, title: e.target.value})} className="w-full p-4 md:p-5 bg-zinc-50 rounded-[20px] md:rounded-[24px] font-bold text-base md:text-lg outline-none border-2 border-transparent focus:border-black/5 min-h-[44px]" /></div>
            <div><label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Conteúdo</label><textarea value={notice.content} onChange={(e) => onChange({...notice, content: e.target.value})} className="w-full h-32 md:h-36 p-4 md:p-5 bg-zinc-50 rounded-[20px] md:rounded-[24px] font-medium text-sm md:text-base outline-none border-2 border-transparent focus:border-black/5 resize-none shadow-inner" /></div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-zinc-50 p-4 rounded-[20px] md:rounded-[24px]"><div><p className="text-[10px] md:text-[9px] font-black uppercase opacity-30">Autor</p><p className="text-xs md:text-sm font-bold uppercase break-words">{notice.author}</p></div><div className="text-left sm:text-right"><p className="text-[10px] md:text-[9px] font-black uppercase opacity-30">Data</p><p className="text-xs md:text-sm font-bold uppercase">{new Date(notice.date).toLocaleDateString()}</p></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <button onClick={onDelete} className="py-4 md:py-5 lg:py-6 bg-red-100 text-red-600 rounded-[24px] md:rounded-[32px] font-black uppercase text-xs md:text-[11px] tracking-widest hover:bg-red-200 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[52px]"><Trash2 className="w-4 h-4" /> Eliminar</button>
                <button onClick={onSave} className="py-4 md:py-5 lg:py-6 bg-black text-white rounded-[24px] md:rounded-[32px] font-black uppercase text-xs md:text-[11px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 min-h-[52px]"><Save className="w-4 h-4" /> Salvar</button>
            </div>
         </div>
      </div>
    </div>
  );
};
