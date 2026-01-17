
export type UserRole = 'PORTEIRO' | 'SINDICO';

export type QuickViewCategory = 'packages' | 'visitors' | 'occurrences' | 'reservations' | 'notes' | 'notices' | null;

// ==========================================
// Tabela: package_items
// ==========================================
export interface PackageItem {
  id: string; // UUID
  package_id?: string; // UUID
  name: string;
  description: string;
  created_at?: string;
}

// ==========================================
// Tabela: packages
// ==========================================
export interface Package {
  id: string; // UUID
  recipient_id?: string; // FK do Morador (UUID)
  recipient_name?: string; // Cache (antigo "recipient")
  unit: string;
  type: string;
  received_at: string; // DB column: received_at
  display_time?: string;
  status: 'Pendente' | 'Entregue';
  deadline_minutes?: number; // DB column: deadline_minutes
  resident_phone?: string;
  delivered_at?: string;
  delivered_by?: string;
  items?: PackageItem[];

  // Campos legados para compatibilidade temporária (serão removidos)
  recipient?: string;
  receivedAt?: string;
  displayTime?: string;
  deadlineMinutes?: number;
  residentPhone?: string;
}

// ==========================================
// Tabela: reservations
// ==========================================
export interface Reservation {
  id: string; // UUID
  area_id?: string; // FK (UUID)
  resident_id?: string; // FK (UUID)
  resident_name?: string; // Cache
  unit: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  status: 'scheduled' | 'active' | 'completed' | 'canceled';

  // Campos legados
  area?: string;
  resident?: string;
}

// ==========================================
// Tabela: residents
// ==========================================
export interface Resident {
  id: string; // UUID
  name: string;
  unit: string;
  email: string;
  phone: string;
  whatsapp: string;
  created_at?: string;
}

// ==========================================
// Tabela: occurrences
// ==========================================
export interface Occurrence {
  id: string; // UUID
  resident_id?: string; // FK (UUID)
  resident_name?: string; // Cache
  unit: string;
  description: string;
  status: 'Aberto' | 'Em Andamento' | 'Resolvido';
  date: string; // ISO
  reported_by: string;
  resolved_at?: string;
  resolved_by?: string;

  // Campos legados
  residentName?: string;
  reportedBy?: string;
}

// ==========================================
// Tabela: staff
// ==========================================
export interface Staff {
  id: string; // UUID
  name: string;
  role: string;
  status: 'Ativo' | 'Férias' | 'Licença';
  shift: 'Comercial' | 'Manhã' | 'Tarde' | 'Noite' | 'Madrugada';
  phone?: string;
  email?: string;
  created_at?: string;
}

// ==========================================
// Tabela: notices
// ==========================================
export interface Notice {
  id: string; // UUID
  title: string;
  content: string;
  author: string;
  author_role: 'SINDICO' | 'PORTEIRO';
  author_id?: string; // FK
  date: string;
  category?: 'Urgente' | 'Manutenção' | 'Social' | 'Institucional';
  priority?: 'high' | 'normal';
  pinned?: boolean;

  // Campos legados
  authorRole?: 'SINDICO' | 'PORTEIRO';
}

// ==========================================
// Tabela: chat_messages
// ==========================================
export interface ChatMessage {
  id: string; // UUID
  text: string;
  sender_role: 'SINDICO' | 'PORTEIRO';
  sender_id?: string;
  timestamp: string;
  read: boolean;

  // Campos legados
  senderRole?: 'SINDICO' | 'PORTEIRO';
}

// ==========================================
// Tabela: notes
// ==========================================
export interface Note {
  id: string; // UUID
  content: string;
  date: string;
  completed: boolean;
  scheduled?: string;
  category?: string;
  created_by?: string;
}

// ==========================================
// Tabela: visitors
// ==========================================
export interface VisitorLog {
  id: string; // UUID
  resident_id?: string; // FK
  resident_name?: string; // Cache
  unit: string;
  visitor_count: number;
  visitor_names: string;
  type: 'Visita' | 'Prestador' | 'Delivery';
  doc?: string;
  plate?: string;
  vehicle?: string;
  entry_time: string;
  exit_time?: string;
  status: 'active' | 'completed';
  registered_by?: string;

  // Campos legados
  residentName?: string;
  visitorCount?: number;
  visitorNames?: string;
  entryTime?: string;
  exitTime?: string;
}

// ==========================================
// Tabela: crm_units
// ==========================================
export interface CrmUnit {
  id: string; // UUID
  unit: string;
  floor?: string;
  resident_id?: string;
  resident_name?: string;
  status: 'calm' | 'warning' | 'critical';
  tags: string[];
  last_incident?: string;
  nps_score?: number;

  // Campos legados
  residentName?: string;
  npsScore?: number;
  lastIncident?: string;
}

// ==========================================
// Tabela: crm_issues
// ==========================================
export interface CrmIssue {
  id: string; // UUID
  title: string;
  involved_units: string[];
  severity: 'low' | 'medium' | 'high';
  status: 'analysis' | 'mediation' | 'legal' | 'resolved';
  description: string;
  updated_at: string;
  created_at?: string;

  // Campos legados
  involvedUnits?: string[];
  updatedAt?: string;
}

export type UnitStatus = 'calm' | 'warning' | 'critical';
