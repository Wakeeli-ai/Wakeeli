export interface Company {
  id: string
  name: string
  initials: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'trial' | 'churned'
  activeLeads: number
  monthlyConversations: number
  monthlyRevenue: number
  agentCount: number
  joinedDate: string
  lastActivity: string
  responseTime: string
  conversionRate: number
  totalListings: number
  city: string
  contactName: string
  contactEmail: string
  contactPhone: string
  whatsappNumber: string
}

export interface Lead {
  id: string
  companyId: string
  name: string
  phone: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  propertyInterest: string
  budget: string
  createdAt: string
  lastContact: string
  assignedAgent: string
}

export interface Conversation {
  id: string
  companyId: string
  leadName: string
  phone: string
  lastMessage: string
  timestamp: string
  status: 'open' | 'closed' | 'bot' | 'agent'
  messageCount: number
}

export interface Listing {
  id: string
  companyId: string
  title: string
  type: 'apartment' | 'villa' | 'office' | 'land' | 'chalet'
  price: string
  area: string
  location: string
  bedrooms: number
  status: 'available' | 'sold' | 'rented' | 'pending'
  createdAt: string
}

export interface Agent {
  id: string
  companyId: string
  name: string
  role: string
  leads: number
  conversions: number
  responseTime: string
  satisfaction: number
  phone: string
  joinedDate: string
}

export interface BillingRecord {
  id: string
  companyId: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  description: string
}

export const COMPANIES: Company[] = []

export const LEADS: Lead[] = []

export const CONVERSATIONS: Conversation[] = []

export const LISTINGS: Listing[] = []

export const AGENTS: Agent[] = []

export const BILLING: BillingRecord[] = []

export const MONTHLY_REVENUE: { month: string; revenue: number }[] = []

export const CONVERSATIONS_TREND: { month: string; total: number }[] = []
