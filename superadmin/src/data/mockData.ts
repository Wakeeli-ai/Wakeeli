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

export const COMPANIES: Company[] = [
  {
    id: 'c1',
    name: 'Pro-Founders Real Estate',
    initials: 'PF',
    plan: 'enterprise',
    status: 'active',
    activeLeads: 284,
    monthlyConversations: 1420,
    monthlyRevenue: 1200,
    agentCount: 12,
    joinedDate: '2024-01-15',
    lastActivity: '2 minutes ago',
    responseTime: '1m 12s',
    conversionRate: 18.4,
    totalListings: 187,
    city: 'Beirut',
    contactName: 'Ramzi Khalil',
    contactEmail: 'ramzi@pro-founders.lb',
    contactPhone: '+961 70 123 456',
    whatsappNumber: '+961 70 123 456',
  },
  {
    id: 'c2',
    name: 'Beirut Commune',
    initials: 'BC',
    plan: 'professional',
    status: 'active',
    activeLeads: 156,
    monthlyConversations: 890,
    monthlyRevenue: 599,
    agentCount: 7,
    joinedDate: '2024-03-08',
    lastActivity: '15 minutes ago',
    responseTime: '2m 45s',
    conversionRate: 14.2,
    totalListings: 94,
    city: 'Beirut',
    contactName: 'Nadine Khoury',
    contactEmail: 'nadine@beirutcommune.com',
    contactPhone: '+961 71 234 567',
    whatsappNumber: '+961 71 234 567',
  },
  {
    id: 'c3',
    name: 'RayWhite Lebanon',
    initials: 'RW',
    plan: 'enterprise',
    status: 'active',
    activeLeads: 312,
    monthlyConversations: 1780,
    monthlyRevenue: 1200,
    agentCount: 18,
    joinedDate: '2023-11-22',
    lastActivity: '5 minutes ago',
    responseTime: '58s',
    conversionRate: 21.7,
    totalListings: 243,
    city: 'Metn',
    contactName: 'Georges Nasr',
    contactEmail: 'georges@raywhite.lb',
    contactPhone: '+961 76 345 678',
    whatsappNumber: '+961 76 345 678',
  },
  {
    id: 'c4',
    name: 'Spectrum Properties',
    initials: 'SP',
    plan: 'professional',
    status: 'active',
    activeLeads: 98,
    monthlyConversations: 540,
    monthlyRevenue: 599,
    agentCount: 5,
    joinedDate: '2024-05-12',
    lastActivity: '1 hour ago',
    responseTime: '3m 20s',
    conversionRate: 11.8,
    totalListings: 62,
    city: 'Jounieh',
    contactName: 'Charbel Gemayel',
    contactEmail: 'charbel@spectrumprops.lb',
    contactPhone: '+961 78 456 789',
    whatsappNumber: '+961 78 456 789',
  },
  {
    id: 'c5',
    name: 'One Properties',
    initials: 'OP',
    plan: 'enterprise',
    status: 'active',
    activeLeads: 201,
    monthlyConversations: 1120,
    monthlyRevenue: 1200,
    agentCount: 10,
    joinedDate: '2024-02-28',
    lastActivity: '30 minutes ago',
    responseTime: '1m 38s',
    conversionRate: 16.9,
    totalListings: 134,
    city: 'Achrafieh',
    contactName: 'Joelle Abi Saab',
    contactEmail: 'joelle@oneproperties.lb',
    contactPhone: '+961 79 567 890',
    whatsappNumber: '+961 79 567 890',
  },
  {
    id: 'c6',
    name: 'JSK Real Estate',
    initials: 'JSK',
    plan: 'professional',
    status: 'active',
    activeLeads: 73,
    monthlyConversations: 380,
    monthlyRevenue: 599,
    agentCount: 4,
    joinedDate: '2024-07-01',
    lastActivity: '3 hours ago',
    responseTime: '4m 10s',
    conversionRate: 9.6,
    totalListings: 45,
    city: 'Jdeideh',
    contactName: 'Sami Karam',
    contactEmail: 'sami@jsk-realestate.lb',
    contactPhone: '+961 70 678 901',
    whatsappNumber: '+961 70 678 901',
  },
  {
    id: 'c7',
    name: 'C Properties',
    initials: 'CP',
    plan: 'starter',
    status: 'trial',
    activeLeads: 24,
    monthlyConversations: 98,
    monthlyRevenue: 0,
    agentCount: 2,
    joinedDate: '2024-12-01',
    lastActivity: '2 days ago',
    responseTime: '6m 22s',
    conversionRate: 7.1,
    totalListings: 18,
    city: 'Hamra',
    contactName: 'Carla Slim',
    contactEmail: 'carla@cproperties.lb',
    contactPhone: '+961 71 789 012',
    whatsappNumber: '+961 71 789 012',
  },
  {
    id: 'c8',
    name: 'Khoury & Sons Realty',
    initials: 'KS',
    plan: 'professional',
    status: 'active',
    activeLeads: 119,
    monthlyConversations: 640,
    monthlyRevenue: 599,
    agentCount: 6,
    joinedDate: '2024-04-17',
    lastActivity: '45 minutes ago',
    responseTime: '2m 58s',
    conversionRate: 13.4,
    totalListings: 78,
    city: 'Dbayeh',
    contactName: 'Tony Khoury',
    contactEmail: 'tony@khouryrealty.lb',
    contactPhone: '+961 76 890 123',
    whatsappNumber: '+961 76 890 123',
  },
  {
    id: 'c9',
    name: 'Gemayel Group',
    initials: 'GG',
    plan: 'enterprise',
    status: 'active',
    activeLeads: 267,
    monthlyConversations: 1390,
    monthlyRevenue: 1200,
    agentCount: 14,
    joinedDate: '2023-09-05',
    lastActivity: '10 minutes ago',
    responseTime: '1m 05s',
    conversionRate: 19.8,
    totalListings: 198,
    city: 'Ashrafieh',
    contactName: 'Pierre Gemayel',
    contactEmail: 'pierre@gemayel-group.lb',
    contactPhone: '+961 78 901 234',
    whatsappNumber: '+961 78 901 234',
  },
  {
    id: 'c10',
    name: 'Metn Properties',
    initials: 'MP',
    plan: 'starter',
    status: 'churned',
    activeLeads: 0,
    monthlyConversations: 0,
    monthlyRevenue: 0,
    agentCount: 3,
    joinedDate: '2024-06-10',
    lastActivity: '3 weeks ago',
    responseTime: 'N/A',
    conversionRate: 0,
    totalListings: 12,
    city: 'Metn',
    contactName: 'Elie Tabet',
    contactEmail: 'elie@metnprops.lb',
    contactPhone: '+961 79 012 345',
    whatsappNumber: '+961 79 012 345',
  },
]

export const LEADS: Lead[] = [
  { id: 'l1', companyId: 'c1', name: 'Maroun Haddad', phone: '+961 70 111 222', source: 'WhatsApp', status: 'qualified', propertyInterest: '3BR Apartment, Achrafieh', budget: '$450,000', createdAt: '2025-03-28', lastContact: '2025-03-30', assignedAgent: 'Lara Mansour' },
  { id: 'l2', companyId: 'c1', name: 'Rania Farhat', phone: '+961 71 222 333', source: 'Instagram', status: 'new', propertyInterest: '2BR Apartment, Hamra', budget: '$280,000', createdAt: '2025-03-30', lastContact: '2025-03-30', assignedAgent: 'Unassigned' },
  { id: 'l3', companyId: 'c1', name: 'Fadi Karam', phone: '+961 76 333 444', source: 'WhatsApp', status: 'converted', propertyInterest: 'Villa, Biyada', budget: '$1,200,000', createdAt: '2025-02-15', lastContact: '2025-03-20', assignedAgent: 'Joe Rizk' },
  { id: 'l4', companyId: 'c1', name: 'Stephanie Aoun', phone: '+961 78 444 555', source: 'Referral', status: 'contacted', propertyInterest: '4BR Villa, Broumana', budget: '$800,000', createdAt: '2025-03-25', lastContact: '2025-03-29', assignedAgent: 'Lara Mansour' },
  { id: 'l5', companyId: 'c1', name: 'Naji Saab', phone: '+961 79 555 666', source: 'WhatsApp', status: 'lost', propertyInterest: 'Office, Dora', budget: '$350,000', createdAt: '2025-02-01', lastContact: '2025-03-01', assignedAgent: 'Joe Rizk' },
  { id: 'l6', companyId: 'c2', name: 'Maya Sfeir', phone: '+961 70 666 777', source: 'WhatsApp', status: 'qualified', propertyInterest: '2BR Apartment, Mar Mikhael', budget: '$320,000', createdAt: '2025-03-27', lastContact: '2025-03-30', assignedAgent: 'Rami Abi Nader' },
  { id: 'l7', companyId: 'c2', name: 'Carlos Hayek', phone: '+961 71 777 888', source: 'Facebook', status: 'new', propertyInterest: 'Studio, Gemmayze', budget: '$150,000', createdAt: '2025-03-30', lastContact: '2025-03-30', assignedAgent: 'Unassigned' },
  { id: 'l8', companyId: 'c3', name: 'Lynn Abou Jaoude', phone: '+961 76 888 999', source: 'WhatsApp', status: 'qualified', propertyInterest: '3BR Apartment, Antelias', budget: '$520,000', createdAt: '2025-03-29', lastContact: '2025-03-30', assignedAgent: 'Michel Frem' },
  { id: 'l9', companyId: 'c3', name: 'Roy Nassif', phone: '+961 78 999 000', source: 'Referral', status: 'converted', propertyInterest: 'Villa, Beit Mery', budget: '$2,100,000', createdAt: '2025-02-10', lastContact: '2025-03-15', assignedAgent: 'Nathalie Khoury' },
  { id: 'l10', companyId: 'c5', name: 'Dania Mourad', phone: '+961 70 100 200', source: 'WhatsApp', status: 'contacted', propertyInterest: '2BR Apartment, Sodeco', budget: '$380,000', createdAt: '2025-03-28', lastContact: '2025-03-30', assignedAgent: 'Hadi Raad' },
  { id: 'l11', companyId: 'c9', name: 'Ziad Abi Khalil', phone: '+961 71 200 300', source: 'WhatsApp', status: 'qualified', propertyInterest: '4BR Penthouse, Achrafieh', budget: '$1,800,000', createdAt: '2025-03-26', lastContact: '2025-03-30', assignedAgent: 'Sandra Gemayel' },
  { id: 'l12', companyId: 'c9', name: 'Tania Rizk', phone: '+961 76 300 400', source: 'Instagram', status: 'new', propertyInterest: '3BR Apartment, Badaro', budget: '$600,000', createdAt: '2025-03-30', lastContact: '2025-03-30', assignedAgent: 'Unassigned' },
]

export const CONVERSATIONS: Conversation[] = [
  { id: 'cv1', companyId: 'c1', leadName: 'Maroun Haddad', phone: '+961 70 111 222', lastMessage: 'Can we schedule a viewing this Saturday?', timestamp: '2025-03-30 14:32', status: 'agent', messageCount: 24 },
  { id: 'cv2', companyId: 'c1', leadName: 'Rania Farhat', phone: '+961 71 222 333', lastMessage: 'I am interested in the 2BR in Hamra', timestamp: '2025-03-30 12:10', status: 'bot', messageCount: 8 },
  { id: 'cv3', companyId: 'c2', leadName: 'Maya Sfeir', phone: '+961 70 666 777', lastMessage: 'What is the maintenance fee?', timestamp: '2025-03-30 11:45', status: 'agent', messageCount: 15 },
  { id: 'cv4', companyId: 'c3', leadName: 'Lynn Abou Jaoude', phone: '+961 76 888 999', lastMessage: 'Please send me the floor plan', timestamp: '2025-03-30 10:22', status: 'bot', messageCount: 12 },
  { id: 'cv5', companyId: 'c5', leadName: 'Dania Mourad', phone: '+961 70 100 200', lastMessage: 'Is the apartment furnished?', timestamp: '2025-03-30 09:55', status: 'closed', messageCount: 19 },
  { id: 'cv6', companyId: 'c9', leadName: 'Ziad Abi Khalil', phone: '+961 71 200 300', lastMessage: 'Can you negotiate the price?', timestamp: '2025-03-30 08:30', status: 'agent', messageCount: 31 },
]

export const LISTINGS: Listing[] = [
  { id: 'ls1', companyId: 'c1', title: 'Luxury 3BR Achrafieh', type: 'apartment', price: '$450,000', area: '185 sqm', location: 'Achrafieh, Beirut', bedrooms: 3, status: 'available', createdAt: '2025-02-01' },
  { id: 'ls2', companyId: 'c1', title: 'Modern Villa Biyada', type: 'villa', price: '$1,200,000', area: '420 sqm', location: 'Biyada, Metn', bedrooms: 5, status: 'sold', createdAt: '2025-01-15' },
  { id: 'ls3', companyId: 'c1', title: '2BR Hamra', type: 'apartment', price: '$280,000', area: '120 sqm', location: 'Hamra, Beirut', bedrooms: 2, status: 'available', createdAt: '2025-02-20' },
  { id: 'ls4', companyId: 'c3', title: 'Sea View 3BR Antelias', type: 'apartment', price: '$520,000', area: '200 sqm', location: 'Antelias, Metn', bedrooms: 3, status: 'available', createdAt: '2025-03-01' },
  { id: 'ls5', companyId: 'c3', title: 'Mountain Villa Beit Mery', type: 'villa', price: '$2,100,000', area: '650 sqm', location: 'Beit Mery, Metn', bedrooms: 6, status: 'sold', createdAt: '2025-01-10' },
  { id: 'ls6', companyId: 'c9', title: 'Penthouse Achrafieh', type: 'apartment', price: '$1,800,000', area: '340 sqm', location: 'Achrafieh, Beirut', bedrooms: 4, status: 'available', createdAt: '2025-02-28' },
  { id: 'ls7', companyId: 'c9', title: 'Office Space Dora', type: 'office', price: '$320,000', area: '95 sqm', location: 'Dora, Beirut', bedrooms: 0, status: 'pending', createdAt: '2025-03-10' },
  { id: 'ls8', companyId: 'c5', title: '2BR Sodeco', type: 'apartment', price: '$380,000', area: '145 sqm', location: 'Sodeco, Beirut', bedrooms: 2, status: 'available', createdAt: '2025-03-05' },
]

export const AGENTS: Agent[] = [
  { id: 'a1', companyId: 'c1', name: 'Lara Mansour', role: 'Senior Agent', leads: 84, conversions: 16, responseTime: '1m 05s', satisfaction: 4.8, phone: '+961 70 111 001', joinedDate: '2024-01-15' },
  { id: 'a2', companyId: 'c1', name: 'Joe Rizk', role: 'Agent', leads: 62, conversions: 11, responseTime: '1m 32s', satisfaction: 4.5, phone: '+961 71 111 002', joinedDate: '2024-03-20' },
  { id: 'a3', companyId: 'c3', name: 'Michel Frem', role: 'Senior Agent', leads: 98, conversions: 22, responseTime: '55s', satisfaction: 4.9, phone: '+961 76 111 003', joinedDate: '2023-11-22' },
  { id: 'a4', companyId: 'c3', name: 'Nathalie Khoury', role: 'Agent', leads: 74, conversions: 14, responseTime: '1m 10s', satisfaction: 4.7, phone: '+961 78 111 004', joinedDate: '2024-01-08' },
  { id: 'a5', companyId: 'c9', name: 'Sandra Gemayel', role: 'Team Lead', leads: 112, conversions: 24, responseTime: '58s', satisfaction: 4.9, phone: '+961 79 111 005', joinedDate: '2023-09-05' },
  { id: 'a6', companyId: 'c5', name: 'Hadi Raad', role: 'Agent', leads: 56, conversions: 9, responseTime: '1m 45s', satisfaction: 4.4, phone: '+961 70 111 006', joinedDate: '2024-02-28' },
]

export const BILLING: BillingRecord[] = [
  { id: 'b1', companyId: 'c1', date: '2025-03-01', amount: 1200, status: 'paid', description: 'Enterprise Plan - March 2025' },
  { id: 'b2', companyId: 'c1', date: '2025-02-01', amount: 1200, status: 'paid', description: 'Enterprise Plan - February 2025' },
  { id: 'b3', companyId: 'c1', date: '2025-01-01', amount: 1200, status: 'paid', description: 'Enterprise Plan - January 2025' },
  { id: 'b4', companyId: 'c2', date: '2025-03-01', amount: 599, status: 'paid', description: 'Professional Plan - March 2025' },
  { id: 'b5', companyId: 'c2', date: '2025-02-01', amount: 599, status: 'paid', description: 'Professional Plan - February 2025' },
  { id: 'b6', companyId: 'c3', date: '2025-03-01', amount: 1200, status: 'paid', description: 'Enterprise Plan - March 2025' },
  { id: 'b7', companyId: 'c5', date: '2025-03-01', amount: 1200, status: 'paid', description: 'Enterprise Plan - March 2025' },
  { id: 'b8', companyId: 'c9', date: '2025-03-01', amount: 1200, status: 'paid', description: 'Enterprise Plan - March 2025' },
  { id: 'b9', companyId: 'c8', date: '2025-03-01', amount: 599, status: 'paid', description: 'Professional Plan - March 2025' },
  { id: 'b10', companyId: 'c4', date: '2025-03-01', amount: 599, status: 'pending', description: 'Professional Plan - March 2025' },
]

export const MONTHLY_REVENUE = [
  { month: 'Sep', revenue: 4200 },
  { month: 'Oct', revenue: 5400 },
  { month: 'Nov', revenue: 5998 },
  { month: 'Dec', revenue: 6598 },
  { month: 'Jan', revenue: 7797 },
  { month: 'Feb', revenue: 8396 },
  { month: 'Mar', revenue: 8995 },
]

export const CONVERSATIONS_TREND = [
  { month: 'Sep', total: 2840 },
  { month: 'Oct', total: 3920 },
  { month: 'Nov', total: 4560 },
  { month: 'Dec', total: 4120 },
  { month: 'Jan', total: 5340 },
  { month: 'Feb', total: 6180 },
  { month: 'Mar', total: 6760 },
]
