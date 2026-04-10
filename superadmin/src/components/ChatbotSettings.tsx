import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
  GitBranch, HelpCircle, Home, PhoneForwarded, Globe, Building2, Target,
  Search, Save, Check, Plus, X, ChevronUp, ChevronDown, AlertCircle, MessageSquare,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type SettingValue = string | number | boolean | string[]
type SettingType = 'boolean' | 'number' | 'select' | 'multi-select' | 'text' | 'time' | 'order'

interface SelectOption { value: string; label: string }

interface SettingDef {
  key: string
  label: string
  description: string
  type: SettingType
  options?: SelectOption[]
  chipOptions?: SelectOption[]
  min?: number
  max?: number
  step?: number
  dependsOn?: string
  dependsOnValue?: boolean
  placeholder?: string
  suffix?: string
}

interface CategoryDef {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  color: string
  bg: string
  settings: SettingDef[]
}

interface ChatbotSettingsProps {
  companyId: string
  companyName: string
  settings?: Record<string, SettingValue>
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULTS: Record<string, SettingValue> = {
  zero_match_behavior: 'show_alternatives',
  rejection_escalation_count: 2,
  bot_identity_response: "I'm Wakeeli, your real estate assistant. I help you find the perfect property in Lebanon!",
  returning_lead_behavior: 'check_in',
  off_topic_handling: 'redirect',
  max_conversation_turns: 20,
  greeting_behavior: 'name_based',
  lead_texts_first: true,
  conversation_timeout_minutes: 30,
  auto_close_hours: 24,
  ask_furnished: true,
  furnished_ask_count: 1,
  budget_ask_count: 2,
  ask_name: true,
  name_collection_timing: 'after_interest',
  question_bundling: false,
  ask_phone: true,
  ask_email: false,
  ask_move_in_date: true,
  qualification_order: ['bedrooms', 'budget', 'location', 'furnished', 'timeline'],
  custom_questions: [],
  listings_per_response: 3,
  currency_display: 'both',
  lbp_usd_rate: 89500,
  address_sharing_policy: 'area_only',
  service_areas: ['Beirut', 'Metn', 'Kesrouan'],
  property_types: ['apartment', 'villa', 'office'],
  min_match_threshold: 70,
  show_alternatives: true,
  alternative_radius: 5,
  photo_response_wording: 'Here are some properties that match what you are looking for:',
  price_display_format: 'exact',
  highlight_new_listings: true,
  listing_sort_order: 'relevance',
  tour_booking_method: 'whatsapp',
  working_hours_enabled: true,
  working_hours_start: '09:00',
  working_hours_end: '18:00',
  working_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  off_hours_behavior: 'collect_lead',
  agent_assignment_method: 'round_robin',
  high_budget_threshold: 1000000,
  high_budget_routing: 'senior_agent',
  escalation_triggers: ['price_negotiation', 'legal_question', 'complaint'],
  max_bot_turns_before_handoff: 15,
  handoff_message: 'Let me connect you with one of our agents who can assist you further.',
  require_listings_before_handoff: true,
  notify_agent_method: 'whatsapp',
  supported_languages: ['english', 'arabic'],
  primary_language: 'english',
  arabic_dialect: 'lebanese',
  bot_display_name: 'Wakeeli Assistant',
  tone_style: 'professional',
  competitor_mention_handling: 'redirect',
  price_negotiation_handling: 'defer_to_agent',
  emoji_usage: 'minimal',
  message_length_preference: 'medium',
  formality_level: 'semi_formal',
  company_display_name: '',
  company_specialization: 'Residential and commercial real estate in Lebanon',
  whatsapp_number: '',
  website_url: '',
  office_address: '',
  exclusive_listings_only: false,
  listing_source: 'manual',
  company_tagline: '',
  agent_title: 'Agent',
  default_agent_name: 'Our Team',
  brand_keywords: [],
  follow_up_enabled: true,
  follow_up_delay_hours: 24,
  follow_up_max_attempts: 3,
  lead_scoring_enabled: true,
  duplicate_detection: 'phone',
  min_budget_threshold: 0,
  lead_source_tracking: true,
  auto_tag_leads: true,
  lead_notes_enabled: true,
}

// ─── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES: CategoryDef[] = [
  {
    id: 'conversation_flow',
    label: 'Conversation Flow',
    description: 'How the bot opens conversations, handles edge cases, and manages timeouts.',
    icon: <GitBranch size={15} />,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    settings: [
      { key: 'greeting_behavior', label: 'Greeting Style', description: 'How the bot opens each new conversation.', type: 'select', options: [{ value: 'formal', label: 'Formal' }, { value: 'casual', label: 'Casual' }, { value: 'name_based', label: 'Name-based (uses lead name if known)' }] },
      { key: 'lead_texts_first', label: 'Lead Messages First', description: 'Bot waits for the lead to initiate before responding.', type: 'boolean' },
      { key: 'zero_match_behavior', label: 'No Match Behavior', description: 'What the bot does when no listings match the lead criteria.', type: 'select', options: [{ value: 'escalate_to_agent', label: 'Escalate to agent immediately' }, { value: 'show_alternatives', label: 'Show closest alternatives' }, { value: 'apologize_and_ask_again', label: 'Apologize and refine criteria' }] },
      { key: 'rejection_escalation_count', label: 'Rejections Before Escalation', description: 'Number of rejected listings before escalating to a human.', type: 'number', min: 1, max: 10, suffix: 'rejections' },
      { key: 'returning_lead_behavior', label: 'Returning Lead Behavior', description: 'How the bot treats someone who has messaged before.', type: 'select', options: [{ value: 'resume', label: 'Resume previous conversation' }, { value: 'fresh_start', label: 'Start fresh' }, { value: 'check_in', label: 'Check in first' }] },
      { key: 'off_topic_handling', label: 'Off-Topic Handling', description: 'Response strategy for messages unrelated to real estate.', type: 'select', options: [{ value: 'redirect', label: 'Redirect back to real estate' }, { value: 'answer_briefly', label: 'Answer briefly then redirect' }, { value: 'ignore', label: 'Ignore and continue' }] },
      { key: 'max_conversation_turns', label: 'Max Conversation Turns', description: 'Maximum number of message exchanges before auto-closing the session.', type: 'number', min: 5, max: 100, suffix: 'turns' },
      { key: 'bot_identity_response', label: 'Bot Identity Response', description: 'What the bot says when a lead asks "Are you a bot?"', type: 'text', placeholder: "e.g. I'm Wakeeli, your AI real estate assistant..." },
      { key: 'conversation_timeout_minutes', label: 'Conversation Timeout', description: 'Minutes of inactivity before the bot stops waiting for a reply.', type: 'number', min: 5, max: 1440, suffix: 'min' },
      { key: 'auto_close_hours', label: 'Auto-Close After', description: 'Hours after last message before the conversation is automatically closed.', type: 'number', min: 1, max: 168, suffix: 'hrs' },
    ],
  },
  {
    id: 'qualifying_questions',
    label: 'Qualifying Questions',
    description: 'Which questions the bot asks leads, how often, and in what sequence.',
    icon: <HelpCircle size={15} />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    settings: [
      { key: 'ask_name', label: 'Ask for Name', description: 'Collect the lead\'s name during qualification.', type: 'boolean' },
      { key: 'name_collection_timing', label: 'Name Collection Timing', description: 'When to ask for the lead\'s name.', type: 'select', options: [{ value: 'start', label: 'At conversation start' }, { value: 'after_interest', label: 'After showing interest' }, { value: 'before_handoff', label: 'Just before agent handoff' }], dependsOn: 'ask_name', dependsOnValue: true },
      { key: 'ask_phone', label: 'Ask for Phone Number', description: 'Request a phone number during the qualification flow.', type: 'boolean' },
      { key: 'ask_email', label: 'Ask for Email', description: 'Request an email address from the lead.', type: 'boolean' },
      { key: 'ask_furnished', label: 'Ask About Furnished', description: 'Ask whether the lead wants a furnished or unfurnished property.', type: 'boolean' },
      { key: 'furnished_ask_count', label: 'Furnished Question Attempts', description: 'How many times to probe if the lead is unsure about furnishing.', type: 'number', min: 1, max: 3, suffix: 'times', dependsOn: 'ask_furnished', dependsOnValue: true },
      { key: 'budget_ask_count', label: 'Budget Question Attempts', description: 'How many times to ask for a budget when the lead is vague.', type: 'number', min: 1, max: 5, suffix: 'times' },
      { key: 'ask_move_in_date', label: 'Ask for Move-In Date', description: 'Collect the lead\'s desired availability or move-in date.', type: 'boolean' },
      { key: 'question_bundling', label: 'Bundle Questions', description: 'Ask multiple qualifying questions in a single message to speed up qualification.', type: 'boolean' },
      { key: 'qualification_order', label: 'Qualification Order', description: 'Sequence in which qualifying topics are covered.', type: 'order', options: [{ value: 'bedrooms', label: 'Bedrooms' }, { value: 'budget', label: 'Budget' }, { value: 'location', label: 'Location' }, { value: 'furnished', label: 'Furnished' }, { value: 'timeline', label: 'Timeline' }] },
      { key: 'custom_questions', label: 'Custom Questions', description: 'Additional questions specific to this agency.', type: 'multi-select', chipOptions: [] },
    ],
  },
  {
    id: 'listings_matching',
    label: 'Listings & Matching',
    description: 'How listings are retrieved, scored, displayed, and matched to lead criteria.',
    icon: <Home size={15} />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    settings: [
      { key: 'property_types', label: 'Property Types Handled', description: 'Types of properties this agency deals with.', type: 'multi-select', chipOptions: [{ value: 'apartment', label: 'Apartment' }, { value: 'villa', label: 'Villa' }, { value: 'office', label: 'Office' }, { value: 'shop', label: 'Shop' }, { value: 'land', label: 'Land' }, { value: 'duplex', label: 'Duplex' }, { value: 'chalet', label: 'Chalet' }, { value: 'warehouse', label: 'Warehouse' }] },
      { key: 'service_areas', label: 'Service Areas', description: 'Regions and districts this agency operates in.', type: 'multi-select', chipOptions: [{ value: 'Beirut', label: 'Beirut' }, { value: 'Metn', label: 'Metn' }, { value: 'Kesrouan', label: 'Kesrouan' }, { value: 'Chouf', label: 'Chouf' }, { value: 'Baabda', label: 'Baabda' }, { value: 'Jbeil', label: 'Jbeil' }, { value: 'Tripoli', label: 'Tripoli' }, { value: 'Saida', label: 'Saida' }, { value: 'Tyre', label: 'Tyre' }, { value: 'Zahle', label: 'Zahle' }] },
      { key: 'listings_per_response', label: 'Listings Per Response', description: 'How many listings to show in each bot message.', type: 'number', min: 1, max: 10, suffix: 'listings' },
      { key: 'listing_sort_order', label: 'Listing Sort Order', description: 'How matched listings are ranked before display.', type: 'select', options: [{ value: 'relevance', label: 'Best match first' }, { value: 'price_asc', label: 'Price: low to high' }, { value: 'price_desc', label: 'Price: high to low' }, { value: 'newest', label: 'Newest first' }] },
      { key: 'min_match_threshold', label: 'Minimum Match Score', description: 'Minimum match percentage a listing must score to be shown to a lead.', type: 'number', min: 0, max: 100, suffix: '%' },
      { key: 'show_alternatives', label: 'Show Alternative Listings', description: 'Offer nearby alternatives when no exact match is found.', type: 'boolean' },
      { key: 'alternative_radius', label: 'Alternative Search Radius', description: 'Distance in km to expand the search for alternatives.', type: 'number', min: 1, max: 50, suffix: 'km', dependsOn: 'show_alternatives', dependsOnValue: true },
      { key: 'currency_display', label: 'Currency Display', description: 'How prices are shown in WhatsApp conversations.', type: 'select', options: [{ value: 'usd', label: 'USD only' }, { value: 'lbp', label: 'LBP only' }, { value: 'both', label: 'Both USD and LBP' }] },
      { key: 'lbp_usd_rate', label: 'LBP / USD Rate', description: 'Exchange rate used to convert USD listings to LBP.', type: 'number', min: 1, max: 999999, suffix: 'LBP' },
      { key: 'price_display_format', label: 'Price Display Format', description: 'How specific the price is when shared with a lead.', type: 'select', options: [{ value: 'exact', label: 'Exact price' }, { value: 'range', label: 'Price range' }, { value: 'on_request', label: 'Price on request' }] },
      { key: 'address_sharing_policy', label: 'Address Sharing Policy', description: 'How much location detail the bot shares over WhatsApp.', type: 'select', options: [{ value: 'full', label: 'Full address' }, { value: 'area_only', label: 'Area / district only' }, { value: 'on_request', label: 'Only when asked' }] },
      { key: 'highlight_new_listings', label: 'Highlight New Listings', description: 'Prioritize and label listings added in the last 7 days.', type: 'boolean' },
      { key: 'photo_response_wording', label: 'Listing Intro Text', description: 'The intro sentence before listing details are shared.', type: 'text', placeholder: "e.g. Here are some properties that match what you're looking for:" },
    ],
  },
  {
    id: 'handoff_escalation',
    label: 'Handoff & Escalation',
    description: 'When and how the bot transfers warm leads to human agents.',
    icon: <PhoneForwarded size={15} />,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    settings: [
      { key: 'tour_booking_method', label: 'Tour Booking Method', description: 'How property tours are scheduled once a lead is ready.', type: 'select', options: [{ value: 'whatsapp', label: 'Coordinate via WhatsApp' }, { value: 'google_calendar', label: 'Google Calendar invite' }, { value: 'manual', label: 'Manual (agent handles it)' }] },
      { key: 'max_bot_turns_before_handoff', label: 'Max Bot Turns Before Handoff', description: 'Force escalation after this many turns if no handoff has occurred.', type: 'number', min: 3, max: 50, suffix: 'turns' },
      { key: 'require_listings_before_handoff', label: 'Require Listings First', description: 'Bot must show at least one listing before handing off to an agent.', type: 'boolean' },
      { key: 'handoff_message', label: 'Handoff Message', description: 'Message sent to the lead when transferring to a human agent.', type: 'text', placeholder: 'e.g. Let me connect you with one of our agents...' },
      { key: 'escalation_triggers', label: 'Escalation Triggers', description: 'Topics that immediately trigger a handoff to an agent.', type: 'multi-select', chipOptions: [{ value: 'price_negotiation', label: 'Price Negotiation' }, { value: 'legal_question', label: 'Legal Question' }, { value: 'complaint', label: 'Complaint' }, { value: 'urgent', label: 'Urgent Request' }, { value: 'document_request', label: 'Document Request' }, { value: 'vip_lead', label: 'VIP Lead' }] },
      { key: 'agent_assignment_method', label: 'Agent Assignment', description: 'How escalated leads are routed to agents.', type: 'select', options: [{ value: 'round_robin', label: 'Round robin' }, { value: 'first_available', label: 'First available' }, { value: 'manual', label: 'Manual selection' }] },
      { key: 'high_budget_threshold', label: 'High-Budget Threshold', description: 'Leads above this USD amount route to senior agents.', type: 'number', min: 0, max: 10000000, suffix: 'USD' },
      { key: 'high_budget_routing', label: 'High-Budget Routing', description: 'How leads exceeding the threshold are handled.', type: 'select', options: [{ value: 'senior_agent', label: 'Route to senior agent' }, { value: 'specific_agent', label: 'Route to a specific agent' }, { value: 'normal', label: 'Normal routing' }] },
      { key: 'notify_agent_method', label: 'Agent Notification', description: 'How agents are alerted of a new escalation or lead.', type: 'select', options: [{ value: 'whatsapp', label: 'WhatsApp' }, { value: 'email', label: 'Email' }, { value: 'both', label: 'WhatsApp + Email' }] },
      { key: 'working_hours_enabled', label: 'Enforce Working Hours', description: 'Restrict live agent availability to defined office hours.', type: 'boolean' },
      { key: 'working_days', label: 'Working Days', description: 'Days of the week the office is staffed.', type: 'multi-select', chipOptions: [{ value: 'mon', label: 'Mon' }, { value: 'tue', label: 'Tue' }, { value: 'wed', label: 'Wed' }, { value: 'thu', label: 'Thu' }, { value: 'fri', label: 'Fri' }, { value: 'sat', label: 'Sat' }, { value: 'sun', label: 'Sun' }], dependsOn: 'working_hours_enabled', dependsOnValue: true },
      { key: 'working_hours_start', label: 'Opening Time', description: 'Time the office opens and agents become available.', type: 'time', dependsOn: 'working_hours_enabled', dependsOnValue: true },
      { key: 'working_hours_end', label: 'Closing Time', description: 'Time the office closes.', type: 'time', dependsOn: 'working_hours_enabled', dependsOnValue: true },
      { key: 'off_hours_behavior', label: 'Off-Hours Behavior', description: 'What the bot does when a lead messages outside working hours.', type: 'select', options: [{ value: 'collect_lead', label: 'Collect info and follow up later' }, { value: 'reply_later', label: 'Tell them agents will reply in the morning' }, { value: 'forward_number', label: 'Share emergency contact number' }], dependsOn: 'working_hours_enabled', dependsOnValue: true },
    ],
  },
  {
    id: 'language_tone',
    label: 'Language & Tone',
    description: "The bot's name, language, dialect, personality, and communication style.",
    icon: <Globe size={15} />,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    settings: [
      { key: 'bot_display_name', label: 'Bot Display Name', description: 'The name the bot uses to introduce itself.', type: 'text', placeholder: 'e.g. Wakeeli Assistant' },
      { key: 'supported_languages', label: 'Supported Languages', description: 'Languages the bot can converse in.', type: 'multi-select', chipOptions: [{ value: 'english', label: 'English' }, { value: 'arabic', label: 'Arabic' }, { value: 'french', label: 'French' }] },
      { key: 'primary_language', label: 'Primary Language', description: 'Default language used to open conversations.', type: 'select', options: [{ value: 'english', label: 'English' }, { value: 'arabic', label: 'Arabic' }, { value: 'french', label: 'French' }] },
      { key: 'arabic_dialect', label: 'Arabic Dialect', description: 'Which Arabic dialect the bot writes in.', type: 'select', options: [{ value: 'lebanese', label: 'Lebanese' }, { value: 'msa', label: 'Modern Standard Arabic' }, { value: 'gulf', label: 'Gulf' }] },
      { key: 'tone_style', label: 'Tone Style', description: 'Overall personality and vibe of the bot.', type: 'select', options: [{ value: 'professional', label: 'Professional' }, { value: 'friendly', label: 'Friendly' }, { value: 'casual', label: 'Casual' }] },
      { key: 'formality_level', label: 'Formality Level', description: 'How formal the bot language is.', type: 'select', options: [{ value: 'formal', label: 'Formal' }, { value: 'semi_formal', label: 'Semi-formal' }, { value: 'casual', label: 'Casual' }] },
      { key: 'emoji_usage', label: 'Emoji Usage', description: 'How frequently the bot uses emojis in messages.', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'minimal', label: 'Minimal (1 per message max)' }, { value: 'moderate', label: 'Moderate' }] },
      { key: 'message_length_preference', label: 'Message Length', description: 'Preferred length of the bot responses.', type: 'select', options: [{ value: 'short', label: 'Short and punchy' }, { value: 'medium', label: 'Medium (2-3 sentences)' }, { value: 'detailed', label: 'Detailed and thorough' }] },
      { key: 'competitor_mention_handling', label: 'Competitor Mention Handling', description: 'How the bot responds when a lead mentions a competitor agency.', type: 'select', options: [{ value: 'redirect', label: 'Redirect to our listings' }, { value: 'acknowledge', label: 'Acknowledge then pivot' }, { value: 'ignore', label: 'Ignore and continue' }] },
      { key: 'price_negotiation_handling', label: 'Price Negotiation Handling', description: 'How the bot handles requests to lower or negotiate price.', type: 'select', options: [{ value: 'defer_to_agent', label: 'Defer to agent' }, { value: 'indicate_fixed', label: 'Indicate prices are fixed' }, { value: 'flexible', label: 'Indicate some flexibility' }] },
    ],
  },
  {
    id: 'company_info',
    label: 'Company Info',
    description: 'Core agency details the bot uses to represent the company correctly.',
    icon: <Building2 size={15} />,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    settings: [
      { key: 'company_display_name', label: 'Display Name', description: 'How the bot refers to the company in conversations.', type: 'text', placeholder: 'e.g. Pro-Founders Real Estate' },
      { key: 'company_tagline', label: 'Tagline', description: 'Short value proposition used in opening messages.', type: 'text', placeholder: "e.g. Beirut's premier real estate partner" },
      { key: 'company_specialization', label: 'Specialization Note', description: "Brief note on what this agency specializes in, used in the bot's context.", type: 'text', placeholder: 'e.g. Luxury apartments in Beirut and Metn' },
      { key: 'whatsapp_number', label: 'WhatsApp Number', description: 'Phone number linked to the WhatsApp Business account.', type: 'text', placeholder: '+961 X XXX XXXX' },
      { key: 'website_url', label: 'Website URL', description: 'Company website shared with leads on request.', type: 'text', placeholder: 'https://yourcompany.com' },
      { key: 'office_address', label: 'Office Address', description: 'Physical address shared when leads ask where to visit.', type: 'text', placeholder: 'e.g. Hamra Street, Beirut' },
      { key: 'agent_title', label: 'Agent Title', description: 'How the bot refers to staff members.', type: 'text', placeholder: 'e.g. Agent, Consultant, Advisor' },
      { key: 'default_agent_name', label: 'Default Agent Name', description: 'Generic name used when no specific agent is assigned.', type: 'text', placeholder: 'e.g. Our Team, Customer Care' },
      { key: 'listing_source', label: 'Listing Source', description: 'How property listings are imported into Wakeeli.', type: 'select', options: [{ value: 'manual', label: 'Manual entry' }, { value: 'crm_sync', label: 'CRM sync' }, { value: 'api', label: 'API integration' }] },
      { key: 'exclusive_listings_only', label: 'Exclusive Listings Only', description: 'Bot only promotes this agency\'s exclusive listings, not shared inventory.', type: 'boolean' },
      { key: 'brand_keywords', label: 'Brand Keywords', description: 'Terms the bot associates with this company\'s identity.', type: 'multi-select', chipOptions: [{ value: 'luxury', label: 'Luxury' }, { value: 'affordable', label: 'Affordable' }, { value: 'trusted', label: 'Trusted' }, { value: 'exclusive', label: 'Exclusive' }, { value: 'premium', label: 'Premium' }, { value: 'modern', label: 'Modern' }, { value: 'established', label: 'Established' }] },
    ],
  },
  {
    id: 'lead_management',
    label: 'Lead Management',
    description: 'Rules for scoring, following up, tagging, and deduplicating leads.',
    icon: <Target size={15} />,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    settings: [
      { key: 'lead_scoring_enabled', label: 'Lead Scoring', description: 'Automatically score leads by budget, intent, and engagement level.', type: 'boolean' },
      { key: 'follow_up_enabled', label: 'Automated Follow-Ups', description: 'Send automated follow-up messages to unresponsive leads.', type: 'boolean' },
      { key: 'follow_up_delay_hours', label: 'Follow-Up Delay', description: 'Hours to wait before sending the first follow-up message.', type: 'number', min: 1, max: 168, suffix: 'hrs', dependsOn: 'follow_up_enabled', dependsOnValue: true },
      { key: 'follow_up_max_attempts', label: 'Max Follow-Up Attempts', description: 'Maximum number of follow-up messages before the lead is marked as cold.', type: 'number', min: 1, max: 10, suffix: 'attempts', dependsOn: 'follow_up_enabled', dependsOnValue: true },
      { key: 'duplicate_detection', label: 'Duplicate Detection', description: 'How the system identifies and merges duplicate leads.', type: 'select', options: [{ value: 'off', label: 'Off' }, { value: 'phone', label: 'By phone number' }, { value: 'phone_and_name', label: 'Phone + name match' }] },
      { key: 'min_budget_threshold', label: 'Minimum Budget Threshold', description: 'Leads below this USD amount are flagged as low-priority.', type: 'number', min: 0, max: 10000000, suffix: 'USD' },
      { key: 'lead_source_tracking', label: 'Lead Source Tracking', description: 'Track which channel each lead originated from.', type: 'boolean' },
      { key: 'auto_tag_leads', label: 'Auto-Tag Leads', description: 'Automatically apply tags based on lead behavior and expressed preferences.', type: 'boolean' },
      { key: 'lead_notes_enabled', label: 'Lead Notes', description: 'Allow agents to add freeform notes to lead profiles.', type: 'boolean' },
    ],
  },
]

// ─── Sub-Components ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-[22px] w-10 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  )
}

function NumberStepper({ value, onChange, min = 0, max = 9999, step = 1, suffix, disabled }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string; disabled?: boolean
}) {
  const dec = () => onChange(Math.max(min, value - step))
  const inc = () => onChange(Math.min(max, value + step))
  return (
    <div className={`flex items-center gap-2 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
        <button type="button" onClick={dec} className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-200">
          <ChevronDown size={14} />
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
          className="w-16 text-center text-sm font-medium text-slate-900 py-1.5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
        />
        <button type="button" onClick={inc} className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 transition-colors border-l border-slate-200">
          <ChevronUp size={14} />
        </button>
      </div>
      {suffix && <span className="text-xs text-slate-400 font-medium">{suffix}</span>}
    </div>
  )
}

function SelectControl({ value, onChange, options, disabled }: {
  value: string; onChange: (v: string) => void; options: SelectOption[]; disabled?: boolean
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300'}`}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function TextControl({ value, onChange, placeholder, disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    />
  )
}

function TimeControl({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled?: boolean
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    />
  )
}

function MultiSelectChips({ value, onChange, chipOptions, allowCustom, disabled }: {
  value: string[]; onChange: (v: string[]) => void; chipOptions: SelectOption[]; allowCustom?: boolean; disabled?: boolean
}) {
  const [customInput, setCustomInput] = useState('')

  const toggle = (chip: string) => {
    if (value.includes(chip)) onChange(value.filter(v => v !== chip))
    else onChange([...value, chip])
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setCustomInput('')
    }
  }

  const removeCustom = (chip: string) => onChange(value.filter(v => v !== chip))

  const predefined = chipOptions.map(o => o.value)
  const customChips = value.filter(v => !predefined.includes(v))

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      {chipOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chipOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                value.includes(opt.value)
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      {customChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customChips.map(chip => (
            <span key={chip} className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {chip}
              <button type="button" onClick={() => removeCustom(chip)} className="hover:text-amber-900 transition-colors"><X size={11} /></button>
            </span>
          ))}
        </div>
      )}
      {(allowCustom || chipOptions.length === 0) && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder="Type and press Enter to add..."
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
          />
          <button
            type="button"
            onClick={addCustom}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 bg-brand-50 text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      )}
    </div>
  )
}

function OrderControl({ value, onChange, options }: {
  value: string[]; onChange: (v: string[]) => void; options: SelectOption[]
}) {
  const labelMap = Object.fromEntries(options.map(o => [o.value, o.label]))

  const move = (index: number, dir: -1 | 1) => {
    const next = [...value]
    const swap = index + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-1.5">
      {value.map((item, i) => (
        <div key={item} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-400">{i + 1}</span>
          <span className="flex-1 text-sm font-medium text-slate-700">{labelMap[item] ?? item}</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronUp size={14} />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── AI Preview Bubble ─────────────────────────────────────────────────────────

function PreviewBubble({ text }: { text: string }) {
  return (
    <div className="mt-2 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-500 italic flex items-start gap-2">
      <MessageSquare size={14} className="mt-0.5 shrink-0 text-slate-400" />
      <span>{text}</span>
    </div>
  )
}

function getPreviewText(key: string, value: SettingValue): string | null {
  switch (key) {
    case 'zero_match_behavior':
      if (value === 'show_alternatives') return 'Here are some close options in nearby areas that might interest you.'
      if (value === 'escalate_to_agent') return 'Let me connect you with one of our agents who can help find exactly what you need.'
      if (value === 'apologize_and_ask_again') return 'I could not find an exact match. Can we adjust what you are looking for?'
      return null

    case 'bot_identity_response':
      if (typeof value === 'string' && value.trim()) return value.trim()
      return null

    case 'returning_lead_behavior':
      if (value === 'resume') return 'Welcome back! Last time we were looking at 3-bedroom apartments in Metn. Shall we continue?'
      if (value === 'fresh_start') return 'Hi! Looking for a property in Lebanon? I am here to help!'
      if (value === 'check_in') return 'Welcome back! Where were we?'
      return null

    case 'off_topic_handling':
      if (value === 'redirect') return 'I specialize in helping you find properties. Are you looking to buy or rent?'
      if (value === 'answer_briefly') return 'Got it! Now, back to finding you the perfect home...'
      if (value === 'ignore') return 'How many bedrooms are you looking for?'
      return null

    case 'greeting_behavior':
      if (value === 'formal') return 'Good day, and welcome. I am here to help you find the right property in Lebanon.'
      if (value === 'casual') return 'Hey! Looking for a place? I can help you find it fast.'
      if (value === 'name_based') return 'Hi Sarah! Great to have you here. Ready to find your perfect home?'
      return null

    case 'off_hours_behavior':
      if (value === 'collect_lead') return 'Thanks for reaching out! Our team will get back to you first thing tomorrow.'
      if (value === 'reply_later') return 'Our agents are offline right now. They will reply to you in the morning.'
      if (value === 'forward_number') return 'For urgent requests, you can reach us directly at our emergency line.'
      return null

    case 'budget_ask_count': {
      const n = value as number
      if (n === 1) return '"What is your budget?" > no response > moves on.'
      if (n === 2) return '"What is your budget?" > "Can you give me a rough range?" > moves on.'
      if (n >= 3) return `"What is your budget?" > "Can you give me a rough range?" > "Any ballpark works!" > moves on.`
      return null
    }

    case 'furnished_ask_count': {
      const n = value as number
      if (n === 1) return '"Are you looking for a furnished or unfurnished apartment?" > moves on.'
      if (n === 2) return '"Furnished or unfurnished?" > "Any preference at all?" > moves on.'
      if (n >= 3) return '"Furnished or unfurnished?" > "Any preference at all?" > "Either is fine, just let me know!" > moves on.'
      return null
    }

    case 'name_collection_timing':
      if (value === 'start') return 'Before we start, what is your name?'
      if (value === 'after_interest') return '[After showing interest] By the way, what is your name so I can help you better?'
      if (value === 'before_handoff') return '[Before agent handoff] May I get your name so the agent can reach out?'
      return null

    case 'handoff_message':
      if (typeof value === 'string' && value.trim()) return value.trim()
      return null

    case 'tour_booking_method':
      if (value === 'whatsapp') return 'Let me connect you with an agent to schedule a visit.'
      if (value === 'google_calendar') return 'I can book a visit for you. What day works best?'
      if (value === 'manual') return 'Our team will reach out to arrange a visit time that works for you.'
      return null

    case 'address_sharing_policy':
      if (value === 'full') return 'The agent will share the exact address with you.'
      if (value === 'area_only') return 'This property is located in Achrafieh, Beirut.'
      if (value === 'on_request') return 'The address will be shared once you confirm the visit.'
      return null

    case 'photo_response_wording':
      if (typeof value === 'string' && value.trim()) return value.trim()
      return null

    case 'currency_display':
      if (value === 'usd') return '$250,000'
      if (value === 'lbp') return '22,375,000,000 LBP'
      if (value === 'both') return '$250,000 (22.4B LBP)'
      return null

    case 'price_display_format':
      if (value === 'exact') return '$250,000'
      if (value === 'range') return '$220,000 - $280,000'
      if (value === 'on_request') return 'Price available on request.'
      return null

    case 'listing_sort_order':
      if (value === 'relevance') return 'Best match listings shown first based on your criteria.'
      if (value === 'price_asc') return 'Listings shown from lowest to highest price.'
      if (value === 'price_desc') return 'Listings shown from highest to lowest price.'
      if (value === 'newest') return 'Most recently added listings shown first.'
      return null

    case 'tone_style':
      if (value === 'professional') return 'I have identified two properties matching your criteria in Achrafieh.'
      if (value === 'casual') return 'Found 2 spots in Achrafieh that match what you are looking for.'
      if (value === 'friendly') return 'Hey! Got 2 great options in Achrafieh for you.'
      return null

    case 'formality_level':
      if (value === 'formal') return 'We would be pleased to arrange a viewing at your earliest convenience.'
      if (value === 'semi_formal') return 'I can set up a viewing for you. What day works best?'
      if (value === 'casual') return 'Want to check it out? Pick a day and we will sort it!'
      return null

    case 'competitor_mention_handling':
      if (value === 'redirect') return 'We have similar options that might work even better for you.'
      if (value === 'acknowledge') return 'They are a great agency. We also have some options you might like.'
      if (value === 'ignore') return 'How many bedrooms are you looking for?'
      return null

    case 'price_negotiation_handling':
      if (value === 'defer_to_agent') return 'For pricing discussions, let me connect you with our team.'
      if (value === 'indicate_fixed') return 'The listed price is set by the owner.'
      if (value === 'flexible') return 'There may be some flexibility on price. Let me check with the owner.'
      return null

    case 'company_tagline':
      if (typeof value === 'string' && value.trim()) return `Hi! I am Wakeeli Assistant. ${value.trim()}`
      return null

    case 'bot_display_name':
      if (typeof value === 'string' && value.trim()) return `Hi! I am ${value.trim()}, your real estate assistant. How can I help you today?`
      return null

    case 'follow_up_delay_hours': {
      const hrs = value as number
      return `After ${hrs} hrs of no response: "Hi! Just checking in. Still interested in properties in Achrafieh?"`
    }

    default:
      return null
  }
}

// ─── Setting Row ───────────────────────────────────────────────────────────────

function SettingRow({ def, value, onChange, parentDisabled }: {
  def: SettingDef
  value: SettingValue
  onChange: (key: string, v: SettingValue) => void
  parentDisabled: boolean
}) {
  const isBoolean = def.type === 'boolean'
  const dimmed = parentDisabled
  const preview = getPreviewText(def.key, value)

  if (isBoolean) {
    return (
      <div className={`flex items-center justify-between gap-4 py-3.5 border-b border-slate-50 last:border-0 transition-opacity ${dimmed ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900">{def.label}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{def.description}</p>
        </div>
        <Toggle checked={value as boolean} onChange={v => onChange(def.key, v)} />
      </div>
    )
  }

  return (
    <div className={`py-3.5 border-b border-slate-50 last:border-0 transition-opacity ${dimmed ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="mb-2.5">
        <p className="text-sm font-medium text-slate-900">{def.label}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{def.description}</p>
      </div>
      {def.type === 'select' && (
        <SelectControl value={value as string} onChange={v => onChange(def.key, v)} options={def.options ?? []} />
      )}
      {def.type === 'number' && (
        <NumberStepper value={value as number} onChange={v => onChange(def.key, v)} min={def.min} max={def.max} step={def.step} suffix={def.suffix} />
      )}
      {def.type === 'text' && (
        <TextControl value={value as string} onChange={v => onChange(def.key, v)} placeholder={def.placeholder} />
      )}
      {def.type === 'time' && (
        <TimeControl value={value as string} onChange={v => onChange(def.key, v)} />
      )}
      {def.type === 'multi-select' && (
        <MultiSelectChips
          value={value as string[]}
          onChange={v => onChange(def.key, v)}
          chipOptions={def.chipOptions ?? []}
          allowCustom={def.chipOptions?.length === 0}
        />
      )}
      {def.type === 'order' && (
        <OrderControl value={value as string[]} onChange={v => onChange(def.key, v)} options={def.options ?? []} />
      )}
      {preview && <PreviewBubble text={preview} />}
    </div>
  )
}

// ─── Scroll Helpers ────────────────────────────────────────────────────────────

function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  if (!node) return null
  const { overflow, overflowY, overflowX } = getComputedStyle(node)
  if (/auto|scroll/.test(overflow + overflowY + overflowX)) return node
  return getScrollParent(node.parentElement)
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ChatbotSettings({ companyId: _companyId, companyName, settings: externalSettings }: ChatbotSettingsProps) {
  const initial = useMemo(() => ({ ...DEFAULTS, ...externalSettings }), [externalSettings])

  const [values, setValues] = useState<Record<string, SettingValue>>(initial)
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)
  const [searchQuery, setSearchQuery] = useState('')
  const [saved, setSaved] = useState(false)

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isScrollingRef = useRef(false)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isDirty = useMemo(() => {
    return Object.keys(initial).some(key => {
      const a = initial[key]
      const b = values[key]
      if (Array.isArray(a) && Array.isArray(b)) return JSON.stringify(a) !== JSON.stringify(b)
      return a !== b
    })
  }, [initial, values])

  const updateValue = useCallback((key: string, v: SettingValue) => {
    setValues(prev => ({ ...prev, [key]: v }))
    setSaved(false)
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleDiscard = () => {
    setValues(initial)
    setSaved(false)
  }

  const scrollToCategory = (id: string) => {
    // Block scroll spy while programmatic scroll runs
    isScrollingRef.current = true
    setActiveCategory(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    scrollTimerRef.current = setTimeout(() => { isScrollingRef.current = false }, 850)
  }

  // Scroll spy: find the real scrollable container and track active category
  useEffect(() => {
    if (searchQuery) return

    // Locate the actual overflow container (the <main> element in AppLayout)
    const firstEl = Object.values(sectionRefs.current).find(Boolean) as HTMLElement | null
    const container = getScrollParent(firstEl?.parentElement ?? null)

    const update = () => {
      if (isScrollingRef.current) return
      // Use top 25% of the container viewport as the trigger line
      const containerTop = container ? container.getBoundingClientRect().top : 0
      const threshold = containerTop + window.innerHeight * 0.25
      let active = CATEGORIES[0].id
      for (const cat of CATEGORIES) {
        const el = sectionRefs.current[cat.id]
        if (!el) continue
        const { top } = el.getBoundingClientRect()
        if (top <= threshold) active = cat.id
      }
      setActiveCategory(active)
    }

    const target: HTMLElement | Window = container ?? window
    target.addEventListener('scroll', update, { passive: true })
    // Sync once immediately in case user is mid-page on mount
    update()

    return () => {
      target.removeEventListener('scroll', update)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    }
  }, [searchQuery])

  // Filter categories/settings by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIES
    const q = searchQuery.toLowerCase()
    return CATEGORIES
      .map(cat => ({
        ...cat,
        settings: cat.settings.filter(
          s => s.label.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.settings.length > 0)
  }, [searchQuery])

  const totalSettings = CATEGORIES.reduce((sum, cat) => sum + cat.settings.length, 0)
  const visibleSettings = filteredCategories.reduce((sum, cat) => sum + cat.settings.length, 0)

  return (
    <div className="relative">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">AI Chatbot Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">{companyName} &middot; {totalSettings} settings across {CATEGORIES.length} categories</p>
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          {searchQuery && (
            <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">
              {visibleSettings} of {totalSettings} settings
            </span>
          )}
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="flex gap-5 items-start">

        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 sticky top-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 space-y-0.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 pt-1.5 pb-1">Categories</p>
            {CATEGORIES.map(cat => {
              const matchCount = searchQuery
                ? filteredCategories.find(c => c.id === cat.id)?.settings.length ?? 0
                : cat.settings.length
              const hasMatch = !searchQuery || matchCount > 0
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  disabled={!hasMatch}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                    !hasMatch
                      ? 'opacity-30 cursor-not-allowed'
                      : activeCategory === cat.id && !searchQuery
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 ${cat.bg} ${cat.color}`}>
                    {cat.icon}
                  </span>
                  <span className="text-xs font-medium leading-tight flex-1">{cat.label}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    searchQuery && matchCount > 0 ? 'bg-brand-100 text-brand-600' : 'text-slate-400'
                  }`}>
                    {searchQuery ? matchCount : cat.settings.length}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-5 pb-24">
          {filteredCategories.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Search size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-900">No settings found</p>
              <p className="text-xs text-slate-500 mt-1">Try a different search term.</p>
            </div>
          )}

          {filteredCategories.map(cat => (
            <div
              key={cat.id}
              id={`section-${cat.id}`}
              ref={el => { sectionRefs.current[cat.id] = el }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              {/* Category header */}
              <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${cat.bg} ${cat.color} flex-shrink-0`}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{cat.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                  </div>
                  <span className="ml-auto text-xs font-medium text-slate-400">{cat.settings.length} settings</span>
                </div>
              </div>

              {/* Settings list */}
              <div className="px-6">
                {cat.settings.map(def => {
                  const parentDisabled = def.dependsOn !== undefined
                    ? (values[def.dependsOn] as boolean) !== def.dependsOnValue
                    : false

                  // Special case: custom_questions uses free-text multi-select
                  const isCustomQ = def.key === 'custom_questions'

                  return (
                    <SettingRow
                      key={def.key}
                      def={isCustomQ ? { ...def, chipOptions: [] } : def}
                      value={values[def.key] ?? DEFAULTS[def.key]}
                      onChange={updateValue}
                      parentDisabled={parentDisabled}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating save bar */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isDirty || saved ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border transition-colors ${
          saved ? 'bg-green-600 border-green-700' : 'bg-slate-900 border-slate-700'
        }`}>
          {saved ? (
            <>
              <Check size={15} className="text-white" />
              <span className="text-sm font-medium text-white">Changes saved</span>
            </>
          ) : (
            <>
              <AlertCircle size={15} className="text-amber-400" />
              <span className="text-sm font-medium text-white">Unsaved changes</span>
              <div className="w-px h-4 bg-slate-600" />
              <button
                onClick={handleDiscard}
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 bg-white px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Save size={13} />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
