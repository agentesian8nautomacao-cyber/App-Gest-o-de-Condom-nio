
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import ScreenSaver from './components/ScreenSaver';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRole, Package, Resident, Note, VisitorLog, PackageItem, Occurrence, Notice, ChatMessage } from './types';
import DashboardView from './components/views/DashboardView';
import SindicoDashboardView from './components/views/SindicoDashboardView';
import AiReportsView from './components/views/AiReportsView';
import AiView from './components/views/AiView';
import SettingsView from './components/views/SettingsView';
import { 
  Package as PackageIcon, 
  Users, 
  X,
  ShieldAlert,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  PenTool,
  Plus,
  SearchCode,
  Trash,
  Check,
  MessageCircle,
  Box,
  Home,
  Smartphone,
  Minus,
  PackagePlus,
  ShoppingBag,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  Edit3,
  Filter,
  FileUp,
  UserPlus,
  Calendar as CalendarIcon,
  ArrowLeft,
  Mail,
  MessageSquare,
  Save,
  Phone,
  Edit2,
  CalendarDays,
  Tag,
  ArrowRight,
  Bell,
  UserCircle,
  ExternalLink as LinkIcon,
  Settings2,
  Send,
  MessageSquareText,
  Trash2,
  PlusCircle,
  Search,
  ChevronDown,
  MoreVertical,
  History,
  MapPin,
  LogOut,
  ShieldCheck,
  Car,
  Truck,
  HardHat,
  UserCheck,
  Timer,
  MoreHorizontal,
  AlertTriangle,
  PartyPopper,
  UtensilsCrossed,
  Armchair,
  Dumbbell,
  Key,
  Gamepad2,
  Sofa,
  AlertOctagon,
  Pin,
  Zap,
  Megaphone,
  Info,
  SendHorizontal,
  Paperclip,
  CheckCheck,
  Crown,
  BadgeInfo,
  CornerDownLeft
} from 'lucide-react';

// Tipos para o QuickView
type QuickViewCategory = 'packages' | 'visitors' | 'occurrences' | 'reservations' | 'notes' | 'notices' | null;

// Helper para calcular permanência
const calculatePermanence = (receivedAt: string) => {
  const start = new Date(receivedAt).getTime();
  const now = new Date().getTime();
  const diff = now - start;
  
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  
  if (hours < 24) return `${hours}h ${remainingMins}min`;
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
};

const RecentEventsBar = ({ 
  eventStates, 
  onOpenQuickView 
}: { 
  eventStates: any, 
  onOpenQuickView: (cat: QuickViewCategory) => void 
}) => {
  return (
    <div 
      className="w-full flex items-center justify-between p-1 bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl mb-3 animate-in slide-in-from-top-4 duration-700 overflow-hidden"
      style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.4)' }}
    >
      <div className="flex-1 flex items-center">
        {/* Slot Encomendas */}
        <button 
          onClick={() => onOpenQuickView('packages')}
          className={`flex-1 flex items-center justify-center py-4 px-2 transition-all group relative border-r border-white/5 ${eventStates.hasNewPackage ? 'text-blue-400' : 'text-white/40 hover:text-white'}`}
          title="Ver Encomendas Pendentes"
        >
          <PackageIcon className={`w-5 h-5 ${eventStates.hasNewPackage ? 'animate-pulse' : ''}`} />
          <span className="hidden lg:block ml-2 text-[10px] font-black uppercase tracking-widest">Encomendas</span>
        </button>

        {/* Slot Visitantes */}
        <button 
          onClick={() => onOpenQuickView('visitors')}
          className={`flex-1 flex items-center justify-center py-4 px-2 transition-all group relative border-r border-white/5 ${eventStates.hasActiveVisitor ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]' : 'text-white/40 hover:text-white'}`}
          title="Ver Visitantes Ativos"
        >
          <UserCircle className="w-5 h-5" />
          <span className="hidden lg:block ml-2 text-[10px] font-black uppercase tracking-widest">Acessos</span>
        </button>

        {/* Slot Ocorrências (Segurança) - PISCAR EM VEZ DE SALTAR */}
        <button 
          onClick={() => onOpenQuickView('occurrences')}
          className={`flex-1 flex items-center justify-center py-4 px-2 transition-all group relative border-r border-white/5 ${eventStates.hasOpenOccurrences ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
          title="Ver Ocorrências Abertas"
        >
          <div className="relative">
            <AlertCircle className={`w-5 h-5 ${eventStates.hasOpenOccurrences ? 'animate-pulse' : ''}`} />
          </div>
          <span className="hidden lg:block ml-2 text-[10px] font-black uppercase tracking-widest">Segurança</span>
        </button>

        {/* Slot Reservas (Agenda) */}
        <button 
          onClick={() => onOpenQuickView('reservations')}
          className={`flex-1 flex items-center justify-center py-4 px-2 transition-all group relative border-r border-white/5 ${eventStates.hasUpcomingReservation ? 'text-amber-400' : 'text-white/40 hover:text-white'}`}
          title="Ver Agenda"
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="hidden lg:block ml-2 text-[10px] font-black uppercase tracking-widest">Agenda</span>
        </button>

        {/* Slot Notas */}
        <button 
          onClick={() => onOpenQuickView('notes')}
          className={`flex-1 flex items-center justify-center py-4 px-2 transition-all group relative border-r border-white/5 ${eventStates.hasActiveNote ? 'text-white' : 'text-white/40 hover:text-white'}`}
          title="Ver Notas Pendentes"
        >
          <Edit3 className="w-5 h-5" />
          <span className="hidden lg:block ml-2 text-[10px] font-black uppercase tracking-widest">Notas</span>
        </button>

        {/* Slot Mural */}
        <button 
          onClick={() => onOpenQuickView('notices')}
          className={`flex-1 flex items-center justify-center py-4 px-2 transition-all group relative ${eventStates.hasNewNotice ? 'text-green-400' : 'text-white/40 hover:text-white'}`}
          title="Ver Mural de Avisos"
        >
          <Bell className="w-5 h-5" />
          <span className="hidden lg:block ml-2 text-[10px] font-black uppercase tracking-widest">Mural</span>
        </button>
      </div>
    </div>
  );
};

const QuickViewModal = ({ 
  category, 
  data, 
  onClose, 
  onGoToPage,
  onSelectItem,
  onMarkAsDone,
  onAddNew
}: { 
  category: QuickViewCategory, 
  data: any, 
  onClose: () => void, 
  onGoToPage: (cat: string) => void,
  onSelectItem: (item: any) => void,
  onMarkAsDone?: (item: any) => void,
  onAddNew?: () => void
}) => {
  if (!category) return null;

  const config = {
    packages: { title: 'Volumes Pendentes', icon: PackageIcon, color: 'text-blue-500', tab: 'packages' },
    visitors: { title: 'Visitantes no Prédio', icon: UserCircle, color: 'text-purple-500', tab: 'visitors' },
    occurrences: { title: 'Ocorrências Ativas', icon: AlertCircle, color: 'text-red-500', tab: 'occurrences' },
    reservations: { title: 'Agenda de Hoje', icon: CalendarIcon, color: 'text-amber-500', tab: 'reservations' },
    notes: { title: 'Lembretes do Turno', icon: Edit3, color: 'text-zinc-400', tab: 'notes' },
    notices: { title: 'Últimos Comunicados', icon: Bell, color: 'text-green-500', tab: 'notices' },
  }[category];

  const isClickable = category === 'packages' || category === 'visitors' || category === 'occurrences' || category === 'notes' || category === 'notices';

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white text-black rounded-[40px] shadow-2xl p-8 md:p-10 animate-in zoom-in duration-300">
        <header className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-3xl bg-zinc-50 ${config.color}`}>
              <config.icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-black uppercase tracking-tight">{config.title}</h4>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Visualização Rápida</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {category === 'visitors' && onAddNew && (
              <button 
                onClick={onAddNew}
                className="px-4 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-transform flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Novo Acesso
              </button>
            )}
            <button onClick={onClose} className="p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-all"><X className="w-5 h-5"/></button>
          </div>
        </header>

        <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
          {data && data.length > 0 ? (
            data.map((item: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => isClickable ? onSelectItem(item) : null}
                className={`p-5 bg-zinc-50 border border-black/5 rounded-3xl flex items-center justify-between group transition-all ${isClickable ? 'cursor-pointer hover:bg-zinc-100 hover:scale-[1.02] active:scale-95' : ''}`}
              >
                <div>
                  <h6 className="font-black text-sm uppercase">{item.title || item.recipient || item.visitorNames || item.area || item.content || item.residentName}</h6>
                  <p className="text-xs opacity-50 font-medium">{item.subtitle || (item.unit ? `Unidade ${item.unit}` : null) || item.date}</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black opacity-30">{item.time || item.displayTime || ''}</span>
                   
                   {category === 'notes' && onMarkAsDone && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); onMarkAsDone(item); }}
                       className="p-2 bg-white border border-zinc-200 rounded-full hover:bg-green-500 hover:text-white hover:border-green-500 transition-all mr-1 shadow-sm z-10"
                       title="Concluir"
                     >
                       <Check className="w-3 h-3" />
                     </button>
                   )}

                   {isClickable && <ChevronRight className="w-4 h-4 opacity-10 group-hover:opacity-100 transition-opacity" />}
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
          className="w-full py-5 bg-black text-white rounded-[24px] font-black uppercase text-[11px] tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <LinkIcon className="w-4 h-4" /> Acessar Gestão Completa
        </button>
      </div>
    </div>
  );
};

const DraggableFab = ({ onClick }: { onClick: () => void }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !hasInitialized.current) {
      setPosition({ 
        x: window.innerWidth - 96,
        y: window.innerHeight - 96 
      });
      setIsVisible(true);
      hasInitialized.current = true;
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { ...position };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      isDraggingRef.current = true;
      setPosition({
        x: initialPosRef.current.x + dx,
        y: initialPosRef.current.y + dy
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!isDraggingRef.current) onClick();
    isDraggingRef.current = false;
  };

  if (!isVisible) return null;

  return (
    <button 
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ left: position.x, top: position.y, position: 'fixed', touchAction: 'none' }}
      className="w-16 h-16 bg-white text-black rounded-full shadow-2xl flex items-center justify-center z-[100] hover:scale-110 active:scale-95 transition-transform cursor-move"
    >
      <PenTool className="w-6 h-6 pointer-events-none" />
    </button>
  );
};

const AppContent: React.FC = () => {
  const { user, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isScreenSaverActive, setIsScreenSaverActive] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  
  const [quickViewCategory, setQuickViewCategory] = useState<QuickViewCategory>(null);

  // Visitors Specific State
  const [visitorTab, setVisitorTab] = useState<'active' | 'history' | 'service'>('active');
  const [visitorSearch, setVisitorSearch] = useState('');
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [newVisitorStep, setNewVisitorStep] = useState(1);
  const [visitorAccessTypes, setVisitorAccessTypes] = useState(['Visita', 'Prestador', 'Delivery']);
  const [isAddingAccessType, setIsAddingAccessType] = useState(false);
  const [newAccessTypeInput, setNewAccessTypeInput] = useState('');
  
  // NEW: State for Visitor Detail from QuickView
  const [selectedVisitorForDetail, setSelectedVisitorForDetail] = useState<any | null>(null);
  
  const [newVisitorData, setNewVisitorData] = useState({
    unit: '',
    name: '',
    doc: '',
    type: 'Visita', // 'Visita' | 'Prestador' | 'Delivery'
    vehicle: '',
    plate: '',
    residentName: ''
  });

  const [allResidents, setAllResidents] = useState<Resident[]>([
    { id: '1', name: 'João Silva', unit: '102A', email: 'joao@email.com', phone: '5511999999999', whatsapp: '5511999999999' },
    { id: '2', name: 'Maria Santos', unit: '405B', email: 'maria@email.com', phone: '5511888888888', whatsapp: '5511888888888' },
    { id: '3', name: 'Ana Oliveira', unit: '201C', email: 'ana@email.com', phone: '5511777777777', whatsapp: '5511777777777' },
    { id: '4', name: 'Ricardo Almeida', unit: '202', email: 'ricardo@email.com', phone: '5511666666666', whatsapp: '5511666666666' },
  ]);

  const [allPackages, setAllPackages] = useState<Package[]>([
    { id: '1', recipient: 'João Silva', unit: '102A', type: 'Amazon', receivedAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(), displayTime: '08:30', status: 'Pendente', deadlineMinutes: 60, residentPhone: '5511999999999' },
    { id: '2', recipient: 'Maria Santos', unit: '405B', type: 'Mercado Livre', receivedAt: new Date().toISOString(), displayTime: '11:15', status: 'Entregue', deadlineMinutes: 120, residentPhone: '5511888888888' },
    { id: '3', recipient: 'João Silva', unit: '102A', type: 'Correios', receivedAt: new Date().toISOString(), displayTime: '14:20', status: 'Pendente', deadlineMinutes: 30, residentPhone: '5511999999999' },
  ]);

  const [allOccurrences, setAllOccurrences] = useState<Occurrence[]>([
    { id: '1', residentName: 'Ana Oliveira', unit: '201C', description: 'Reclamou de vazamento no corredor do 2º andar.', status: 'Resolvido', date: '25/05/2024 10:00', reportedBy: 'Portaria' },
    { id: '2', residentName: 'João Silva', unit: '102A', description: 'Morador informou que o portão da garagem está fazendo barulho excessivo.', status: 'Aberto', date: '26/05/2024 14:20', reportedBy: 'Portaria' },
  ]);

  const [visitorLogs, setVisitorLogs] = useState<any[]>([
    { id: '1', residentName: 'Ricardo Almeida', unit: '202', visitorCount: 1, visitorNames: 'Carlos (Técnico)', entryTime: new Date(Date.now() - 1000 * 60 * 135).toISOString(), status: 'active', type: 'Prestador' },
    { id: '2', residentName: 'Maria Fernanda', unit: '101', visitorCount: 2, visitorNames: 'Pais', entryTime: '2024-05-25T14:00:00', exitTime: '2024-05-25T16:30:00', status: 'completed', type: 'Visita' },
    { id: '3', residentName: 'João Silva', unit: '102A', visitorCount: 1, visitorNames: 'Pedro (Entregador)', entryTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(), status: 'active', type: 'Delivery' }
  ]);

  const [allNotes, setAllNotes] = useState<Note[]>([
    { id: '1', content: 'Verificar lâmpada do bloco B que está piscando.', date: new Date().toISOString(), completed: false, category: 'Manutenção' },
    { id: '2', content: 'Aviso de mudança agendada para unidade 303 no sábado.', date: '27/05/2024 09:30', completed: true, category: 'Agenda' }
  ]);

  // Mural de Avisos Mock Data e Estado (Atualizado)
  const [allNotices, setAllNotices] = useState<Notice[]>([
    { id: '1', title: 'Manutenção Preventiva', content: 'Elevador Bloco A ficará parado amanhã das 08h às 12h para manutenção.', author: 'Síndico', authorRole: 'SINDICO', date: new Date().toISOString(), category: 'Manutenção', priority: 'high', pinned: true, read: false },
    { id: '2', title: 'Portão da Garagem', content: 'O motor do portão principal está fazendo ruído. Técnico acionado.', author: 'Zelador', authorRole: 'PORTEIRO', date: new Date(Date.now() - 86400000).toISOString(), category: 'Urgente', priority: 'high', pinned: false, read: false },
    { id: '3', title: 'Festa Julina', content: 'A festa do condomínio será dia 25/07. Avisar moradores sobre barulho.', author: 'Comissão', authorRole: 'SINDICO', date: new Date(Date.now() - 172800000).toISOString(), category: 'Social', priority: 'normal', pinned: false, read: true },
    { id: '4', title: 'Mudança Unidade 404', content: 'Agendada para hoje à tarde. Liberar entrada do caminhão.', author: 'Portaria 1', authorRole: 'PORTEIRO', date: new Date().toISOString(), category: 'Institucional', priority: 'normal', pinned: false, read: false },
  ]);
  const [noticeFilter, setNoticeFilter] = useState<'all' | 'urgent' | 'unread'>('all');
  const [activeNoticeTab, setActiveNoticeTab] = useState<'wall' | 'chat'>('wall'); // Para Mobile

  // Chat Mock State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', text: 'Boa tarde, alguma novidade na portaria?', senderRole: 'SINDICO', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true },
    { id: '2', text: 'Tudo tranquilo por aqui, Sr. Síndico. Apenas uma entrega grande para o 402.', senderRole: 'PORTEIRO', timestamp: new Date(Date.now() - 3500000).toISOString(), read: true },
    { id: '3', text: 'Perfeito. Avise-me se chegar correspondência da Receita.', senderRole: 'SINDICO', timestamp: new Date(Date.now() - 3400000).toISOString(), read: true },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'notices' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      senderRole: role,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setChatMessages([...chatMessages, newMsg]);
    setChatInput('');
  };

  // RESERVATION MOCK STATES
  const [areasStatus, setAreasStatus] = useState([
    { id: '1', name: 'SALÃO DE FESTAS CRYSTAL', capacity: 80, today: '1 HOJE', icon: PartyPopper, rules: 'Fechar às 23h • Proibido som externo' },
    { id: '2', name: 'ESPAÇO GOURMET', capacity: 30, today: '0 HOJE', icon: UtensilsCrossed, rules: 'Limpeza inclusa na taxa' },
    { id: '3', name: 'CHURRASQUEIRA ROOFTOP', capacity: 20, today: '0 HOJE', icon: Sofa, rules: 'Máximo 20 pessoas' },
    { id: '4', name: 'ACADEMIA', capacity: 15, today: '0 HOJE', icon: Dumbbell, rules: 'Apenas moradores' },
  ]);

  const [dayReservations, setDayReservations] = useState([
    { id: 'r1', resident: 'RICARDO ALMEIDA', unit: '202', area: 'SALÃO DE FESTAS CRYSTAL', time: '18:00 - 22:00', status: 'scheduled', date: 'JAN 9' }
  ]);

  // Reservation Filter State
  const [reservationFilter, setReservationFilter] = useState<'all' | 'today' | 'pending'>('today');

  // NEW: Reservation Modal State with Autocomplete
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [reservationSearchQuery, setReservationSearchQuery] = useState('');
  const [showResSuggestions, setShowResSuggestions] = useState(false);
  const [newReservationData, setNewReservationData] = useState({ area: 'SALÃO DE FESTAS CRYSTAL', resident: '', unit: '', date: '', startTime: '', endTime: '' });

  // Conflict Logic
  const hasTimeConflict = useMemo(() => {
    if (!newReservationData.date || !newReservationData.startTime || !newReservationData.endTime || !newReservationData.area) return false;
    
    // Simplistic conflict check for demo (Overlap logic)
    // Converts "HH:MM" to minutes for comparison
    const toMins = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };
    const newStart = toMins(newReservationData.startTime);
    const newEnd = toMins(newReservationData.endTime);

    // Format date to match mock format (very simplistic for demo: "JAN 9")
    const dateObj = new Date(newReservationData.date);
    const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    const day = dateObj.getDate();
    const formattedDate = `${month} ${day}`;

    return dayReservations.some(r => {
        if (r.area !== newReservationData.area || r.date !== formattedDate) return false;
        // Parse "18:00 - 22:00"
        const [startStr, endStr] = r.time.split(' - ');
        const rStart = toMins(startStr);
        const rEnd = toMins(endStr);
        
        return (newStart < rEnd && newEnd > rStart);
    });
  }, [newReservationData, dayReservations]);

  const handleReservationAction = (id: string) => {
    setDayReservations(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (r.status === 'scheduled') return { ...r, status: 'active' }; // Check-in
      if (r.status === 'active') return { ...r, status: 'completed' }; // Check-out
      return r;
    }));
  };

  const handleCreateReservation = () => {
    if(!newReservationData.resident || !newReservationData.date || hasTimeConflict) return;
    
    // Format date for badge (e.g. "JAN 9")
    const dateObj = new Date(newReservationData.date);
    const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    const day = dateObj.getDate();
    const formattedDate = `${month} ${day}`;

    const newRes = {
      id: Date.now().toString(),
      resident: newReservationData.resident,
      unit: newReservationData.unit,
      area: newReservationData.area,
      time: `${newReservationData.startTime} - ${newReservationData.endTime}`,
      status: 'scheduled',
      date: formattedDate
    };
    setDayReservations([newRes, ...dayReservations]);
    setIsReservationModalOpen(false);
    // Reset form
    setNewReservationData({ area: 'SALÃO DE FESTAS CRYSTAL', resident: '', unit: '', date: '', startTime: '', endTime: '' });
    setReservationSearchQuery('');
    setShowResSuggestions(false);
  };

  // Autocomplete Filter Logic
  const filteredResForReservation = useMemo(() => {
    if (!reservationSearchQuery) return [];
    return allResidents.filter(r => 
      r.name.toLowerCase().includes(reservationSearchQuery.toLowerCase()) || 
      r.unit.includes(reservationSearchQuery)
    ).slice(0, 3);
  }, [reservationSearchQuery, allResidents]);

  // Notice Edit State
  const [selectedNoticeForEdit, setSelectedNoticeForEdit] = useState<Notice | null>(null);

  const eventStates = useMemo(() => {
    const now = new Date();
    const isWithin = (iso: string, mins: number) => {
      if (!iso) return false;
      const d = new Date(iso);
      return (now.getTime() - d.getTime()) < mins * 60 * 1000;
    };

    return {
      hasNewPackage: allPackages.some(p => p.status === 'Pendente'),
      hasActiveVisitor: visitorLogs.some(v => v.status === 'active'),
      hasOpenOccurrences: allOccurrences.some(o => o.status === 'Aberto'),
      hasUpcomingReservation: true, // Mantido como true para exemplo (reservas do dia)
      hasActiveNote: allNotes.some(n => !n.completed),
      hasNewNotice: allNotices.some(n => isWithin(n.date, 1440)) // Últimas 24h
    };
  }, [allPackages, visitorLogs, allOccurrences, allNotes, allNotices]);

  // Calcular contagem de notificações (excluindo as descartadas)
  const notificationCount = useMemo(() => {
    let count = 0;
    const pendingPackages = allPackages.filter(p => p.status === 'Pendente' && !dismissedNotifications.has(`package-${p.id}`));
    const activeVisitors = visitorLogs.filter(v => v.status === 'active' && !dismissedNotifications.has(`visitor-${v.id}`));
    const openOccurrences = allOccurrences.filter(o => o.status === 'Aberto' && !dismissedNotifications.has(`occurrence-${o.id}`));
    const activeNotes = allNotes.filter(n => !n.completed && !dismissedNotifications.has(`note-${n.id}`));
    
    count += pendingPackages.length;
    count += activeVisitors.length;
    count += openOccurrences.length;
    count += activeNotes.length;
    
    return count;
  }, [eventStates, allPackages, visitorLogs, allOccurrences, allNotes, dismissedNotifications]);

  const handleDismissNotification = (type: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedNotifications(prev => new Set([...prev, `${type}-${id}`]));
  };

  // Lógica para dados do QuickView
  const quickViewData = useMemo(() => {
    if (!quickViewCategory) return [];
    switch (quickViewCategory) {
      case 'packages': return allPackages.filter(p => p.status === 'Pendente');
      case 'visitors': return visitorLogs.filter(v => v.status === 'active');
      case 'occurrences': return allOccurrences.filter(o => o.status === 'Aberto');
      case 'reservations': return [{ area: 'Salão de Festas', unit: '102A', time: '18:00' }]; // Mock
      case 'notes': return allNotes.filter(n => !n.completed);
      case 'notices': return allNotices.slice(0, 3);
      default: return [];
    }
  }, [quickViewCategory, allPackages, visitorLogs, allOccurrences, allNotes, allNotices]);

  // NEW PACKAGE MODAL STATES
  const [isNewPackageModalOpen, setIsNewPackageModalOpen] = useState(false);
  const [packageStep, setPackageStep] = useState(1);
  const [searchResident, setSearchResident] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [packageType, setPackageType] = useState('Amazon');
  const [packageCategories, setPackageCategories] = useState(['Amazon', 'Mercado Livre', 'iFood', 'Farmácia', 'Documentos', 'Correios', 'Outros']);
  const [isAddingPkgCategory, setIsAddingPkgCategory] = useState(false);
  const [newPkgCatName, setNewPkgCatName] = useState('');
  const [numItems, setNumItems] = useState(1);
  const [packageItems, setPackageItems] = useState<PackageItem[]>([{ id: '1', name: '', description: '' }]);
  const [packageMessage, setPackageMessage] = useState('');
  
  // SEARCH STATES
  const [packageSearch, setPackageSearch] = useState('');
  const [occurrenceSearch, setOccurrenceSearch] = useState('');
  const [residentSearch, setResidentSearch] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // PACKAGE DETAIL STATE
  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState<Package | null>(null);

  // OCCURRENCE DETAIL STATE
  const [selectedOccurrenceForDetail, setSelectedOccurrenceForDetail] = useState<Occurrence | null>(null);

  // RESIDENT MODAL STATES
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [residentFormData, setResidentFormData] = useState({ id: '', name: '', unit: '', email: '', phone: '', whatsapp: '' });
  
  // RESIDENT PROFILE 360 STATE
  const [selectedResidentProfile, setSelectedResidentProfile] = useState<Resident | null>(null);

  const filteredResidents = useMemo(() => {
    if (!searchResident) return [];
    return allResidents.filter(r => 
      r.name.toLowerCase().includes(searchResident.toLowerCase()) || 
      r.unit.toLowerCase().includes(searchResident.toLowerCase())
    ).slice(0, 4);
  }, [searchResident, allResidents]);

  // LÓGICA DE BUSCA GLOBAL UNIVERSAL (EXCEPCIONALMENTE ABRANGENTE)
  const globalResults = useMemo(() => {
    if (!globalSearchQuery || globalSearchQuery.length < 2) return null;
    const q = globalSearchQuery.toLowerCase();

    return {
      residents: allResidents.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.unit.toLowerCase().includes(q)
      ).slice(0, 4),
      
      packages: allPackages.filter(p => 
        p.recipient.toLowerCase().includes(q) || 
        p.unit.toLowerCase().includes(q) || 
        p.type.toLowerCase().includes(q) || 
        p.status.toLowerCase().includes(q) ||
        p.displayTime.toLowerCase().includes(q)
      ).slice(0, 4),
      
      visitors: visitorLogs.filter(v => 
        (v.visitorNames?.toLowerCase().includes(q) || 
        v.unit.toLowerCase().includes(q) ||
        v.residentName.toLowerCase().includes(q) ||
        v.status.toLowerCase().includes(q)) && 
        v.status === 'active'
      ).slice(0, 4),
      
      occurrences: allOccurrences.filter(o => 
        o.description.toLowerCase().includes(q) || 
        o.unit.toLowerCase().includes(q) ||
        o.residentName.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
      ).slice(0, 4),
      
      notes: allNotes.filter(n => 
        n.content.toLowerCase().includes(q) || 
        (n.category && n.category.toLowerCase().includes(q))
      ).slice(0, 4)
    };
  }, [globalSearchQuery, allResidents, allPackages, visitorLogs, allOccurrences, allNotes]);

  const hasAnyGlobalResult = useMemo(() => {
    if (!globalResults) return false;
    return (
      globalResults.residents.length > 0 || 
      globalResults.packages.length > 0 || 
      globalResults.visitors.length > 0 || 
      globalResults.occurrences.length > 0 || 
      globalResults.notes.length > 0
    );
  }, [globalResults]);

  useEffect(() => {
    if (packageStep === 3 && selectedResident) {
      const itemList = packageItems.map(it => it.name).filter(Boolean).join(', ');
      setPackageMessage(`Olá, ${selectedResident.name}! Recebemos um volume para você (${packageType}) na portaria do Qualivida. ${itemList ? `Itens inclusos: ${itemList}.` : ''} Favor retirar assim que possível.`);
    }
  }, [packageStep, selectedResident, packageType, packageItems]);

  // Visitor Helper Functions
  const handleVisitorCheckOut = (id: string) => {
    setVisitorLogs(prev => prev.map(v => v.id === id ? { ...v, status: 'completed', exitTime: new Date().toISOString() } : v));
  };

  const resetVisitorModal = () => {
    setIsVisitorModalOpen(false);
    setNewVisitorStep(1);
    setNewVisitorData({ unit: '', name: '', doc: '', type: 'Visita', vehicle: '', plate: '', residentName: '' });
    setSearchResident(''); // Reset search when closing
  };

  const handleRegisterVisitor = () => {
    const newVisitor = {
      id: Date.now().toString(),
      residentName: newVisitorData.residentName || 'Desconhecido',
      unit: newVisitorData.unit,
      visitorCount: 1,
      visitorNames: newVisitorData.name,
      entryTime: new Date().toISOString(),
      status: 'active',
      type: newVisitorData.type,
      doc: newVisitorData.doc,
      vehicle: newVisitorData.vehicle,
      plate: newVisitorData.plate
    };
    setVisitorLogs([newVisitor, ...visitorLogs]);
    resetVisitorModal();
  };

  const handleAddAccessType = () => {
    if (newAccessTypeInput.trim()) {
      setVisitorAccessTypes([...visitorAccessTypes, newAccessTypeInput.trim()]);
      setNewAccessTypeInput('');
      setIsAddingAccessType(false);
    }
  };

  const handleRemoveAccessType = (typeToRemove: string) => {
    if (visitorAccessTypes.length > 1) {
      setVisitorAccessTypes(visitorAccessTypes.filter(t => t !== typeToRemove));
      if (newVisitorData.type === typeToRemove) {
        setNewVisitorData({...newVisitorData, type: visitorAccessTypes[0]});
      }
    }
  };

  const handleAddItemRow = () => {
    setPackageItems([...packageItems, { id: Date.now().toString(), name: '', description: '' }]);
    setNumItems(prev => prev + 1);
  };

  const handleRemoveItemRow = (id: string) => {
    if (packageItems.length <= 1) return;
    setPackageItems(packageItems.filter(it => it.id !== id));
    setNumItems(prev => prev + 1);
  };

  const updateItem = (id: string, field: 'name' | 'description', value: string) => {
    setPackageItems(packageItems.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const resetPackageModal = () => {
    setIsNewPackageModalOpen(false);
    setPackageStep(1);
    setSelectedResident(null);
    setSearchResident('');
    setPackageType('Amazon');
    setNumItems(1);
    setPackageItems([{ id: '1', name: '', description: '' }]);
  };

  const handleRegisterPackageFinal = (sendNotify: boolean) => {
    if (!selectedResident) return;
    const newPkg: Package = {
      id: Date.now().toString(),
      recipient: selectedResident.name,
      unit: selectedResident.unit,
      type: packageType,
      receivedAt: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'Pendente',
      deadlineMinutes: 45,
      residentPhone: selectedResident.phone,
      items: packageItems.filter(it => it.name.trim() !== '')
    };
    setAllPackages([newPkg, ...allPackages]);
    
    if (sendNotify && selectedResident.whatsapp) {
      const url = `https://wa.me/${selectedResident.whatsapp}?text=${encodeURIComponent(packageMessage)}`;
      window.open(url, '_blank');
    }
    
    resetPackageModal();
    setActiveTab('dashboard');
  };

  const handleDeliverPackage = (id: string) => {
    setAllPackages(prev => prev.map(p => p.id === id ? { ...p, status: 'Entregue' } : p));
    setSelectedPackageForDetail(null);
  };

  const handleResolveOccurrence = (id: string) => {
    setAllOccurrences(prev => prev.map(occ => occ.id === id ? { ...occ, status: 'Resolvido' } : occ));
  };

  const handleSaveOccurrenceDetails = () => {
    if (!selectedOccurrenceForDetail) return;
    setAllOccurrences(prev => prev.map(o => o.id === selectedOccurrenceForDetail.id ? selectedOccurrenceForDetail : o));
    setSelectedOccurrenceForDetail(null);
  };

  const handleSendReminder = (pkg: Package) => {
    const resident = allResidents.find(r => r.name === pkg.recipient);
    if (resident && resident.whatsapp) {
      const permanence = calculatePermanence(pkg.receivedAt);
      const message = `Olá, ${resident.name}! Temos um volume (${pkg.type}) aguardando por você na portaria do Qualivida há ${permanence}. Favor retirar assim que possível.`;
      const url = `https://wa.me/${resident.whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  const handleAddPkgCategory = () => {
    if (!newPkgCatName.trim()) return;
    setPackageCategories([...packageCategories, newPkgCatName.trim()]);
    setPackageType(newPkgCatName.trim());
    setNewPkgCatName('');
    setIsAddingPkgCategory(false);
  };

  const handleAcknowledgeNotice = (id: string) => {
    setAllNotices(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // RESIDENT HANDLERS
  const handleOpenResidentModal = (resident?: Resident) => {
    if (resident) {
      setResidentFormData(resident);
    } else {
      setResidentFormData({ id: '', name: '', unit: '', email: '', phone: '', whatsapp: '' });
    }
    setIsResidentModalOpen(true);
  };

  const handleSaveResident = () => {
    if (!residentFormData.name || !residentFormData.unit) return;

    if (residentFormData.id) {
      // Edit
      setAllResidents(prev => prev.map(r => r.id === residentFormData.id ? residentFormData : r));
    } else {
      // Create
      const newResident = { ...residentFormData, id: Date.now().toString() };
      setAllResidents(prev => [newResident, ...prev]);
    }
    setIsResidentModalOpen(false);
  };

  const handleDeleteResident = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este morador?")) {
      setAllResidents(prev => prev.filter(r => r.id !== id));
      if (selectedResidentProfile?.id === id) setSelectedResidentProfile(null);
    }
  };

  // NOTICE HANDLERS
  const handleSaveNoticeChanges = () => {
    if (!selectedNoticeForEdit) return;
    setAllNotices(prev => prev.map(n => n.id === selectedNoticeForEdit.id ? selectedNoticeForEdit : n));
    setSelectedNoticeForEdit(null);
  };

  const handleDeleteNotice = () => {
     if (!selectedNoticeForEdit) return;
     setAllNotices(prev => prev.filter(n => n.id !== selectedNoticeForEdit.id));
     setSelectedNoticeForEdit(null);
  };


  // NOTE MODAL STATES
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  
  const [noteCategories, setNoteCategories] = useState([
    { name: 'Geral', color: 'bg-zinc-100' },
    { name: 'Manutenção', color: 'bg-amber-100' },
    { name: 'Segurança', color: 'bg-red-100' },
    { name: 'Entrega', color: 'bg-blue-100' },
  ]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [newNoteCategory, setNewNoteCategory] = useState('Geral');
  const [newNoteScheduled, setNewNoteScheduled] = useState('');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [isOccurrenceModalOpen, setIsOccurrenceModalOpen] = useState(false);
  const [occurrenceDescription, setOccurrenceDescription] = useState('');
  const [occurrenceResidentName, setOccurrenceResidentName] = useState('');
  const [occurrenceUnit, setOccurrenceUnit] = useState('');

  const handleSaveOccurrence = () => {
    if (!occurrenceDescription.trim()) {
      alert('Por favor, descreva a ocorrência.');
      return;
    }

    const newOccurrence: Occurrence = {
      id: Date.now().toString(),
      residentName: occurrenceResidentName.trim() || 'Não informado',
      unit: occurrenceUnit.trim() || 'Não informado',
      description: occurrenceDescription.trim(),
      status: 'Aberto',
      date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      reportedBy: role === 'SINDICO' ? 'Síndico' : 'Portaria'
    };

    setAllOccurrences([newOccurrence, ...allOccurrences]);
    setOccurrenceDescription('');
    setOccurrenceResidentName('');
    setOccurrenceUnit('');
    setIsOccurrenceModalOpen(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveNote = () => {
    if (!newNoteContent.trim()) return;
    if (editingNoteId) {
      setAllNotes(allNotes.map(n => n.id === editingNoteId ? { ...n, content: newNoteContent, category: newNoteCategory, scheduled: newNoteScheduled } : n));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        content: newNoteContent,
        date: new Date().toISOString(),
        completed: false,
        category: newNoteCategory,
        scheduled: newNoteScheduled
      };
      setAllNotes([newNote, ...allNotes]);
    }
    setNewNoteContent('');
    setNewNoteCategory('Geral');
    setNewNoteScheduled('');
    setIsScheduleOpen(false);
    setEditingNoteId(null);
    setIsNewNoteModalOpen(false);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const colors = ['bg-zinc-100', 'bg-amber-100', 'bg-red-100', 'bg-blue-100', 'bg-purple-100', 'bg-green-100'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setNoteCategories([...noteCategories, { name: newCatName.trim(), color: randomColor }]);
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const handleRemoveCategory = (name: string) => {
    if (name === 'Geral') return; 
    setNoteCategories(noteCategories.filter(cat => cat.name !== name));
    if (newNoteCategory === name) setNewNoteCategory('Geral');
  };

  const renderDashboardPorteiro = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 relative">
      <header className="px-2">
          <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-contrast-high leading-tight uppercase">Central Operacional</h3>
          <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-contrast-low">Qualivida Gestão Premium</p>
      </header>

      <div className="relative group z-[100]">
        <SearchCode className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 opacity-40 group-hover:text-[var(--text-primary)] transition-all" />
        <input 
          type="text" 
          placeholder="Busca Geral: Nome, Unidade, Status (Pendente, Entregue), Categoria..." 
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          className="w-full pl-16 pr-6 py-6 text-xl bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-[32px] outline-none font-black tracking-tight focus:ring-4 focus:ring-[var(--text-primary)]/10 transition-all placeholder:opacity-20 shadow-lg"
        />

        {/* PAINEL DE BUSCA GLOBAL (COMMAND PALETTE STYLE) */}
        {globalSearchQuery.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-3 p-4 premium-glass rounded-[40px] shadow-2xl animate-in slide-in-from-top-4 duration-300 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* ... Global Search Content ... */}
            {hasAnyGlobalResult ? (
              <div className="space-y-6 p-2">
                {globalResults?.residents.length > 0 && (
                  <section>
                    <header className="flex items-center gap-2 mb-3 px-3">
                      <Users className="w-3 h-3 opacity-30" />
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Moradores</span>
                    </header>
                    <div className="grid grid-cols-1 gap-2">
                      {globalResults.residents.map(r => (
                        <button 
                          key={r.id} 
                          onClick={() => { setActiveTab('residents'); setGlobalSearchQuery(''); setResidentSearch(r.name); }}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between text-left transition-all group"
                        >
                          <div>
                            <h6 className="text-sm font-black uppercase tracking-tight">{r.name}</h6>
                            <p className="text-[10px] opacity-40 uppercase font-black">Unidade {r.unit}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {/* ... other categories ... */}
              </div>
            ) : (
              <div className="py-12 text-center">
                 <Search className="w-8 h-8 opacity-10 mx-auto mb-4" />
                 <p className="text-xs font-black uppercase tracking-widest opacity-20">Nenhum resultado para "{globalSearchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-0">
        <RecentEventsBar eventStates={eventStates} onOpenQuickView={(cat) => setQuickViewCategory(cat)} />

        <div 
          onClick={() => setIsNewPackageModalOpen(true)}
          className="w-full contrast-card rounded-[48px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between transition-all shadow-2xl relative overflow-hidden group cursor-pointer border-none"
        >
          {/* ... Main Card Content ... */}
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 w-full">
            <div className="w-24 h-24 rounded-[32px] bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-xl">
               <PackageIcon className="w-10 h-10" />
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Gestão de Recebimentos</span>
              <h4 className="text-4xl md:text-5xl font-black tracking-tighter leading-none uppercase mt-2">Registro de Encomendas</h4>
              <p className="text-sm font-medium opacity-60 mt-3 max-w-lg">Fácil de registrar.</p>
            </div>
            <div className="md:ml-auto">
               <div className="w-16 h-16 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all active:scale-90">
                  <ArrowRight className="w-6 h-6" />
               </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-black opacity-[0.02] rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div onClick={() => setActiveTab('visitors')} className="group secondary-card p-8 h-[240px] rounded-[48px] flex flex-col justify-between cursor-pointer shadow-xl transition-all">
           <Users className="w-8 h-8 opacity-20" />
           <div className="mt-auto">
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">VISITANTES</h3>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2">Controle de acesso</p>
           </div>
           <div className="flex justify-end mt-4">
              <ChevronRight className="w-6 h-6 opacity-20 group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
        {/* ... Other Cards ... */}
        <div onClick={() => setActiveTab('occurrences')} className="group secondary-card p-8 h-[240px] rounded-[48px] flex flex-col justify-between cursor-pointer shadow-xl transition-all">
           <ShieldAlert className="w-8 h-8 opacity-20" />
           <div className="mt-auto">
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">OCORRÊNCIAS</h3>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2">Segurança e Relatos</p>
           </div>
           <div className="flex justify-end mt-4">
              <ChevronRight className="w-6 h-6 opacity-20 group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
        <div onClick={() => setActiveTab('residents')} className="group secondary-card p-8 h-[240px] rounded-[48px] flex flex-col justify-between cursor-pointer shadow-xl transition-all">
           <Home className="w-8 h-8 opacity-20" />
           <div className="mt-auto">
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">MORADORES</h3>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2">Base de unidades</p>
           </div>
           <div className="flex justify-end mt-4">
              <ChevronRight className="w-6 h-6 opacity-20 group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        if (role === 'SINDICO') {
          return (
            <SindicoDashboardView
              allPackages={allPackages}
              visitorLogs={visitorLogs}
              allOccurrences={allOccurrences}
              allResidents={allResidents}
              setActiveTab={setActiveTab}
              setActiveNoticeTab={setActiveNoticeTab}
            />
          );
        }
        return renderDashboardPorteiro();
      case 'notices': 
        const filteredNotices = allNotices.filter(n => {
           if (noticeFilter === 'urgent') return n.category === 'Urgente';
           if (noticeFilter === 'unread') return !n.read;
           return true;
        }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)); // Pinned first

        return (
           <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 overflow-hidden">
              
              {/* Header Mobile Switcher */}
              <div className="md:hidden flex justify-center mb-4">
                 <div className="bg-white/5 p-1 rounded-full flex">
                    <button 
                      onClick={() => setActiveNoticeTab('wall')}
                      className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeNoticeTab === 'wall' ? 'bg-white text-black' : 'text-zinc-500'}`}
                    >
                       Mural
                    </button>
                    <button 
                      onClick={() => setActiveNoticeTab('chat')}
                      className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeNoticeTab === 'chat' ? 'bg-white text-black' : 'text-zinc-500'}`}
                    >
                       Chat
                    </button>
                 </div>
              </div>

              {/* COLUNA ESQUERDA: MURAL DE VIDRO (MASONRY) */}
              <div className={`flex-1 flex flex-col min-h-0 ${activeNoticeTab === 'chat' ? 'hidden md:flex' : 'flex'}`}>
                 <div className="flex justify-between items-end mb-6 pb-6 border-b border-white/5 flex-shrink-0">
                    <div>
                       <h3 className="text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Mural Digital</h3>
                       <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mt-1">Avisos & Comunicados</p>
                    </div>
                    <div className="flex gap-2">
                       {['all', 'urgent', 'unread'].map(f => (
                          <button
                             key={f}
                             onClick={() => setNoticeFilter(f as any)}
                             className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${noticeFilter === f ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                          >
                             {f === 'all' ? 'Todos' : f === 'urgent' ? 'Urgentes' : 'Não Lidos'}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
                    <div className="columns-1 lg:columns-2 gap-6 space-y-6">
                       {filteredNotices.map((notice, idx) => {
                          const isSindico = notice.authorRole === 'SINDICO';
                          
                          return (
                             <div 
                                key={notice.id}
                                className={`break-inside-avoid relative overflow-hidden rounded-[32px] border backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 shadow-2xl group ${
                                   isSindico 
                                      ? 'bg-amber-950/10 border-amber-500/20 shadow-amber-500/5' 
                                      : 'bg-cyan-950/10 border-cyan-500/20 shadow-cyan-500/5'
                                } ${notice.read ? 'opacity-60 grayscale-[0.3]' : 'opacity-100'}`}
                             >
                                {/* Role Indicator Stripe */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isSindico ? 'from-amber-400 via-yellow-200 to-amber-600' : 'from-cyan-400 via-blue-200 to-cyan-600'} opacity-80`} />

                                {/* Pinned Icon */}
                                {notice.pinned && (
                                   <div className="absolute top-4 right-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] rotate-45 z-10">
                                      <Pin className="w-5 h-5 fill-white" />
                                   </div>
                                )}

                                <div className="p-8">
                                   <div className="flex items-center gap-3 mb-6">
                                      <div className={`p-2 rounded-xl ${isSindico ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                         {isSindico ? <Crown className="w-4 h-4" /> : <BadgeInfo className="w-4 h-4" />}
                                      </div>
                                      <div>
                                         <span className={`text-[9px] font-black uppercase tracking-widest block ${isSindico ? 'text-amber-500' : 'text-cyan-500'}`}>
                                            {isSindico ? 'Administração' : 'Operacional'}
                                         </span>
                                         <span className="text-[10px] font-bold text-zinc-500 uppercase">{notice.author} • {new Date(notice.date).toLocaleDateString()}</span>
                                      </div>
                                   </div>

                                   <h4 className="text-2xl font-black uppercase leading-tight mb-4 text-white">{notice.title}</h4>
                                   <p className="text-sm font-medium text-zinc-400 leading-relaxed mb-8">{notice.content}</p>

                                   <button 
                                      onClick={() => handleAcknowledgeNotice(notice.id)}
                                      disabled={notice.read}
                                      className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                                         notice.read 
                                         ? 'bg-zinc-900/50 text-zinc-600 cursor-default border border-white/5' 
                                         : `hover:scale-[1.02] active:scale-95 shadow-lg ${isSindico ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-cyan-500 text-black hover:bg-cyan-400'}`
                                      }`}
                                   >
                                      {notice.read ? (
                                         <>Lido <CheckCheck className="w-4 h-4" /></>
                                      ) : (
                                         <>Confirmar Leitura <Check className="w-4 h-4" /></>
                                      )}
                                   </button>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 </div>
              </div>

              {/* COLUNA DIREITA: CHAT "LINHA DIRETA" (STREAM) */}
              <div className={`w-full md:w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col bg-zinc-950/50 backdrop-blur-2xl border-l border-white/5 md:rounded-l-[40px] md:my-0 ${activeNoticeTab === 'wall' ? 'hidden md:flex' : 'flex'}`}>
                 <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 md:rounded-tl-[40px]">
                    <div className="flex items-center gap-4">
                       <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white shadow-lg">
                             <MessageSquareText className="w-6 h-6" />
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black uppercase text-white">Linha Direta</h4>
                          <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online Agora</p>
                       </div>
                    </div>
                 </div>

                 {/* Messages Stream */}
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {chatMessages.map((msg) => {
                       const isMe = msg.senderRole === role;
                       return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[85%] p-4 relative group transition-all hover:scale-[1.01] ${
                                isMe 
                                   ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-emerald-900/20' 
                                   : 'bg-white/10 backdrop-blur-md text-zinc-200 rounded-2xl rounded-tl-sm border border-white/5'
                             }`}>
                                <p className="text-xs font-bold leading-relaxed">{msg.text}</p>
                                <div className="flex items-center justify-end gap-1 mt-2 opacity-50">
                                   <span className="text-[9px] font-black uppercase">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                   {isMe && <CheckCheck className="w-3 h-3 text-blue-300" />}
                                </div>
                             </div>
                          </div>
                       );
                    })}
                    <div ref={chatEndRef} />
                 </div>

                 {/* Input Area */}
                 <div className="p-4 bg-zinc-900/80 border-t border-white/5 md:rounded-bl-[40px]">
                    <div className="relative flex items-center gap-2">
                       <button className="p-3 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5">
                          <Paperclip className="w-5 h-5" />
                       </button>
                       <div className="flex-1 relative">
                          <input 
                             type="text" 
                             value={chatInput}
                             onChange={(e) => setChatInput(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                             placeholder="Digite sua mensagem..."
                             className="w-full bg-black/40 border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm font-medium text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-600"
                          />
                          <button 
                             onClick={handleSendChatMessage}
                             disabled={!chatInput.trim()}
                             className={`absolute right-1 top-1 p-2 rounded-full transition-all ${
                                chatInput.trim() 
                                   ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95' 
                                   : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                             }`}
                          >
                             <SendHorizontal className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        );
      case 'reservations':
        const displayReservations = dayReservations.filter(r => {
          if (reservationFilter === 'all') return true;
          // Filter 'today' is approximate string match for demo
          if (reservationFilter === 'today') return r.date.includes('JAN'); 
          if (reservationFilter === 'pending') return r.status === 'active' || r.status === 'scheduled';
          return true;
        });

        return (
          <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Cabeçalho Premium com Busca Integrada */}
            <div className="space-y-6">
                <div>
                   <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">RESERVAS</h3>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Gestão Inteligente de Espaços</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                   <div className="relative flex-1 w-full">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input 
                         type="text" 
                         placeholder="Buscar por morador, unidade ou área..." 
                         className="w-full pl-16 pr-6 py-5 bg-zinc-900 border border-white/5 rounded-[24px] text-sm font-bold outline-none text-white placeholder:text-zinc-600 focus:border-white/20 transition-all shadow-lg"
                      />
                   </div>
                   <button 
                     onClick={() => setIsReservationModalOpen(true)}
                     className="w-full md:w-auto px-10 py-5 bg-white text-black rounded-[24px] text-[11px] font-black uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3"
                   >
                      <Plus className="w-5 h-5" /> Nova Reserva
                   </button>
                </div>
            </div>

            {/* Grid de Status Minimalista */}
            <div>
               <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                  <h6 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Visão Geral dos Espaços</h6>
                  
                  {/* Filtros One-Tap */}
                  <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto no-scrollbar">
                     <button 
                        onClick={() => setReservationFilter('today')}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${reservationFilter === 'today' ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                     >
                        Hoje
                     </button>
                     <button 
                        onClick={() => setReservationFilter('pending')}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${reservationFilter === 'pending' ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                     >
                        Pendentes
                     </button>
                     <button 
                        onClick={() => setReservationFilter('all')}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${reservationFilter === 'all' ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                     >
                        Todos
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {areasStatus.map(area => (
                    <div key={area.id} className="group relative overflow-hidden p-6 bg-[#18181b] rounded-[32px] h-40 flex flex-col justify-between hover:bg-[#202023] transition-all cursor-default border border-transparent hover:border-white/5">
                       <div className="flex justify-between items-start z-10">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors ${parseInt(area.today) > 0 ? 'bg-red-500/20 text-red-500' : 'bg-[#27272a] group-hover:bg-white/10'}`}>
                             <area.icon className="w-5 h-5" />
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg ${parseInt(area.today) > 0 ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 bg-zinc-800'}`}>
                             {parseInt(area.today) > 0 ? 'EM USO' : 'LIVRE'}
                          </span>
                       </div>
                       <div className="z-10">
                          <h6 className="font-black text-xs uppercase leading-tight text-white tracking-tight">{area.name}</h6>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-2">
                             Max {area.capacity} • {area.today}
                          </p>
                       </div>
                       {/* Efeito Glow Sutil no Hover */}
                       <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                 ))}
               </div>
            </div>

            {/* Timeline Visual (Mock) */}
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden flex mb-2 opacity-50">
               {/* Mockup visual de ocupação do dia (Barra) */}
               <div className="w-[30%] bg-zinc-800" /> {/* Manhã livre */}
               <div className="w-[10%] bg-blue-900/40" /> {/* Ocupado */}
               <div className="w-[20%] bg-zinc-800" />
               <div className="w-[15%] bg-blue-900/40" /> 
               <div className="w-[25%] bg-zinc-800" />
            </div>
            <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-8 px-1">
               <span>06:00</span>
               <span>12:00</span>
               <span>18:00</span>
               <span>00:00</span>
            </div>

            {/* Lista de Reservas (Cards) */}
            <div>
               {displayReservations.length > 0 ? (
                 <div className="space-y-4">
                   {displayReservations.map(res => {
                      // Parse Mock Date for Calendar Badge
                      const [month, day] = res.date.split(' ');
                      
                      return (
                      <div key={res.id} className={`p-1 bg-gradient-to-r ${res.status === 'active' ? 'from-green-500/20 to-transparent' : 'from-transparent to-transparent'} rounded-[36px] transition-all`}>
                        <div className="p-6 md:p-8 bg-[#09090b] rounded-[32px] border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center gap-6 group">
                           
                           {/* Date Badge */}
                           <div className="flex-shrink-0 flex md:block items-center gap-4">
                              <div className="bg-[#121214] rounded-2xl w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center border border-white/5 group-hover:border-white/20 transition-colors shadow-inner">
                                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{month}</span>
                                 <span className="text-2xl md:text-3xl font-black text-white leading-none mt-1">{day}</span>
                              </div>
                           </div>

                           {/* Info */}
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                 <h5 className="font-black text-lg md:text-xl uppercase text-white leading-tight tracking-tight truncate">{res.area}</h5>
                                 {res.status === 'active' && (
                                    <span className="px-2 py-0.5 rounded-md bg-green-500 text-black text-[8px] font-black uppercase tracking-widest animate-pulse">
                                       Em Andamento
                                    </span>
                                 )}
                              </div>
                              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                 <Users className="w-4 h-4" />
                                 <p className="text-xs font-bold uppercase tracking-wide text-white">{res.resident} <span className="text-zinc-600">• UN {res.unit}</span></p>
                              </div>
                              <div className="flex items-center gap-2 text-zinc-500">
                                 <Clock className="w-3 h-3" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest">{res.time}</span>
                              </div>
                           </div>

                           {/* Action Button */}
                           <div className="w-full md:w-auto flex-shrink-0">
                              {res.status === 'scheduled' && (
                                 <button 
                                   onClick={() => handleReservationAction(res.id)}
                                   className="w-full md:w-40 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_25px_-5px_rgba(37,99,235,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
                                 >
                                    <Check className="w-4 h-4" /> Check-in
                                 </button>
                              )}
                              {res.status === 'active' && (
                                 <button 
                                   onClick={() => handleReservationAction(res.id)}
                                   className="w-full md:w-40 py-4 bg-zinc-800 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                 >
                                    <Timer className="w-4 h-4" /> Check-out
                                 </button>
                              )}
                              {res.status === 'completed' && (
                                 <div className="w-full md:w-40 py-4 bg-zinc-900/50 text-zinc-600 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/5 flex items-center justify-center gap-2 cursor-default">
                                    Finalizado
                                 </div>
                              )}
                           </div>
                        </div>
                      </div>
                      );
                   })}
                 </div>
               ) : (
                  <div className="py-24 text-center opacity-30 font-black uppercase text-xs tracking-[0.2em] border-2 border-dashed border-white/5 rounded-[48px] flex flex-col items-center gap-4">
                     <CalendarIcon className="w-10 h-10 opacity-50" />
                     Nenhuma reserva encontrada para este filtro
                  </div>
               )}
            </div>
          </div>
        );
      case 'residents':
        // ... (existing code)
        const displayResidents = allResidents.filter(r => 
          r.name.toLowerCase().includes(residentSearch.toLowerCase()) || 
          r.unit.toLowerCase().includes(residentSearch.toLowerCase())
        );
        return (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* ... header ... */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Moradores</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Gestão de Unidades</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                   <input 
                      type="text" 
                      placeholder="Buscar por Nome ou Unidade..." 
                      value={residentSearch}
                      onChange={e => setResidentSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-bold outline-none focus:border-white/30 transition-all placeholder:opacity-20"
                   />
                </div>
                <button 
                  onClick={() => handleOpenResidentModal()} 
                  className="px-6 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-transform whitespace-nowrap flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Novo Morador
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayResidents.map(resident => {
                const hasPendingPackage = allPackages.some(p => p.recipient === resident.name && p.status === 'Pendente');
                const hasActiveVisitor = visitorLogs.some(v => v.residentName === resident.name && v.status === 'active');
                
                return (
                  <div 
                    key={resident.id} 
                    onClick={() => setSelectedResidentProfile(resident)}
                    className="premium-glass p-6 rounded-[32px] group relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-2xl hover:bg-white/5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-6">
                       <div className="relative">
                         <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center justify-center text-xl font-black relative overflow-hidden">
                            {resident.name.substring(0, 2).toUpperCase()}
                            {/* Status dots attached to avatar */}
                            <div className="absolute top-1 right-1 flex gap-1">
                               {hasPendingPackage && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-black animate-pulse" title="Encomenda Pendente" />}
                               {hasActiveVisitor && <span className="w-2.5 h-2.5 bg-purple-500 rounded-full ring-2 ring-black" title="Visitante Ativo" />}
                            </div>
                         </div>
                       </div>
                       
                       <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenResidentModal(resident); }}
                            className="p-2 bg-white/5 rounded-xl hover:bg-white text-white hover:text-black transition-all" 
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteResident(resident.id); }}
                            className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" 
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>

                    <div>
                       <span className="px-3 py-1 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-widest border border-white/5">Unidade {resident.unit}</span>
                       <h4 className="text-xl font-black uppercase mt-3 leading-tight truncate group-hover:text-blue-400 transition-colors">{resident.name}</h4>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                       {resident.whatsapp && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${resident.whatsapp}`, '_blank'); }}
                           className="flex-1 py-3 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all text-[10px] font-black uppercase flex items-center justify-center gap-2"
                         >
                           <MessageCircle className="w-3 h-3" /> WhatsApp
                         </button>
                       )}
                       {resident.email && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); window.open(`mailto:${resident.email}`, '_blank'); }}
                           className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white hover:text-black transition-all text-[10px] font-black uppercase flex items-center justify-center gap-2"
                         >
                           <Mail className="w-3 h-3" /> Email
                         </button>
                       )}
                    </div>
                  </div>
                );
              })}
              
              {displayResidents.length === 0 && (
                 <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[48px] opacity-30">
                    <UserCircle className="w-12 h-12 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Nenhum morador encontrado</p>
                 </div>
              )}
            </div>
          </div>
        );
      case 'visitors':
        // ... (existing code)
        const displayVisitors = visitorLogs.filter(v => {
          const matchSearch = (v.visitorNames || '').toLowerCase().includes(visitorSearch.toLowerCase()) || 
                              (v.residentName || '').toLowerCase().includes(visitorSearch.toLowerCase()) ||
                              (v.unit || '').toLowerCase().includes(visitorSearch.toLowerCase());
          
          if (visitorTab === 'active') return v.status === 'active' && matchSearch;
          if (visitorTab === 'history') return v.status === 'completed' && matchSearch;
          if (visitorTab === 'service') return v.status === 'active' && v.type === 'Prestador' && matchSearch;
          return false;
        });

        return (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Visitantes</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Controle de Acesso em Tempo Real</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                   <input 
                      type="text" 
                      placeholder="Nome, Unidade, Placa..." 
                      value={visitorSearch}
                      onChange={e => setVisitorSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-bold outline-none focus:border-white/30 transition-all placeholder:opacity-20"
                   />
                </div>
                <button 
                  onClick={() => setIsVisitorModalOpen(true)}
                  className="px-6 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-transform whitespace-nowrap flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Novo Acesso
                </button>
              </div>
            </header>

            {/* Abas de Navegação */}
            <div className="flex gap-2 border-b border-white/10 pb-4">
               {['active', 'history', 'service'].map((tab) => (
                 <button 
                   key={tab}
                   onClick={() => setVisitorTab(tab as any)}
                   className={`px-6 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${
                     visitorTab === tab 
                     ? 'bg-white text-black shadow-lg scale-105' 
                     : 'bg-white/5 text-white/40 hover:bg-white/10'
                   }`}
                 >
                   {tab === 'active' && 'No Condomínio'}
                   {tab === 'history' && 'Histórico'}
                   {tab === 'service' && 'Prestadores'}
                 </button>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayVisitors.map(visitor => {
                const permanence = calculatePermanence(visitor.entryTime);
                const isLongStay = (new Date().getTime() - new Date(visitor.entryTime).getTime()) > 8 * 60 * 60 * 1000;
                
                return (
                  <div 
                    key={visitor.id} 
                    className={`premium-glass p-6 rounded-[32px] relative overflow-hidden group transition-all hover:scale-[1.01] ${isLongStay && visitor.status === 'active' ? 'border-red-500/30' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                       <h4 className="text-xl font-black uppercase tracking-tight">{visitor.visitorNames}</h4>
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                         visitor.type === 'Prestador' ? 'bg-amber-500/20 text-amber-500' : 
                         visitor.type === 'Delivery' ? 'bg-blue-500/20 text-blue-500' : 
                         'bg-purple-500/20 text-purple-500'
                       }`}>
                         {visitor.type || 'Visita'}
                       </span>
                    </div>

                    <div className="space-y-3 mb-6">
                       <div className="flex items-center gap-3 opacity-60">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase">Indo para: Unidade {visitor.unit} ({visitor.residentName})</span>
                       </div>
                       <div className="flex items-center gap-3 opacity-60">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase">
                             {visitor.status === 'active' 
                               ? `Entrada: ${new Date(visitor.entryTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • Há ${permanence}`
                               : `Saída: ${new Date(visitor.exitTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`
                             }
                          </span>
                       </div>
                       {visitor.vehicle && (
                         <div className="flex items-center gap-3 opacity-60">
                            <Car className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">{visitor.vehicle} {visitor.plate && `• ${visitor.plate}`}</span>
                         </div>
                       )}
                    </div>

                    {visitor.status === 'active' && (
                      <button 
                        onClick={() => handleVisitorCheckOut(visitor.id)}
                        className="w-full py-4 bg-zinc-100 dark:bg-white/10 text-black dark:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Registrar Saída
                      </button>
                    )}
                  </div>
                );
              })}
              
              {displayVisitors.length === 0 && (
                 <div className="col-span-full py-20 text-center opacity-20 font-black uppercase text-sm tracking-widest border-2 border-dashed border-white/5 rounded-[48px]">
                    Nenhum visitante encontrado nesta categoria
                 </div>
              )}
            </div>
          </div>
        );
      case 'packages': 
        // ... (existing code)
        const displayPackages = allPackages.filter(p => 
          p.recipient.toLowerCase().includes(packageSearch.toLowerCase()) ||
          p.type.toLowerCase().includes(packageSearch.toLowerCase()) ||
          p.unit.toLowerCase().includes(packageSearch.toLowerCase()) ||
          p.displayTime.toLowerCase().includes(packageSearch.toLowerCase()) ||
          p.status.toLowerCase().includes(packageSearch.toLowerCase())
        );
        return (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Encomendas</h3>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                   <input 
                      type="text" 
                      placeholder="Pesquisar Encomenda..." 
                      value={packageSearch}
                      onChange={e => setPackageSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-bold outline-none focus:border-white/30 transition-all placeholder:opacity-20"
                   />
                </div>
                <button onClick={() => setIsNewPackageModalOpen(true)} className="px-6 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-transform whitespace-nowrap"><Plus className="w-4 h-4 inline mr-2" /> Novo Registro</button>
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayPackages.map(pkg => (
                <div 
                  key={pkg.id} 
                  onClick={() => setSelectedPackageForDetail(pkg)}
                  className="premium-glass p-6 rounded-[32px] flex justify-between items-center cursor-pointer group"
                >
                  <div>
                    <p className="text-[10px] font-black opacity-40 uppercase">{pkg.type}</p>
                    <h4 className="font-black text-lg group-hover:text-blue-500 transition-colors">{pkg.recipient}</h4>
                    <p className="text-xs opacity-60">Unidade {pkg.unit} • {pkg.displayTime}</p>
                    {pkg.items && pkg.items.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {pkg.items.slice(0, 2).map((it, idx) => (
                          <span key={idx} className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded-md uppercase font-bold opacity-40">{it.name}</span>
                        ))}
                        {pkg.items.length > 2 && <span className="text-[8px] opacity-20 font-bold">+{pkg.items.length - 2}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${pkg.status === 'Pendente' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                      {pkg.status}
                    </span>
                  </div>
                </div>
              ))}
              {displayPackages.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-20 font-black uppercase text-sm tracking-widest border-2 border-dashed border-white/5 rounded-[48px]">
                   Nenhuma encomenda encontrada
                </div>
              )}
            </div>
          </div>
        );
      // ... rest of switch cases
      case 'occurrences': 
        const displayOccurrences = allOccurrences.filter(occ => 
          occ.residentName.toLowerCase().includes(occurrenceSearch.toLowerCase()) ||
          occ.unit.toLowerCase().includes(occurrenceSearch.toLowerCase()) ||
          occ.description.toLowerCase().includes(occurrenceSearch.toLowerCase()) ||
          occ.date.toLowerCase().includes(occurrenceSearch.toLowerCase()) ||
          occ.status.toLowerCase().includes(occurrenceSearch.toLowerCase())
        );
        return (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Ocorrências</h3>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                   <input 
                      type="text" 
                      placeholder="Pesquisar Ocorrência..." 
                      value={occurrenceSearch}
                      onChange={e => setOccurrenceSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-bold outline-none focus:border-white/30 transition-all placeholder:opacity-20"
                   />
                </div>
                <button onClick={() => setIsOccurrenceModalOpen(true)} className="px-6 py-3 bg-red-600 text-white rounded-full text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-transform whitespace-nowrap"><Plus className="w-4 h-4 inline mr-2" /> Nova Ocorrência</button>
              </div>
            </header>
            <div className="space-y-4">
              {displayOccurrences.map(occ => (
                <div key={occ.id} className="premium-glass p-6 rounded-[32px]">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-lg uppercase">{occ.residentName} - {occ.unit}</h4>
                    <span className="text-[10px] font-black uppercase opacity-40">{occ.date}</span>
                  </div>
                  <p className="text-sm opacity-70 mb-4">{occ.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${occ.status === 'Aberto' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                      {occ.status}
                    </span>
                    {occ.status === 'Aberto' && (
                      <button 
                        onClick={() => handleResolveOccurrence(occ.id)}
                        className="px-4 py-1.5 bg-zinc-100 text-black rounded-xl text-[9px] font-black uppercase hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-sm border border-black/5"
                      >
                        <Check className="w-3 h-3" /> Resolver
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {displayOccurrences.length === 0 && (
                <div className="py-20 text-center opacity-20 font-black uppercase text-sm tracking-widest border-2 border-dashed border-white/5 rounded-[48px]">
                   Nenhuma ocorrência encontrada
                </div>
              )}
            </div>
          </div>
        );
      case 'notes': return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
          <header className="flex justify-between items-center">
            <h3 className="text-3xl font-black uppercase tracking-tighter">Bloco de Notas</h3>
            <button onClick={() => { setEditingNoteId(null); setNewNoteContent(''); setIsNewNoteModalOpen(true); }} className="px-6 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-transform"><Plus className="w-4 h-4 inline mr-2" /> Criar Nota</button>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allNotes.map(note => (
              <div 
                key={note.id} 
                onClick={() => { setEditingNoteId(note.id); setNewNoteContent(note.content); setIsNewNoteModalOpen(true); }}
                className={`premium-glass p-6 rounded-[32px] cursor-pointer hover:border-white/40 transition-all ${note.completed ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded-lg">{note.category}</span>
                  <span className="text-[9px] font-black opacity-40 uppercase">{note.date.includes('T') ? new Date(note.date).toLocaleDateString() : note.date}</span>
                </div>
                <p className={`text-sm font-medium ${note.completed ? 'line-through' : ''}`}>{note.content}</p>
                <div className="mt-6 flex justify-end">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setAllNotes(allNotes.map(n => n.id === note.id ? {...n, completed: !n.completed} : n));
                     }} 
                     className="p-2 hover:bg-white/10 rounded-xl transition-all"
                   >
                     {note.completed ? <Check className="w-5 h-5 text-green-500" /> : <Minus className="w-5 h-5 opacity-40" />}
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      case 'reports':
        return (
          <AiReportsView
            allPackages={allPackages}
            visitorLogs={visitorLogs}
            allOccurrences={allOccurrences}
            allNotes={allNotes}
            dayReservations={dayReservations}
          />
        );
      case 'ai':
        return (
          <AiView
            allPackages={allPackages}
            visitorLogs={visitorLogs}
            allOccurrences={allOccurrences}
            allNotes={allNotes}
            allResidents={allResidents}
            dayReservations={dayReservations}
            allNotices={allNotices}
            chatMessages={chatMessages}
          />
        );
      case 'settings':
        return <SettingsView />;
      case 'staff':
        return (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex justify-between items-center">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Funcionários</h3>
            </header>
            <div className="text-center py-20 opacity-40">
              <p className="text-sm font-black uppercase">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );
      default: return <div className="p-10 text-center opacity-40 font-black uppercase">{activeTab}</div>;
    }
  };

  if (isScreenSaverActive) return <ScreenSaver onExit={() => setIsScreenSaverActive(false)} theme={theme} />;
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!user || !role) return <Login />;

  return (
    <>
      <Layout
        activeTab={activeTab} setActiveTab={setActiveTab} role={role}
        onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme}
        notificationCount={notificationCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      >
        {renderContent()}
      </Layout>

      {role === 'PORTEIRO' && <DraggableFab onClick={() => { setEditingNoteId(null); setNewNoteContent(''); setIsNewNoteModalOpen(true); }} />}

      {/* MODAL DE NOTIFICAÇÕES */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsNotificationsOpen(false)} />
          <div className="relative w-full max-w-lg bg-white text-black rounded-[32px] md:rounded-[40px] shadow-2xl p-6 md:p-8 lg:p-10 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <header className="flex justify-between items-start gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-zinc-50 flex-shrink-0">
                  <Bell className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight">Notificações</h4>
                  <p className="text-xs md:text-[10px] font-bold opacity-40 uppercase tracking-widest">Central de Alertas</p>
                </div>
              </div>
              <button onClick={() => setIsNotificationsOpen(false)} className="flex-shrink-0 p-2.5 md:p-3 bg-zinc-100 rounded-xl md:rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="space-y-3 md:space-y-4">
              {/* Encomendas Pendentes */}
              {allPackages.filter(p => p.status === 'Pendente' && !dismissedNotifications.has(`package-${p.id}`)).map((pkg) => (
                <div 
                  key={pkg.id}
                  onClick={() => { setActiveTab('packages'); setIsNotificationsOpen(false); }}
                  className="p-4 md:p-5 rounded-[20px] md:rounded-[24px] flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-95 min-h-[60px] group relative border"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="p-2.5 md:p-3 bg-blue-500 rounded-xl flex-shrink-0">
                      <PackageIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h6 className="font-black text-sm md:text-base uppercase break-words" style={{ color: 'var(--text-primary)' }}>Encomenda Pendente</h6>
                      <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>{pkg.recipient} - {pkg.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => handleDismissNotification('package', pkg.id, e)}
                      className="p-1.5 md:p-2 rounded-lg transition-all active:scale-95 opacity-0 group-hover:opacity-100 flex items-center justify-center min-w-[32px] min-h-[32px]"
                      style={{ backgroundColor: 'var(--glass-bg)' }}
                      title="Descartar notificação"
                    >
                      <X className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: 'var(--text-primary)' }} />
                    </button>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 opacity-30 flex-shrink-0" />
                  </div>
                </div>
              ))}

              {/* Visitantes Ativos */}
              {visitorLogs.filter(v => v.status === 'active' && !dismissedNotifications.has(`visitor-${v.id}`)).map((visitor) => (
                <div 
                  key={visitor.id}
                  onClick={() => { setActiveTab('visitors'); setIsNotificationsOpen(false); }}
                  className="p-4 md:p-5 rounded-[20px] md:rounded-[24px] flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-95 min-h-[60px] group relative border"
                  style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="p-2.5 md:p-3 bg-purple-500 rounded-xl flex-shrink-0">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h6 className="font-black text-sm md:text-base uppercase break-words" style={{ color: 'var(--text-primary)' }}>Visitante no Prédio</h6>
                      <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>{visitor.visitorNames || visitor.residentName} - {visitor.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => handleDismissNotification('visitor', visitor.id, e)}
                      className="p-1.5 md:p-2 rounded-lg hover:bg-purple-200 transition-all active:scale-95 opacity-0 group-hover:opacity-100 flex items-center justify-center min-w-[32px] min-h-[32px]"
                      title="Descartar notificação"
                    >
                      <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600" />
                    </button>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 opacity-30 flex-shrink-0" />
                  </div>
                </div>
              ))}

              {/* Ocorrências Abertas */}
              {allOccurrences.filter(o => o.status === 'Aberto' && !dismissedNotifications.has(`occurrence-${o.id}`)).map((occurrence) => (
                <div 
                  key={occurrence.id}
                  onClick={() => { setActiveTab('occurrences'); setIsNotificationsOpen(false); }}
                  className="p-4 md:p-5 rounded-[20px] md:rounded-[24px] flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-95 min-h-[60px] group relative border"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="p-2.5 md:p-3 bg-red-500 rounded-xl flex-shrink-0">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h6 className="font-black text-sm md:text-base uppercase break-words">Ocorrência Aberta</h6>
                      <p className="text-xs md:text-sm opacity-60">{occurrence.residentName} - {occurrence.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => handleDismissNotification('occurrence', occurrence.id, e)}
                      className="p-1.5 md:p-2 rounded-lg transition-all active:scale-95 opacity-0 group-hover:opacity-100 flex items-center justify-center min-w-[32px] min-h-[32px]"
                      style={{ backgroundColor: 'var(--glass-bg)' }}
                      title="Descartar notificação"
                    >
                      <X className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: 'var(--text-primary)' }} />
                    </button>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 opacity-30 flex-shrink-0" />
                  </div>
                </div>
              ))}

              {/* Notas Pendentes */}
              {allNotes.filter(n => !n.completed && !dismissedNotifications.has(`note-${n.id}`)).map((note) => (
                <div 
                  key={note.id}
                  onClick={() => { setActiveTab('notes'); setIsNotificationsOpen(false); }}
                  className="p-4 md:p-5 rounded-[20px] md:rounded-[24px] flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-95 min-h-[60px] group relative border"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="p-2.5 md:p-3 bg-amber-500 rounded-xl flex-shrink-0">
                      <PenTool className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h6 className="font-black text-sm md:text-base uppercase break-words" style={{ color: 'var(--text-primary)' }}>Lembrete Pendente</h6>
                      <p className="text-xs md:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{note.content.substring(0, 40)}{note.content.length > 40 ? '...' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => handleDismissNotification('note', note.id, e)}
                      className="p-1.5 md:p-2 rounded-lg transition-all active:scale-95 opacity-0 group-hover:opacity-100 flex items-center justify-center min-w-[32px] min-h-[32px]"
                      style={{ backgroundColor: 'var(--glass-bg)' }}
                      title="Descartar notificação"
                    >
                      <X className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: 'var(--text-primary)' }} />
                    </button>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 opacity-30 flex-shrink-0" />
                  </div>
                </div>
              ))}

              {/* Mensagem quando não há notificações */}
              {notificationCount === 0 && (
                <div className="py-12 text-center italic font-black uppercase text-xs border-2 border-dashed rounded-[24px]" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)', opacity: 0.4 }}>
                  Nenhuma notificação pendente
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POP-UP QUICKVIEW */}
      <QuickViewModal 
        category={quickViewCategory} 
        data={quickViewData} 
        onClose={() => setQuickViewCategory(null)} 
        onGoToPage={(tab) => setActiveTab(tab)}
        onMarkAsDone={(note) => {
          setAllNotes(prev => prev.map(n => n.id === note.id ? { ...n, completed: true } : n));
        }}
        onAddNew={() => {
          if (quickViewCategory === 'visitors') {
            setQuickViewCategory(null);
            resetVisitorModal();
            setIsVisitorModalOpen(true);
          }
        }}
        onSelectItem={(item) => { 
          if (quickViewCategory === 'packages') {
            setSelectedPackageForDetail(item); 
            setQuickViewCategory(null);
          } else if (quickViewCategory === 'visitors') {
            setSelectedVisitorForDetail(item);
            setQuickViewCategory(null);
          } else if (quickViewCategory === 'occurrences') {
            setSelectedOccurrenceForDetail(item);
            setQuickViewCategory(null);
          } else if (quickViewCategory === 'notes') {
            setEditingNoteId(item.id);
            setNewNoteContent(item.content);
            setNewNoteCategory(item.category || 'Geral');
            setNewNoteScheduled(item.scheduled || '');
            setIsNewNoteModalOpen(true);
            setQuickViewCategory(null);
          } else if (quickViewCategory === 'notices') {
            setSelectedNoticeForEdit(item);
            setQuickViewCategory(null);
          }
        }}
      />

      {/* NEW RESERVATION MODAL (PREMIUM DARK STEALTH + AUTOCOMPLETE & VALIDATION) */}
      {isReservationModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-2xl" onClick={() => setIsReservationModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-zinc-900/50 text-white rounded-[40px] shadow-2xl p-10 border border-white/5 animate-in zoom-in duration-300">
             <header className="flex justify-between items-center mb-10">
                <div>
                   <h4 className="text-3xl font-black uppercase tracking-tight text-white">Nova Reserva</h4>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Agendamento de Espaço</p>
                </div>
                <button onClick={() => setIsReservationModalOpen(false)} className="p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-colors border border-white/5"><X className="w-5 h-5"/></button>
             </header>
             
             <div className="space-y-6">
                {/* Área Comum */}
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Área Comum</label>
                   <div className="relative">
                      <select 
                        value={newReservationData.area}
                        onChange={(e) => setNewReservationData({...newReservationData, area: e.target.value})}
                        className="w-full p-5 bg-white/5 rounded-2xl outline-none font-bold text-sm border-none focus:ring-1 focus:ring-white/30 appearance-none text-white transition-all shadow-inner"
                      >
                         {areasStatus.map(area => (
                            <option key={area.id} value={area.name} className="bg-zinc-900 text-white">{area.name}</option>
                         ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                   </div>
                   {/* Context Rule Helper */}
                   {newReservationData.area && (
                      <p className="ml-2 text-[9px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" />
                          {areasStatus.find(a => a.name === newReservationData.area)?.rules || 'Regras padrão aplicáveis'}
                      </p>
                   )}
                </div>
                
                {/* Morador com Autocomplete Inteligente */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2 relative">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Morador</label>
                      <div className="relative group">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                         <input 
                           type="text" 
                           placeholder="Buscar..."
                           value={reservationSearchQuery || newReservationData.resident}
                           onChange={(e) => {
                              setReservationSearchQuery(e.target.value);
                              setNewReservationData({...newReservationData, resident: e.target.value});
                              setShowResSuggestions(true);
                           }}
                           onFocus={() => setShowResSuggestions(true)}
                           className="w-full pl-12 pr-4 p-5 bg-white/5 rounded-2xl outline-none font-bold text-sm border-none focus:ring-1 focus:ring-white/30 text-white placeholder:text-zinc-600 transition-all shadow-inner"
                           autoComplete="off"
                         />
                      </div>

                      {/* Dropdown de Sugestões Flutuante */}
                      {showResSuggestions && reservationSearchQuery && filteredResForReservation.length > 0 && (
                         <div className="absolute top-full left-0 w-full mt-2 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2">
                            {filteredResForReservation.map(r => (
                               <div 
                                 key={r.id}
                                 onClick={() => {
                                    setNewReservationData({ ...newReservationData, resident: r.name, unit: r.unit });
                                    setReservationSearchQuery(r.name);
                                    setShowResSuggestions(false);
                                 }}
                                 className="p-4 hover:bg-white/10 cursor-pointer flex justify-between items-center group transition-colors border-b border-white/5 last:border-0"
                               >
                                  <span className="text-xs font-bold uppercase text-white group-hover:text-blue-400">{r.name}</span>
                                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-white">UN {r.unit}</span>
                               </div>
                            ))}
                         </div>
                      )}
                   </div>

                   {/* Unidade Read-Only (Trava de Segurança) */}
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Unidade</label>
                      <div className="relative">
                         <div className="absolute inset-y-0 left-0 w-1 bg-white/10 rounded-l-2xl"></div>
                         <input 
                           type="text" 
                           readOnly
                           value={newReservationData.unit}
                           className="w-full p-5 bg-black/20 rounded-2xl outline-none font-black text-sm border border-transparent text-white/50 cursor-not-allowed text-center tracking-widest"
                           placeholder="---"
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Data</label>
                   <input 
                     type="date"
                     value={newReservationData.date}
                     onChange={(e) => setNewReservationData({...newReservationData, date: e.target.value})}
                     className="w-full p-5 bg-white/5 rounded-2xl outline-none font-bold text-sm border-none focus:ring-1 focus:ring-white/30 text-white uppercase tracking-widest shadow-inner cursor-pointer"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className={`text-[10px] font-bold uppercase tracking-widest ml-2 transition-colors ${hasTimeConflict ? 'text-red-500' : 'text-zinc-500'}`}>Início</label>
                      <input 
                        type="time"
                        value={newReservationData.startTime}
                        onChange={(e) => setNewReservationData({...newReservationData, startTime: e.target.value})}
                        className={`w-full p-5 bg-white/5 rounded-2xl outline-none font-bold text-sm border border-transparent focus:ring-1 focus:ring-white/30 text-white shadow-inner transition-all ${hasTimeConflict ? 'border-red-500/50 bg-red-500/10' : ''}`}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className={`text-[10px] font-bold uppercase tracking-widest ml-2 transition-colors ${hasTimeConflict ? 'text-red-500' : 'text-zinc-500'}`}>Fim</label>
                      <input 
                        type="time"
                        value={newReservationData.endTime}
                        onChange={(e) => setNewReservationData({...newReservationData, endTime: e.target.value})}
                        className={`w-full p-5 bg-white/5 rounded-2xl outline-none font-bold text-sm border border-transparent focus:ring-1 focus:ring-white/30 text-white shadow-inner transition-all ${hasTimeConflict ? 'border-red-500/50 bg-red-500/10' : ''}`}
                      />
                   </div>
                </div>

                {hasTimeConflict && (
                   <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-xl animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-wide">Horário Indisponível (Conflito)</span>
                   </div>
                )}

                <button 
                  onClick={handleCreateReservation}
                  disabled={!newReservationData.resident || !newReservationData.date || hasTimeConflict}
                  className="w-full py-6 bg-white text-black rounded-[24px] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 transition-all mt-6 shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                   {hasTimeConflict ? 'Verifique o Horário' : 'Confirmar Agendamento'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* ... Other Modals ... */}
      {/* ... visitor detail, occurrence detail, resident detail, package detail, note modal, etc ... */}
      {/* The rest of the modals are preserved exactly as they were, I am just ensuring the closure of the component is correct */}
      
      {/* DETAIL MODAL FOR VISITORS (FROM DASHBOARD POPUP) */}
      {selectedVisitorForDetail && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setSelectedVisitorForDetail(null)} />
          <div className="relative w-full max-w-lg bg-white text-black rounded-[48px] shadow-2xl p-8 md:p-12 animate-in zoom-in duration-300">
             
             <header className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-3xl bg-zinc-100 flex items-center justify-center text-3xl font-black shadow-inner">
                      {selectedVisitorForDetail.visitorNames?.substring(0, 1).toUpperCase()}
                   </div>
                   <div>
                      <h4 className="text-2xl font-black uppercase tracking-tight leading-none">{selectedVisitorForDetail.visitorNames}</h4>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                         selectedVisitorForDetail.type === 'Prestador' ? 'bg-amber-100 text-amber-600' : 
                         selectedVisitorForDetail.type === 'Delivery' ? 'bg-blue-100 text-blue-600' : 
                         'bg-purple-100 text-purple-600'
                       }`}>
                         {selectedVisitorForDetail.type || 'Visita'}
                       </span>
                   </div>
                </div>
                <button onClick={() => setSelectedVisitorForDetail(null)} className="p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200"><X className="w-5 h-5"/></button>
             </header>

             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-zinc-50 rounded-[24px] border border-black/5">
                      <p className="text-[9px] font-black uppercase opacity-30 mb-1">Destino</p>
                      <p className="text-sm font-bold uppercase">{selectedVisitorForDetail.unit} - {selectedVisitorForDetail.residentName}</p>
                   </div>
                   <div className="p-5 bg-zinc-50 rounded-[24px] border border-black/5">
                      <p className="text-[9px] font-black uppercase opacity-30 mb-1">Entrada</p>
                      <p className="text-sm font-bold uppercase">{new Date(selectedVisitorForDetail.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                   </div>
                </div>

                <div className="p-6 bg-zinc-50 rounded-[32px] border border-black/5 flex items-center gap-4">
                   <div className="p-3 bg-white rounded-full shadow-sm"><Clock className="w-5 h-5 opacity-40"/></div>
                   <div>
                      <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Permanência Atual</p>
                      <p className="text-xl font-black uppercase">{calculatePermanence(selectedVisitorForDetail.entryTime)}</p>
                   </div>
                </div>

                <button 
                  onClick={() => {
                    handleVisitorCheckOut(selectedVisitorForDetail.id);
                    setSelectedVisitorForDetail(null);
                  }}
                  className="w-full py-6 bg-black text-white rounded-[32px] font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                   <LogOut className="w-4 h-4" /> Registrar Saída Agora
                </button>
             </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR OCCURRENCES (EDITABLE) */}
      {selectedOccurrenceForDetail && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setSelectedOccurrenceForDetail(null)} />
          <div className="relative w-full max-w-lg bg-white text-black rounded-[48px] shadow-2xl p-8 md:p-12 animate-in zoom-in duration-300">
             
             <header className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-3xl ${selectedOccurrenceForDetail.status === 'Aberto' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      <AlertTriangle className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black uppercase tracking-tight leading-none">Ocorrência</h4>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Detalhes & Edição</p>
                   </div>
                </div>
                <button onClick={() => setSelectedOccurrenceForDetail(null)} className="p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200"><X className="w-5 h-5"/></button>
             </header>

             <div className="space-y-6">
                <div className="p-5 bg-zinc-50 rounded-[24px] border border-black/5 flex justify-between items-center">
                   <div>
                      <p className="text-[9px] font-black uppercase opacity-30 mb-1">Unidade Afetada</p>
                      <p className="text-sm font-bold uppercase">{selectedOccurrenceForDetail.unit} - {selectedOccurrenceForDetail.residentName}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black uppercase opacity-30 mb-1">Data</p>
                      <p className="text-xs font-bold uppercase opacity-60">{selectedOccurrenceForDetail.date}</p>
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Status Atual</label>
                   <div className="flex gap-2">
                      {['Aberto', 'Em Andamento', 'Resolvido'].map(status => (
                         <button 
                           key={status}
                           onClick={() => setSelectedOccurrenceForDetail({...selectedOccurrenceForDetail, status: status as any})}
                           className={`flex-1 py-3 rounded-[16px] text-[9px] font-black uppercase tracking-widest transition-all border ${
                             selectedOccurrenceForDetail.status === status 
                             ? (status === 'Aberto' ? 'bg-red-500 text-white border-red-500' : status === 'Resolvido' ? 'bg-green-500 text-white border-green-500' : 'bg-amber-500 text-white border-amber-500')
                             : 'bg-white border-zinc-100 text-zinc-400 hover:bg-zinc-50'
                           }`}
                         >
                            {status}
                         </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Descrição (Editável)</label>
                   <textarea 
                     value={selectedOccurrenceForDetail.description}
                     onChange={(e) => setSelectedOccurrenceForDetail({...selectedOccurrenceForDetail, description: e.target.value})}
                     className="w-full h-32 p-5 bg-zinc-50 rounded-[24px] font-medium text-sm outline-none border-2 border-transparent focus:border-black/5 resize-none shadow-inner"
                   />
                </div>

                <button 
                  onClick={handleSaveOccurrenceDetails}
                  className="w-full py-6 bg-black text-white rounded-[32px] font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                   <Save className="w-4 h-4" /> Salvar Alterações
                </button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL DE NOVO ACESSO (VISITANTES) - WIZARD */}
      {isVisitorModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={resetVisitorModal} />
          
          <div className="relative w-full max-w-xl bg-white text-black rounded-[48px] shadow-2xl p-8 md:p-12 animate-in zoom-in duration-500">
             
             <header className="flex justify-between items-start mb-8">
                <div>
                   <h4 className="text-3xl font-black uppercase tracking-tighter">Novo Acesso</h4>
                   <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Passo 0{newVisitorStep} de 03</p>
                </div>
                <button onClick={resetVisitorModal} className="p-4 bg-zinc-50 rounded-3xl hover:bg-zinc-100 transition-all"><X className="w-6 h-6"/></button>
             </header>

             {/* Passo 1: Selecionar Morador (Obrigatório) */}
             {newVisitorStep === 1 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="relative">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Vincular Morador</label>
                     <div className="relative">
                       <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                       <input 
                         autoFocus
                         type="text" 
                         placeholder="Buscar por Nome ou Unidade..." 
                         value={searchResident}
                         onChange={e => { setSearchResident(e.target.value); setNewVisitorData({...newVisitorData, unit: '', residentName: ''}); }}
                         className="w-full pl-14 pr-6 py-6 bg-zinc-50 rounded-[32px] font-bold text-lg outline-none border-2 border-transparent focus:border-black/5 placeholder:opacity-20"
                       />
                     </div>
                  </div>

                  {/* Lista de Sugestões de Moradores */}
                  <div className="max-h-[40vh] overflow-y-auto custom-scrollbar space-y-2">
                     {filteredResidents.length > 0 ? (
                        filteredResidents.map(r => (
                           <button 
                             key={r.id} 
                             onClick={() => {
                               setNewVisitorData({ ...newVisitorData, unit: r.unit, residentName: r.name });
                               setSearchResident(r.name);
                             }}
                             className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${newVisitorData.unit === r.unit ? 'bg-black text-white shadow-xl' : 'bg-zinc-50 hover:bg-zinc-100'}`}
                           >
                              <div className="text-left">
                                 <h6 className="font-black text-sm uppercase">{r.name}</h6>
                                 <p className={`text-[10px] font-bold uppercase tracking-widest ${newVisitorData.unit === r.unit ? 'opacity-60' : 'opacity-40'}`}>Unidade {r.unit}</p>
                              </div>
                              {newVisitorData.unit === r.unit && <CheckCircle2 className="w-5 h-5" />}
                           </button>
                        ))
                     ) : (
                        searchResident && <p className="text-center text-xs opacity-40 py-4 font-black uppercase">Nenhum morador encontrado</p>
                     )}
                  </div>

                  <button 
                    onClick={() => setNewVisitorStep(2)}
                    disabled={!newVisitorData.unit}
                    className="w-full py-6 bg-black text-white rounded-[32px] font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo <ArrowRight className="w-4 h-4 inline ml-2" />
                  </button>
               </div>
             )}

             {/* Passo 2: Visitante */}
             {newVisitorStep === 2 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-zinc-50 rounded-2xl flex items-center justify-between mb-4 border border-black/5">
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Vinculado a</p>
                        <h6 className="text-sm font-black uppercase">{newVisitorData.residentName} <span className="opacity-40 ml-1">({newVisitorData.unit})</span></h6>
                     </div>
                     <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>

                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Nome do Visitante</label>
                     <input 
                       autoFocus
                       type="text" 
                       placeholder="Nome Completo" 
                       value={newVisitorData.name}
                       onChange={e => setNewVisitorData({ ...newVisitorData, name: e.target.value })}
                       className="w-full p-5 bg-zinc-50 rounded-[24px] font-bold text-lg outline-none border-2 border-transparent focus:border-black/5 placeholder:opacity-20"
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Documento (Opcional)</label>
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="RG ou CPF" 
                          value={newVisitorData.doc}
                          onChange={e => setNewVisitorData({ ...newVisitorData, doc: e.target.value })}
                          className="flex-1 p-5 bg-zinc-50 rounded-[24px] font-bold text-lg outline-none border-2 border-transparent focus:border-black/5 placeholder:opacity-20"
                        />
                        <button className="p-5 bg-zinc-100 rounded-[24px] hover:bg-zinc-200 transition-all" title="Capturar Foto">
                           <UserCheck className="w-6 h-6 opacity-40" />
                        </button>
                     </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                     <button onClick={() => setNewVisitorStep(1)} className="p-6 bg-zinc-50 rounded-[32px] hover:bg-zinc-100"><ChevronLeft className="w-6 h-6"/></button>
                     <button 
                       onClick={() => setNewVisitorStep(3)}
                       disabled={!newVisitorData.name}
                       className="flex-1 py-6 bg-black text-white rounded-[32px] font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                     >
                       Próximo
                     </button>
                  </div>
               </div>
             )}

             {/* Passo 3: Detalhes & Confirmação (Categorias Editáveis) */}
             {newVisitorStep === 3 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                     <div className="flex justify-between items-center mb-2 px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Tipo de Acesso</label>
                        <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Editável</span>
                     </div>
                     
                     <div className="flex flex-wrap gap-2">
                        {visitorAccessTypes.map(type => (
                           <div key={type} className="relative group">
                              <button 
                                onClick={() => setNewVisitorData({ ...newVisitorData, type })}
                                className={`py-3 px-5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${newVisitorData.type === type ? 'bg-black text-white shadow-lg scale-105' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'}`}
                              >
                                 {type}
                              </button>
                              {/* Botão de Remover Categoria (X) */}
                              {visitorAccessTypes.length > 1 && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleRemoveAccessType(type); }}
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              )}
                           </div>
                        ))}
                        
                        {/* Botão de Adicionar Categoria (+) */}
                        {isAddingAccessType ? (
                           <div className="flex items-center bg-zinc-50 rounded-[18px] border border-black/10 overflow-hidden animate-in fade-in zoom-in duration-200">
                              <input 
                                autoFocus
                                type="text" 
                                value={newAccessTypeInput}
                                onChange={e => setNewAccessTypeInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddAccessType()}
                                placeholder="Novo Tipo..."
                                className="w-24 px-3 py-2 bg-transparent text-[10px] font-bold outline-none uppercase"
                              />
                              <button onClick={handleAddAccessType} className="p-2 hover:bg-black hover:text-white transition-colors"><Check className="w-3 h-3"/></button>
                           </div>
                        ) : (
                           <button 
                             onClick={() => setIsAddingAccessType(true)}
                             className="py-3 px-4 rounded-[18px] border border-dashed border-zinc-200 text-zinc-300 hover:text-black hover:border-black/20 transition-all flex items-center justify-center"
                           >
                              <Plus className="w-4 h-4" />
                           </button>
                        )}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Veículo</label>
                        <input 
                          type="text" 
                          placeholder="Modelo/Cor" 
                          value={newVisitorData.vehicle}
                          onChange={e => setNewVisitorData({ ...newVisitorData, vehicle: e.target.value })}
                          className="w-full p-4 bg-zinc-50 rounded-[24px] font-bold text-sm outline-none border-transparent focus:border-black/5"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Placa</label>
                        <input 
                          type="text" 
                          placeholder="ABC-1234" 
                          value={newVisitorData.plate}
                          onChange={e => setNewVisitorData({ ...newVisitorData, plate: e.target.value.toUpperCase() })}
                          className="w-full p-4 bg-zinc-50 rounded-[24px] font-bold text-sm outline-none border-transparent focus:border-black/5 uppercase"
                        />
                     </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                     <button onClick={() => setNewVisitorStep(2)} className="p-6 bg-zinc-50 rounded-[32px] hover:bg-zinc-100"><ChevronLeft className="w-6 h-6"/></button>
                     <button 
                       onClick={handleRegisterVisitor}
                       className="flex-1 py-6 bg-green-600 text-white rounded-[32px] font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                     >
                       <CheckCircle2 className="w-5 h-5" /> Liberar Acesso
                     </button>
                  </div>
               </div>
             )}

          </div>
        </div>
      )}

      {/* ... Other Modals (Profile360, etc) remain unchanged ... */}
      {selectedResidentProfile && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedResidentProfile(null)} />
          <div className="relative w-full max-w-4xl bg-zinc-900 text-white rounded-[48px] shadow-2xl p-8 md:p-12 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/10">
            
            {/* Header: Identity */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-white/10">
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-black shadow-lg">
                    {selectedResidentProfile.name.substring(0, 2).toUpperCase()}
                 </div>
                 <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-black uppercase tracking-tight">{selectedResidentProfile.name}</h2>
                      <button 
                         onClick={() => { handleOpenResidentModal(selectedResidentProfile); setSelectedResidentProfile(null); }}
                         className="p-2 bg-white/5 rounded-xl hover:bg-white text-white hover:text-black transition-all"
                         title="Editar Dados Básicos"
                      >
                         <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="px-3 py-1 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest">Unidade {selectedResidentProfile.unit}</span>
                    
                    <div className="flex gap-3 mt-4">
                       {selectedResidentProfile.whatsapp && (
                         <button onClick={() => window.open(`https://wa.me/${selectedResidentProfile.whatsapp}`, '_blank')} className="p-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all"><MessageCircle className="w-5 h-5" /></button>
                       )}
                       <button className="p-2 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all"><Phone className="w-5 h-5" /></button>
                       <button className="p-2 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all"><Mail className="w-5 h-5" /></button>
                    </div>
                 </div>
              </div>
              <button onClick={() => setSelectedResidentProfile(null)} className="p-4 bg-white/5 rounded-3xl hover:bg-white/20 transition-all"><X className="w-6 h-6"/></button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Left Column: Logistics (Packages) */}
              <div className="space-y-8">
                 <div className="flex items-center gap-3 mb-4">
                    <PackageIcon className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Logística & Encomendas</h3>
                 </div>

                 {/* Pending Packages Highlight */}
                 {allPackages.filter(p => p.recipient === selectedResidentProfile.name && p.status === 'Pendente').length > 0 ? (
                    <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-[32px] space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse">Aguardando Retirada</span>
                          <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-[10px] font-bold">Prioridade</span>
                       </div>
                       {allPackages.filter(p => p.recipient === selectedResidentProfile.name && p.status === 'Pendente').map(pkg => (
                          <div key={pkg.id} className="p-4 bg-zinc-900/50 rounded-2xl flex justify-between items-center group cursor-pointer hover:bg-black/40 transition-all" onClick={() => setSelectedPackageForDetail(pkg)}>
                             <div>
                                <h6 className="font-bold text-sm uppercase text-blue-100">{pkg.type}</h6>
                                <p className="text-[10px] opacity-60 font-medium">Chegou às {pkg.displayTime}</p>
                             </div>
                             <div className="p-2 bg-blue-500 text-white rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-4 h-4" />
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="p-6 bg-white/5 border border-white/5 rounded-[32px] flex items-center justify-center gap-3 opacity-40">
                       <CheckCircle2 className="w-5 h-5" />
                       <span className="text-xs font-black uppercase">Nada pendente na portaria</span>
                    </div>
                 )}

                 {/* Delivery History Timeline */}
                 <div className="bg-white/5 rounded-[32px] p-6">
                    <h6 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">Últimas Entregas (Histórico)</h6>
                    <div className="space-y-6 relative pl-2">
                       {/* Vertical Line */}
                       <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/10" />
                       
                       {allPackages.filter(p => p.recipient === selectedResidentProfile.name && p.status === 'Entregue').slice(0, 4).map(pkg => (
                          <div key={pkg.id} className="relative flex items-center gap-4 pl-6 group">
                             <div className="absolute left-0 w-8 h-8 rounded-full bg-zinc-800 border-2 border-green-500 flex items-center justify-center z-10">
                                <Check className="w-3 h-3 text-green-500" />
                             </div>
                             <div className="flex-1 p-3 rounded-xl hover:bg-white/5 transition-all">
                                <h6 className="text-sm font-bold uppercase">{pkg.type}</h6>
                                <p className="text-[10px] opacity-40">Entregue em {new Date(pkg.receivedAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                       ))}
                       {allPackages.filter(p => p.recipient === selectedResidentProfile.name && p.status === 'Entregue').length === 0 && (
                          <p className="text-[10px] opacity-20 italic pl-6">Nenhum histórico recente.</p>
                       )}
                    </div>
                 </div>
              </div>

              {/* Right Column: Security (Visitors) */}
              <div className="space-y-8">
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Segurança & Acessos</h3>
                 </div>

                 {/* Active Visitors */}
                 <div className="space-y-4">
                    <h6 className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Visitantes na Unidade (Agora)</h6>
                    {visitorLogs.filter(v => v.residentName === selectedResidentProfile.name && v.status === 'active').length > 0 ? (
                       visitorLogs.filter(v => v.residentName === selectedResidentProfile.name && v.status === 'active').map(visitor => (
                          <div key={visitor.id} className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-[32px] flex justify-between items-center">
                             <div>
                                <h6 className="font-black text-sm uppercase text-purple-200">{visitor.visitorNames}</h6>
                                <p className="text-[10px] text-purple-300/60 font-medium">Entrada: {new Date(visitor.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                             </div>
                             <button 
                               onClick={() => handleVisitorCheckOut(visitor.id)}
                               className="px-4 py-2 bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-purple-400 transition-colors"
                             >
                                Registrar Saída
                             </button>
                          </div>
                       ))
                    ) : (
                       <div className="p-6 bg-white/5 border border-white/5 rounded-[32px] text-center opacity-40">
                          <p className="text-xs font-black uppercase">Nenhum visitante ativo</p>
                       </div>
                    )}
                 </div>

                 {/* Frequent Visitors (Mock Logic for UI) */}
                 <div className="bg-white/5 rounded-[32px] p-6">
                    <h6 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Visitantes Frequentes</h6>
                    <div className="grid grid-cols-1 gap-2">
                       {/* Mock Data based on resident context would go here, simulating static list for now */}
                       <div className="p-3 hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer group transition-all">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">
                                <UserCircle className="w-4 h-4" />
                             </div>
                             <div>
                                <h6 className="text-xs font-bold uppercase">Maria (Mãe)</h6>
                                <p className="text-[9px] opacity-40">12 visitas este mês</p>
                             </div>
                          </div>
                          <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div className="p-3 hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer group transition-all">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">
                                <UserCircle className="w-4 h-4" />
                             </div>
                             <div>
                                <h6 className="text-xs font-bold uppercase">Carlos (Personal)</h6>
                                <p className="text-[9px] opacity-40">Seg, Qua, Sex</p>
                             </div>
                          </div>
                          <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                    </div>
                 </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ... other code remains ... */}
      {isResidentModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsResidentModalOpen(false)} />
           <div className="relative w-full max-w-lg bg-white text-black rounded-[48px] shadow-2xl p-8 md:p-10 animate-in zoom-in duration-300">
              <header className="flex justify-between items-center mb-8">
                 <div>
                    <h4 className="text-2xl font-black uppercase tracking-tight">{residentFormData.id ? 'Editar Morador' : 'Novo Morador'}</h4>
                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Cadastro de Unidade</p>
                 </div>
                 <button onClick={() => setIsResidentModalOpen(false)} className="p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-all"><X className="w-5 h-5"/></button>
              </header>

              <div className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">Nome Completo</label>
                       <input 
                         type="text" 
                         value={residentFormData.name}
                         onChange={e => setResidentFormData({...residentFormData, name: e.target.value})}
                         className="w-full p-4 bg-zinc-50 rounded-2xl font-bold text-sm outline-none border focus:border-black/10"
                         placeholder="Ex: Carlos Silva"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">Unidade</label>
                       <input 
                         type="text" 
                         value={residentFormData.unit}
                         onChange={e => setResidentFormData({...residentFormData, unit: e.target.value})}
                         className="w-full p-4 bg-zinc-50 rounded-2xl font-bold text-sm outline-none border focus:border-black/10"
                         placeholder="Ex: 101A"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">Telefone</label>
                       <input 
                         type="text" 
                         value={residentFormData.phone}
                         onChange={e => setResidentFormData({...residentFormData, phone: e.target.value})}
                         className="w-full p-4 bg-zinc-50 rounded-2xl font-bold text-sm outline-none border focus:border-black/10"
                         placeholder="Apenas números"
                       />
                    </div>
                    <div className="col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">WhatsApp (Opcional)</label>
                       <input 
                         type="text" 
                         value={residentFormData.whatsapp}
                         onChange={e => setResidentFormData({...residentFormData, whatsapp: e.target.value})}
                         className="w-full p-4 bg-zinc-50 rounded-2xl font-bold text-sm outline-none border focus:border-black/10"
                         placeholder="5511999999999"
                       />
                    </div>
                    <div className="col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">Email (Opcional)</label>
                       <input 
                         type="email" 
                         value={residentFormData.email}
                         onChange={e => setResidentFormData({...residentFormData, email: e.target.value})}
                         className="w-full p-4 bg-zinc-50 rounded-2xl font-bold text-sm outline-none border focus:border-black/10"
                         placeholder="email@exemplo.com"
                       />
                    </div>
                 </div>

                 <button 
                   onClick={handleSaveResident}
                   className="w-full py-5 bg-black text-white rounded-[24px] font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                 >
                   <Save className="w-4 h-4" /> {residentFormData.id ? 'Atualizar Dados' : 'Cadastrar Morador'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* RAIO-X DA ENCOMENDA (DETAIL MODAL) */}
      {selectedPackageForDetail && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setSelectedPackageForDetail(null)} />
          <div className="relative w-full max-w-xl bg-white text-black rounded-[48px] shadow-2xl p-8 md:p-12 animate-in zoom-in duration-500 overflow-hidden">
            <header className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center shadow-inner">
                  <PackageIcon className="w-8 h-8 opacity-40" />
                </div>
                <div>
                   <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{selectedPackageForDetail.recipient}</h4>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-2">Unidade {selectedPackageForDetail.unit} • Bloco Central</p>
                </div>
              </div>
              <button onClick={() => setSelectedPackageForDetail(null)} className="p-4 bg-zinc-50 rounded-3xl hover:bg-zinc-100 transition-all"><X className="w-6 h-6"/></button>
            </header>

            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-8 bg-zinc-50 rounded-[32px] border border-black/5 shadow-inner">
                     <span className="text-[8px] font-black uppercase tracking-widest opacity-30 block mb-2">Registro de Entrada</span>
                     <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 opacity-40" />
                        <span className="text-lg font-black uppercase">{selectedPackageForDetail.displayTime}</span>
                     </div>
                  </div>
                  <div className="p-8 bg-black text-white rounded-[32px] shadow-2xl relative overflow-hidden">
                     <span className="text-[8px] font-black uppercase tracking-widest opacity-40 block mb-2">Tempo em Custódia</span>
                     <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-blue-400" />
                        <span className="text-lg font-black uppercase">{selectedPackageForDetail.status === 'Entregue' ? 'FINALIZADO' : calculatePermanence(selectedPackageForDetail.receivedAt)}</span>
                     </div>
                     <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 opacity-10 rounded-full blur-2xl -mr-10 -mt-10" />
                  </div>
               </div>

               <section className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-2">Detalhes do Volume</label>
                  <div className="p-8 bg-zinc-50 rounded-[40px] border border-black/5 space-y-4">
                     <div className="flex justify-between items-center pb-4 border-b border-black/5">
                        <span className="text-xs font-bold opacity-40 uppercase">Transportadora</span>
                        <span className="text-sm font-black uppercase">{selectedPackageForDetail.type}</span>
                     </div>
                     {selectedPackageForDetail.items && selectedPackageForDetail.items.length > 0 ? (
                       <div className="space-y-3 pt-2">
                          <span className="text-[9px] font-black uppercase opacity-20 block">Inventário</span>
                          {selectedPackageForDetail.items.map((it, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-black mt-1.5" />
                               <div>
                                  <p className="text-sm font-bold uppercase">{it.name}</p>
                                  {it.description && <p className="text-[10px] opacity-40">{it.description}</p>}
                                </div>
                            </div>
                          ))}
                       </div>
                     ) : (
                       <p className="text-xs opacity-20 italic">Nenhum item específico detalhado.</p>
                     )}
                  </div>
               </section>

               <div className="flex flex-col gap-4">
                 {selectedPackageForDetail.status === 'Pendente' ? (
                   <>
                     <button 
                       onClick={() => handleSendReminder(selectedPackageForDetail)}
                       className="w-full py-8 bg-green-600 text-white rounded-[32px] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                     >
                        <MessageCircle className="w-6 h-6" /> Notificar Morador agora
                     </button>
                     <button 
                       onClick={() => handleDeliverPackage(selectedPackageForDetail.id)}
                       className="w-full py-8 bg-zinc-100 text-black rounded-[32px] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-zinc-200 active:scale-95 transition-all shadow-xl"
                     >
                        <CheckCircle2 className="w-6 h-6" /> Marcar como Entregue
                     </button>
                   </>
                 ) : (
                   <div className="w-full py-8 bg-zinc-50 border border-black/5 rounded-[32px] flex items-center justify-center gap-4">
                      <Check className="w-6 h-6 text-green-600" />
                      <span className="text-[11px] font-black uppercase tracking-widest opacity-40 text-black">Este volume já foi entregue</span>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* FLUXO DINÂMICO: REGISTRO DE ENCOMENDAS (3 ETAPAS) */}
      {isNewPackageModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={resetPackageModal} />
          
          <div className="relative w-full max-w-2xl bg-white text-black rounded-[48px] shadow-2xl p-1 md:p-1 overflow-hidden animate-in zoom-in duration-500">
             
             <div className={`transition-all duration-700 ease-in-out flex ${packageStep === 2 ? '-translate-x-1/3' : packageStep === 3 ? '-translate-x-2/3' : 'translate-x-0'}`} style={{ width: '300%' }}>
                
                {/* PASSO 1: QUEM? (MORADOR) */}
                <div className="w-1/3 p-8 md:p-14 max-h-[90vh] overflow-y-auto custom-scrollbar">
                   <header className="flex justify-between items-start mb-12">
                      <div>
                         <h4 className="text-3xl font-black uppercase tracking-tighter">Quem recebe?</h4>
                         <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] mt-1">Passo 01: Identificação</p>
                      </div>
                      <button onClick={resetPackageModal} className="p-4 bg-zinc-50 rounded-3xl hover:bg-zinc-100 transition-all"><X className="w-6 h-6"/></button>
                   </header>

                   <div className="space-y-12">
                      <section className="space-y-4">
                         <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                            <input 
                              type="text" 
                              placeholder="Buscar por nome ou unidade..." 
                              value={searchResident}
                              onChange={e => { setSearchResident(e.target.value); setSelectedResident(null); }}
                              className="w-full pl-16 pr-6 py-6 bg-zinc-50 rounded-[32px] font-black text-xl outline-none border-2 border-transparent focus:border-black/5 placeholder:opacity-20 shadow-inner"
                            />
                         </div>

                         {!selectedResident && filteredResidents.length > 0 && (
                            <div className="bg-zinc-50 rounded-[32px] border border-black/5 p-4 space-y-2 animate-in slide-in-from-top-4">
                               {filteredResidents.map(r => (
                                 <button 
                                   key={r.id} 
                                   onClick={() => { setSelectedResident(r); setSearchResident(r.name); }}
                                   className="w-full p-6 bg-white rounded-[24px] flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all shadow-sm border border-transparent hover:border-black/5 group"
                                 >
                                    <div className="text-left">
                                       <h6 className="font-black text-lg uppercase tracking-tight">{r.name}</h6>
                                       <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">Unidade {r.unit}</p>
                                    </div>
                                    <div className="p-3 bg-zinc-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Plus className="w-4 h-4" />
                                    </div>
                                 </button>
                               ))}
                            </div>
                         )}

                         {selectedResident && (
                            <div className="p-10 bg-black text-white rounded-[48px] flex flex-col items-center text-center animate-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
                               <div className="w-24 h-24 rounded-[32px] bg-white/10 flex items-center justify-center mb-6 shadow-inner">
                                  <UserCircle className="w-12 h-12" />
                               </div>
                               <h5 className="text-2xl font-black uppercase leading-tight">{selectedResident.name}</h5>
                               <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-2">Unidade {selectedResident.unit} • Bloco Central</p>
                               
                               <div className="flex gap-4 mt-8">
                                  <div className="flex flex-col items-center">
                                     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-1"><Phone className="w-4 h-4 opacity-40"/></div>
                                     <span className="text-[8px] font-black uppercase opacity-30">Ligar</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                     <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mb-1 shadow-lg"><MessageCircle className="w-4 h-4"/></div>
                                     <span className="text-[8px] font-black uppercase opacity-30">WhatsApp</span>
                                  </div>
                               </div>
                            </div>
                         )}
                      </section>

                      <button 
                        disabled={!selectedResident}
                        onClick={() => setPackageStep(2)}
                        className={`w-full py-7 rounded-[32px] font-black uppercase text-[12px] tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl ${selectedResident ? 'bg-black text-white hover:scale-[1.02] active:scale-95' : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'}`}
                      >
                         Próximo: Inventário <ArrowRight className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                {/* PASSO 2: O QUÊ? (CATEGORIA E ITENS) */}
                <div className="w-1/3 p-8 md:p-14 max-h-[90vh] overflow-y-auto custom-scrollbar">
                   <header className="flex justify-between items-start mb-12">
                      <button onClick={() => setPackageStep(1)} className="p-4 bg-zinc-50 rounded-3xl hover:bg-zinc-100 transition-all"><ChevronLeft className="w-6 h-6"/></button>
                      <div className="text-right">
                         <h4 className="text-3xl font-black uppercase tracking-tighter">O que chegou?</h4>
                         <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] mt-1">Passo 02: Detalhamento</p>
                      </div>
                   </header>

                   <div className="space-y-12">
                      {/* CATEGORIAS */}
                      <section className="space-y-4">
                         <div className="flex justify-between items-end px-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Origem / Categoria</label>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {packageCategories.map(cat => (
                              <button 
                                key={cat}
                                onClick={() => setPackageType(cat)}
                                className={`px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${packageType === cat ? 'bg-black text-white shadow-xl scale-105' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'}`}
                              >
                                {cat}
                              </button>
                            ))}
                            <button 
                              onClick={() => setIsAddingPkgCategory(!isAddingPkgCategory)}
                              className="px-6 py-4 rounded-[24px] border border-dashed border-zinc-200 text-zinc-300 hover:bg-zinc-50 transition-all"
                            >
                               <Plus className="w-4 h-4" />
                            </button>
                         </div>
                         {isAddingPkgCategory && (
                            <div className="flex items-center bg-zinc-50 rounded-[24px] p-2 border border-black/10 animate-in slide-in-from-top-2">
                               <input 
                                 type="text" 
                                 value={newPkgCatName} 
                                 onChange={e => setNewPkgCatName(e.target.value)} 
                                 placeholder="Nova Categoria..." 
                                 className="flex-1 bg-transparent px-4 font-black uppercase text-[10px] outline-none"
                               />
                               <button onClick={handleAddPkgCategory} className="p-3 bg-black text-white rounded-xl"><Check className="w-4 h-4"/></button>
                            </div>
                         )}
                      </section>

                      {/* INVENTÁRIO DINÂMICO */}
                      <section className="space-y-6">
                         <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Inventário do Volume</label>
                            <div className="flex items-center bg-zinc-50 rounded-2xl p-1 shadow-inner">
                               <button onClick={() => { if(numItems > 1) handleRemoveItemRow(packageItems[packageItems.length-1].id); }} className="p-2.5 bg-white text-black rounded-xl shadow-sm hover:scale-105 transition-all"><Minus className="w-4 h-4"/></button>
                               <span className="w-10 text-center font-black text-lg">{numItems}</span>
                               <button onClick={handleAddItemRow} className="p-2.5 bg-white text-black rounded-xl shadow-sm hover:scale-105 transition-all"><Plus className="w-4 h-4"/></button>
                            </div>
                         </div>

                         <div className="space-y-4">
                            {packageItems.map((item, idx) => (
                              <div key={item.id} className="p-8 bg-zinc-50 rounded-[40px] border border-transparent hover:border-black/5 transition-all space-y-5 animate-in slide-in-from-bottom-2 shadow-sm">
                                 <div className="flex justify-between items-center border-b border-black/5 pb-4">
                                    <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Item #{idx + 1}</span>
                                 </div>
                                 <input 
                                   type="text" 
                                   placeholder="Nome do Produto (ex: Smartphone, Tênis...)" 
                                   value={item.name}
                                   onChange={e => updateItem(item.id, 'name', e.target.value)}
                                   className="w-full p-5 bg-white rounded-[24px] font-black text-sm outline-none border border-transparent focus:border-black/5 shadow-inner"
                                 />
                                 <textarea 
                                   placeholder="Observações (Cor, tamanho, estado da caixa...)" 
                                   value={item.description}
                                   onChange={e => updateItem(item.id, 'description', e.target.value)}
                                   className="w-full p-5 bg-white rounded-[24px] font-medium text-xs outline-none border border-transparent focus:border-black/5 shadow-inner resize-none h-24"
                                 />
                              </div>
                            ))}
                         </div>
                      </section>

                      <button 
                        onClick={() => setPackageStep(3)}
                        className="w-full py-7 bg-black text-white rounded-[32px] font-black uppercase text-[12px] tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                         Próximo: Notificação <ArrowRight className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                {/* PASSO 3: NOTIFICAR? (PREVIEW) */}
                <div className="w-1/3 p-8 md:p-14 flex flex-col justify-between max-h-[90vh]">
                   <div>
                      <header className="flex justify-between items-start mb-12">
                         <button onClick={() => setPackageStep(2)} className="p-4 bg-zinc-50 rounded-3xl hover:bg-zinc-100 transition-all"><ChevronLeft className="w-6 h-6"/></button>
                         <div className="text-right flex items-center gap-6">
                            <button 
                              onClick={() => handleRegisterPackageFinal(false)}
                              className="text-lg font-black uppercase tracking-tight hover:text-blue-500 transition-colors active:scale-95"
                            >
                              Salvar
                            </button>
                            <div className="text-right">
                               <button 
                                 onClick={() => handleRegisterPackageFinal(true)}
                                 className="text-3xl font-black uppercase tracking-tighter hover:text-green-600 transition-colors active:scale-95 block ml-auto"
                               >
                                 Confirmar
                               </button>
                               <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] mt-1">Passo 03: Mensageria</p>
                            </div>
                         </div>
                      </header>

                      <div className="space-y-10">
                         <section className="space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Preview da Notificação</label>
                            
                            <div className="relative p-10 bg-zinc-50 rounded-[48px] border border-black/5 shadow-inner overflow-hidden">
                               {/* WhatsApp Style Bubble */}
                               <div className="absolute top-6 left-10 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                  <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">WhatsApp Business</span>
                               </div>
                               
                               <textarea 
                                 value={packageMessage}
                                 onChange={e => setPackageMessage(e.target.value)}
                                 className="w-full h-64 mt-8 bg-transparent font-bold text-xl leading-relaxed outline-none resize-none placeholder:opacity-10 border-none"
                               />
                               
                               <div className="mt-6 flex justify-end">
                                  <div className="p-3 bg-white rounded-2xl border border-black/5 flex items-center gap-2 opacity-40">
                                     <Edit2 className="w-3 h-3" />
                                     <span className="text-[8px] font-black uppercase">Editor Ativo</span>
                                  </div>
                               </div>
                            </div>
                         </section>

                         <div className="p-8 bg-zinc-900 text-white/40 rounded-[40px] flex items-center gap-6">
                            <Bell className="w-8 h-8 opacity-20" />
                            <p className="text-[11px] font-bold leading-relaxed">
                               O registro será salvo permanentemente na aba <span className="text-white">Encomendas</span>. O morador será alertado através do sistema e do WhatsApp.
                            </p>
                         </div>
                      </div>
                   </div>

                   {/* BOTÕES DE AÇÃO FINAL COM WHATSAPP REDIRECT */}
                   <div className="grid grid-cols-2 gap-4 mt-12">
                      <button 
                        onClick={() => handleRegisterPackageFinal(false)}
                        className="py-7 bg-zinc-100 text-black rounded-[32px] font-black uppercase text-[11px] tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
                      >
                         Salvar
                      </button>
                      <button 
                        onClick={() => handleRegisterPackageFinal(true)}
                        className="py-7 bg-green-600 text-white rounded-[32px] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                      >
                         <MessageCircle className="w-5 h-5" /> Notificar
                      </button>
                   </div>
                </div>

             </div>

          </div>
        </div>
      )}

      {/* MODAL RASCUNHO RÁPIDO TURBINADO */}
      {isNewNoteModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setIsNewNoteModalOpen(false); setEditingNoteId(null); setIsAddingCategory(false); setIsManagingCategories(false); }} />
          <div className="relative w-full max-w-xl bg-white text-black rounded-[48px] shadow-2xl p-6 md:p-8 animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
             <header className="flex justify-between items-start mb-6">
                <div>
                   <h4 className="text-2xl font-black uppercase tracking-tight">{editingNoteId ? 'Editar Nota' : 'Rascunho Rápido'}</h4>
                   <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Fluxo de produtividade</p>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setIsManagingCategories(!isManagingCategories)} 
                     className={`p-3 rounded-2xl transition-all ${isManagingCategories ? 'bg-black text-white' : 'bg-zinc-100 hover:bg-zinc-200'}`}
                   >
                     <Settings2 className="w-5 h-5"/>
                   </button>
                   <button onClick={() => { setIsNewNoteModalOpen(false); setEditingNoteId(null); }} className="p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-all shadow-sm"><X className="w-5 h-5"/></button>
                </div>
             </header>

             {/* Categorias Dinâmicas (Pills) */}
             <div className="flex gap-2 items-center overflow-x-auto pb-4 no-scrollbar">
                {noteCategories.map((cat) => (
                  <div key={cat.name} className="relative flex-shrink-0 group">
                    <button
                      onClick={() => !isManagingCategories && setNewNoteCategory(cat.name)}
                      className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        newNoteCategory === cat.name 
                        ? 'bg-black text-white border-black shadow-lg scale-105' 
                        : `${cat.color} text-black border-transparent opacity-60`
                      } ${isManagingCategories ? 'pr-10' : ''}`}
                    >
                      {cat.name}
                    </button>
                    {isManagingCategories && cat.name !== 'Geral' && (
                      <button 
                        onClick={() => handleRemoveCategory(cat.name)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-red-500 text-white rounded-full hover:scale-110 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                
                {isAddingCategory ? (
                   <div className="flex items-center bg-zinc-50 rounded-2xl border border-black/10 overflow-hidden min-w-[150px] animate-in slide-in-from-left-2">
                      <input 
                        type="text" 
                        value={newCatName} 
                        onChange={e => setNewCatName(e.target.value)} 
                        placeholder="Nome..." 
                        autoFocus
                        className="flex-1 bg-transparent px-3 py-2 text-[10px] font-bold outline-none"
                      />
                      <button onClick={handleAddCategory} className="p-2 bg-black text-white"><Check className="w-3 h-3"/></button>
                      <button onClick={() => setIsAddingCategory(false)} className="p-2 bg-zinc-200"><X className="w-3 h-3"/></button>
                   </div>
                ) : (
                  <button 
                    onClick={() => setIsAddingCategory(true)}
                    className="flex-shrink-0 w-10 h-10 rounded-2xl bg-zinc-50 border border-dashed border-zinc-300 flex items-center justify-center hover:bg-zinc-100 transition-all"
                  >
                    <Plus className="w-4 h-4 opacity-40" />
                  </button>
                )}
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-6">
                <div className="relative">
                   <textarea 
                     placeholder="O que você precisa anotar agora?" 
                     value={newNoteContent}
                     onChange={e => setNewNoteContent(e.target.value)}
                     autoFocus
                     className="w-full h-40 p-6 bg-zinc-50 rounded-[32px] font-bold text-lg outline-none border-2 border-transparent focus:border-black/5 resize-none shadow-inner leading-relaxed placeholder:opacity-20"
                   />
                </div>

                {/* Seção Programar */}
                <div>
                  <button 
                    onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${isScheduleOpen ? 'bg-black text-white border-black' : 'bg-white border-zinc-100 text-zinc-400'}`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{newNoteScheduled ? `Agendado: ${newNoteScheduled}` : 'Programar Lembrete'}</span>
                  </button>
                  
                  {isScheduleOpen && (
                    <div className="mt-3 p-4 bg-zinc-50 rounded-[24px] border border-black/5 animate-in slide-in-from-top-2">
                       <input 
                         type="datetime-local" 
                         value={newNoteScheduled}
                         onChange={e => setNewNoteScheduled(e.target.value)}
                         className="w-full p-4 bg-white rounded-xl font-bold outline-none border border-black/5"
                       />
                    </div>
                  )}
                </div>

                {/* Histórico de Notas Recentes (Mini-Feed) */}
                {!editingNoteId && allNotes.length > 0 && (
                  <div className="pt-4 border-t border-zinc-100">
                    <h6 className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4">Últimos Lembretes</h6>
                    <div className="space-y-2">
                       {allNotes.slice(0, 3).map(note => (
                         <div key={note.id} className="p-4 bg-zinc-50 rounded-2xl flex items-center justify-between group hover:bg-zinc-100 transition-all">
                            <div className="flex-1 min-w-0 pr-4">
                               <p className="text-xs font-bold truncate opacity-70">{note.content}</p>
                               <span className="text-[9px] font-black uppercase opacity-30 tracking-tighter">{note.category}</span>
                            </div>
                            <button 
                              onClick={() => setAllNotes(allNotes.map(n => n.id === note.id ? {...n, completed: !n.completed} : n))}
                              className={`p-2 rounded-xl transition-all ${note.completed ? 'bg-green-500 text-white' : 'bg-white text-zinc-200 border border-zinc-100 group-hover:text-zinc-400'}`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
             </div>

             <div className="pt-6">
                <button 
                  onClick={handleSaveNote}
                  className="w-full py-5 bg-black text-white rounded-[24px] font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Save className="w-4 h-4" /> {editingNoteId ? 'Atualizar Registro' : 'Salvar Nota Rápida'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL OCORRENCIA */}
      {isOccurrenceModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsOccurrenceModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white text-black rounded-[32px] md:rounded-[40px] shadow-2xl p-6 md:p-8 lg:p-10 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
             <header className="flex justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                <h4 className="text-xl md:text-2xl font-black uppercase leading-tight">Reportar Ocorrência</h4>
                <button onClick={() => setIsOccurrenceModalOpen(false)} className="flex-shrink-0 p-2.5 md:p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"><X className="w-5 h-5"/></button>
             </header>
             <div className="space-y-4 md:space-y-5">
                <div>
                  <label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Morador (opcional)</label>
                  <input 
                    type="text"
                    placeholder="Nome do morador..."
                    value={occurrenceResidentName}
                    onChange={e => setOccurrenceResidentName(e.target.value)}
                    className="w-full p-3 md:p-4 bg-zinc-50 rounded-2xl outline-none font-medium text-sm md:text-base border border-transparent focus:border-red-100 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Unidade (opcional)</label>
                  <input 
                    type="text"
                    placeholder="Ex: 201A, 102..."
                    value={occurrenceUnit}
                    onChange={e => setOccurrenceUnit(e.target.value)}
                    className="w-full p-3 md:p-4 bg-zinc-50 rounded-2xl outline-none font-medium text-sm md:text-base border border-transparent focus:border-red-100 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Descrição da Ocorrência *</label>
                  <textarea 
                    placeholder="Descreva o ocorrido..." 
                    value={occurrenceDescription}
                    onChange={e => setOccurrenceDescription(e.target.value)}
                    className="w-full h-32 md:h-36 p-4 bg-zinc-50 rounded-2xl outline-none font-medium text-sm md:text-base resize-none border border-transparent focus:border-red-100" 
                  />
                </div>
                <button 
                  onClick={handleSaveOccurrence}
                  disabled={!occurrenceDescription.trim()}
                  className={`w-full py-4 md:py-5 rounded-2xl font-black uppercase text-xs md:text-[10px] shadow-xl mt-4 transition-all min-h-[48px] flex items-center justify-center ${
                    occurrenceDescription.trim() 
                      ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95' 
                      : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  Registrar
                </button>
             </div>
          </div>
        </div>
      )}

      {/* NOTICE EDIT MODAL */}
      {selectedNoticeForEdit && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setSelectedNoticeForEdit(null)} />
          <div className="relative w-full max-w-lg bg-white text-black rounded-[48px] shadow-2xl p-8 md:p-12 animate-in zoom-in duration-300">
             
             <header className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                   <div className="p-4 rounded-3xl bg-green-100 text-green-600">
                      <Bell className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black uppercase tracking-tight leading-none">Aviso Mural</h4>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Editar Comunicado</p>
                   </div>
                </div>
                <button onClick={() => setSelectedNoticeForEdit(null)} className="p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200"><X className="w-5 h-5"/></button>
             </header>

             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Título</label>
                   <input 
                     type="text"
                     value={selectedNoticeForEdit.title}
                     onChange={(e) => setSelectedNoticeForEdit({...selectedNoticeForEdit, title: e.target.value})}
                     className="w-full p-5 bg-zinc-50 rounded-[24px] font-bold text-lg outline-none border-2 border-transparent focus:border-black/5"
                   />
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Conteúdo</label>
                   <textarea 
                     value={selectedNoticeForEdit.content}
                     onChange={(e) => setSelectedNoticeForEdit({...selectedNoticeForEdit, content: e.target.value})}
                     className="w-full h-32 p-5 bg-zinc-50 rounded-[24px] font-medium text-sm outline-none border-2 border-transparent focus:border-black/5 resize-none shadow-inner"
                   />
                </div>
                
                <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-[24px]">
                    <div>
                         <p className="text-[9px] font-black uppercase opacity-30">Autor</p>
                         <p className="text-xs font-bold uppercase">{selectedNoticeForEdit.author}</p>
                    </div>
                     <div>
                         <p className="text-[9px] font-black uppercase opacity-30 text-right">Data</p>
                         <p className="text-xs font-bold uppercase">{new Date(selectedNoticeForEdit.date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleDeleteNotice}
                      className="py-6 bg-red-100 text-red-600 rounded-[32px] font-black uppercase text-[11px] tracking-widest hover:bg-red-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                       <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                    <button 
                      onClick={handleSaveNoticeChanges}
                      className="py-6 bg-black text-white rounded-[32px] font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
                    >
                       <Save className="w-4 h-4" /> Salvar
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
