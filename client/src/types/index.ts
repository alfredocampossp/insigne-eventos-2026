export interface Company {
  id?: string;
  name: string;
  cnpj?: string;
  industry?: string;
  website?: string;
  address?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any;
}

export interface Contact {
  id?: string;
  companyId: string;
  companyName?: string; // Denormalized for easier display
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
  createdAt: any;
}

export interface Deal {
  id?: string;
  title: string;
  companyId: string;
  companyName: string;
  contactId?: string;
  contactName?: string;
  value: number;
  pipelineStageId: string; // e.g., "lead", "meeting", "proposal", "negotiation", "won", "lost"
  probability: number; // 0-100
  expectedCloseDate?: any;
  status: "open" | "won" | "lost" | "abandoned";
  createdAt: any;
  updatedAt: any;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: "lead", name: "Lead / Prospecção", color: "bg-slate-100 border-slate-200", order: 1 },
  { id: "meeting", name: "Reunião Agendada", color: "bg-blue-50 border-blue-200", order: 2 },
  { id: "proposal", name: "Proposta Enviada", color: "bg-purple-50 border-purple-200", order: 3 },
  { id: "negotiation", name: "Em Negociação", color: "bg-orange-50 border-orange-200", order: 4 },
  { id: "won", name: "Fechado Ganho", color: "bg-emerald-50 border-emerald-200", order: 5 },
  { id: "lost", name: "Perdido", color: "bg-red-50 border-red-200", order: 6 },
];

export interface ProposalItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Proposal {
  id?: string;
  dealId: string;
  dealTitle: string;
  companyName: string;
  contactName: string;
  version: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  items: ProposalItem[];
  subtotal: number;
  taxRate: number; // percentage
  taxAmount: number;
  total: number;
  validUntil: any;
  notes?: string;
  pdfUrl?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  dueDate?: any;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  assignedTo?: string; // User ID
  relatedTo?: {
    type: "deal" | "contact" | "company";
    id: string;
    name: string;
  };
  createdAt: any;
  updatedAt: any;
}

export interface FinancialRecord {
  id?: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: any;
  status: "pending" | "paid";
  dealId?: string;
  dealTitle?: string;
  createdAt: any;
  updatedAt: any;
}

// Tipos para o sistema de contatos e comunicações no modal de Negócios
export interface DealContactLog {
  id?: string;
  dealId: string;
  contactId: string;
  contactName: string;
  type: "phone" | "email" | "meeting" | "message";
  subject?: string;
  notes: string;
  duration?: number; // em minutos, para chamadas
  timestamp: any; // Firestore Timestamp
  createdAt: any;
}

export interface DealScheduledContact {
  id?: string;
  dealId: string;
  contactId: string;
  contactName: string;
  scheduledFor: any; // Firestore Timestamp
  type: "phone" | "email" | "meeting";
  subject: string;
  notes?: string;
  status: "pending" | "completed" | "cancelled";
  completedAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface DealCommunicationThread {
  id?: string;
  dealId: string;
  contactId: string;
  contactName: string;
  subject: string;
  messages: {
    id: string;
    sender: "user" | "contact";
    senderName: string;
    content: string;
    timestamp: any;
    attachments?: string[]; // URLs de anexos
  }[];
  lastMessageAt: any;
  createdAt: any;
  updatedAt: any;
}
