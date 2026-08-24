import { useState, type ReactNode, type ElementType, type Dispatch, type SetStateAction } from 'react';
import {
  Building2,
  MessageSquare,
  Star,
  ShieldCheck,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

// Types

interface QAPair {
  id: number;
  q: string;
  a: string;
}

// Mock Data

const INITIAL_AGENCY_INFO = {
  name: 'Pro-Founders Real Estate',
  tagline: 'Your trusted partner in Lebanese property',
  about:
    'Pro-Founders is a leading Lebanese real estate agency specializing in residential and commercial properties across Beirut and Mount Lebanon. Founded in 2010, we have helped over 2,000 families find their dream homes.',
  phone: '+961 1 234 567',
  email: 'info@pro-founders.com',
  address: 'Verdun Street, Ras Beirut, Beirut',
  whatsapp: '+961 70 111 222',
};

const INITIAL_FAQS: QAPair[] = [
  {
    id: 1,
    q: 'Is the apartment furnished?',
    a: 'Most of our listings are unfurnished unless explicitly stated. We can connect you with trusted furnishing partners if needed.',
  },
  {
    id: 2,
    q: 'Do you have sea view apartments?',
    a: 'Yes, we have a selection of sea view properties in Raouche, Ramlet el Baida, and Kaslik. I can share those listings with you right now.',
  },
  {
    id: 3,
    q: 'Is parking included?',
    a: 'Parking availability varies by building. I will check the specific listing and confirm for you before we book a tour.',
  },
  {
    id: 4,
    q: 'Is the generator included?',
    a: 'Generator coverage is standard in most properties we list. Coverage hours range from 12 to 24 hours depending on the building. I will confirm for the specific property you are interested in.',
  },
  {
    id: 5,
    q: 'Are pets allowed?',
    a: 'Pet policies are set by building management and vary by property. We will verify this before you commit to a visit.',
  },
];

const INITIAL_HIGHLIGHTS: QAPair[] = [
  {
    id: 1,
    q: 'Prime Beirut locations',
    a: 'All our properties are in sought-after Beirut neighborhoods with easy access to highways and amenities.',
  },
  {
    id: 2,
    q: 'Verified listings only',
    a: 'Every listing is personally vetted by our agents. No fake listings, no inflated prices.',
  },
  {
    id: 3,
    q: 'Same-day tours available',
    a: 'We can arrange property tours same day or next day in most cases. Just pick a time and we confirm.',
  },
  {
    id: 4,
    q: '24/7 AI availability',
    a: 'Our AI assistant is available around the clock to answer questions, share listings, and book tours on your behalf.',
  },
];

const INITIAL_OBJECTIONS: QAPair[] = [
  {
    id: 1,
    q: 'The price is too high.',
    a: 'I understand. We have flexible options at different price points. Can I share a few alternatives that might fit your budget better? Our team can also advise on negotiation.',
  },
  {
    id: 2,
    q: 'I am not ready to commit yet.',
    a: 'That is completely fine. We can keep an eye on the market for you and alert you when the right property appears. No pressure at all.',
  },
  {
    id: 3,
    q: 'I saw a cheaper option elsewhere.',
    a: 'I would love to understand what you saw. Our listings include full transparency on fees, maintenance, and additional costs that may not be reflected in advertised prices elsewhere.',
  },
  {
    id: 4,
    q: 'I want to wait and see what happens with the market.',
    a: 'A valid approach. Based on current trends in Beirut, the Achrafieh and Verdun corridors are seeing steady demand. I can keep you updated on price movements so you can time your move well.',
  },
];

const INITIAL_PRICING: QAPair[] = [
  {
    id: 1,
    q: 'Agency commission (sale)',
    a: '2% of the sale price, split equally between buyer and seller agents.',
  },
  {
    id: 2,
    q: 'Agency commission (rent)',
    a: 'One month rent, paid by the tenant upon signing.',
  },
  {
    id: 3,
    q: 'Minimum budget (sale)',
    a: '$150,000 USD for studio and 1BR options in Jdeideh and Dbayeh.',
  },
  {
    id: 4,
    q: 'Minimum budget (rent)',
    a: '$600/month for studios in Hamra and Ras Beirut.',
  },
  {
    id: 5,
    q: 'Price range (luxury tier)',
    a: '$800,000 to $3,000,000+ for high-end properties in Achrafieh, Verdun, and Kaslik.',
  },
];

// Counter for new IDs
let nextId = 200;
function newId() {
  return ++nextId;
}

// Sub-components

function SectionCard({
  title,
  icon: Icon,
  open,
  onToggle,
  saved,
  onSave,
  children,
}: {
  title: string;
  icon: ElementType;
  open: boolean;
  onToggle: () => void;
  saved: boolean;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Icon size={15} className="text-brand-600" />
          </div>
          <span className="font-bold text-slate-900 text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {saved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCircle size={12} />
              Saved
            </span>
          )}
          {open
            ? <ChevronUp size={16} className="text-slate-400" />
            : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100">
          <div className="p-5 space-y-4">
            {children}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm"
              >
                <Save size={14} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QAEditor({
  pairs,
  onAdd,
  onRemove,
  onChange,
  questionLabel = 'Question',
  answerLabel = 'Answer',
}: {
  pairs: QAPair[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onChange: (id: number, field: 'q' | 'a', value: string) => void;
  questionLabel?: string;
  answerLabel?: string;
}) {
  return (
    <div className="space-y-3">
      {pairs.map((pair) => (
        <div
          key={pair.id}
          className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5"
        >
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                {questionLabel}
              </label>
              <input
                type="text"
                value={pair.q}
                onChange={(e) => onChange(pair.id, 'q', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
                placeholder={`Enter ${questionLabel.toLowerCase()}...`}
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(pair.id)}
              className="mt-6 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              aria-label="Remove entry"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
              {answerLabel}
            </label>
            <textarea
              value={pair.a}
              onChange={(e) => onChange(pair.id, 'a', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none placeholder:text-slate-400"
              placeholder={`Enter ${answerLabel.toLowerCase()}...`}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:border-brand-400 hover:text-brand-600 hover:bg-blue-50/30 transition-all w-full justify-center"
      >
        <Plus size={15} />
        Add entry
      </button>
    </div>
  );
}

// Main Component

type SectionId = 'agency-info' | 'faqs' | 'highlights' | 'objections' | 'pricing';

export default function KnowledgeBase() {
  const [openSection, setOpenSection] = useState<SectionId | null>('agency-info');
  const [savedSections, setSavedSections] = useState<Partial<Record<SectionId, boolean>>>({});

  const [agencyInfo, setAgencyInfo] = useState(INITIAL_AGENCY_INFO);
  const [faqs, setFaqs] = useState<QAPair[]>(INITIAL_FAQS);
  const [highlights, setHighlights] = useState<QAPair[]>(INITIAL_HIGHLIGHTS);
  const [objections, setObjections] = useState<QAPair[]>(INITIAL_OBJECTIONS);
  const [pricing, setPricing] = useState<QAPair[]>(INITIAL_PRICING);

  function toggle(id: SectionId) {
    setOpenSection((prev) => (prev === id ? null : id));
  }

  function markSaved(id: SectionId) {
    setSavedSections((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setSavedSections((prev) => ({ ...prev, [id]: false })), 3000);
  }

  type PairSetter = Dispatch<SetStateAction<QAPair[]>>;

  function makePairHandlers(setter: PairSetter) {
    return {
      onAdd: () => setter((prev) => [...prev, { id: newId(), q: '', a: '' }]),
      onRemove: (id: number) => setter((prev) => prev.filter((p) => p.id !== id)),
      onChange: (id: number, field: 'q' | 'a', value: string) =>
        setter((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))),
    };
  }

  const faqHandlers       = makePairHandlers(setFaqs);
  const highlightHandlers = makePairHandlers(setHighlights);
  const objectionHandlers = makePairHandlers(setObjections);
  const pricingHandlers   = makePairHandlers(setPricing);

  const agencyFields: { label: string; key: keyof typeof agencyInfo; icon?: ElementType }[] = [
    { label: 'Agency Name', key: 'name',     icon: Building2 },
    { label: 'Tagline',     key: 'tagline'                   },
    { label: 'Phone',       key: 'phone',    icon: Phone      },
    { label: 'WhatsApp',    key: 'whatsapp', icon: Phone      },
    { label: 'Email',       key: 'email',    icon: Mail       },
    { label: 'Address',     key: 'address',  icon: MapPin     },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Knowledge Base</h1>
        <p className="text-slate-500 mt-0.5 text-sm">
          Train the AI on your agency's knowledge and response guidelines
        </p>
      </div>

      {/* Info banner */}
      <div
        className="rounded-xl p-4 flex items-start gap-3"
        style={{ background: 'linear-gradient(160deg, #0f1729 0%, #1e3a8a 100%)' }}
      >
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Building2 size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">AI Training Data</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Everything you add here is used by the AI to answer leads accurately. Keep it updated to
            reflect your current inventory and policies.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">

        {/* 1. Agency Info */}
        <SectionCard
          title="Agency Info"
          icon={Building2}
          open={openSection === 'agency-info'}
          onToggle={() => toggle('agency-info')}
          saved={!!savedSections['agency-info']}
          onSave={() => markSaved('agency-info')}
        >
          <p className="text-xs text-slate-500 -mt-1">
            Basic details the AI uses to introduce your agency and answer contact questions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agencyFields.map(({ label, key }) => (
              <div key={key}>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                  {label}
                </label>
                <input
                  type="text"
                  value={agencyInfo[key]}
                  onChange={(e) =>
                    setAgencyInfo((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
              About / Agency Description
            </label>
            <textarea
              value={agencyInfo.about}
              onChange={(e) => setAgencyInfo((prev) => ({ ...prev, about: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
        </SectionCard>

        {/* 2. Property FAQs */}
        <SectionCard
          title="Property FAQs"
          icon={MessageSquare}
          open={openSection === 'faqs'}
          onToggle={() => toggle('faqs')}
          saved={!!savedSections['faqs']}
          onSave={() => markSaved('faqs')}
        >
          <p className="text-xs text-slate-500 -mt-1">
            Common questions leads ask on WhatsApp and how the AI should respond. Add questions like
            "is parking included?" or "do you have sea view?".
          </p>
          <QAEditor
            pairs={faqs}
            {...faqHandlers}
            questionLabel="Lead Question"
            answerLabel="AI Response"
          />
        </SectionCard>

        {/* 3. Listing Highlights */}
        <SectionCard
          title="Listing Highlights"
          icon={Star}
          open={openSection === 'highlights'}
          onToggle={() => toggle('highlights')}
          saved={!!savedSections['highlights']}
          onSave={() => markSaved('highlights')}
        >
          <p className="text-xs text-slate-500 -mt-1">
            Key selling points the AI surfaces when introducing your agency to new leads.
          </p>
          <QAEditor
            pairs={highlights}
            {...highlightHandlers}
            questionLabel="Highlight Title"
            answerLabel="Description"
          />
        </SectionCard>

        {/* 4. Objection Handlers */}
        <SectionCard
          title="Objection Handlers"
          icon={ShieldCheck}
          open={openSection === 'objections'}
          onToggle={() => toggle('objections')}
          saved={!!savedSections['objections']}
          onSave={() => markSaved('objections')}
        >
          <p className="text-xs text-slate-500 -mt-1">
            Teach the AI how to handle common pushback and keep the conversation moving toward a
            tour booking.
          </p>
          <QAEditor
            pairs={objections}
            {...objectionHandlers}
            questionLabel="Objection"
            answerLabel="AI Counter"
          />
        </SectionCard>

        {/* 5. Pricing Guidelines */}
        <SectionCard
          title="Pricing Guidelines"
          icon={DollarSign}
          open={openSection === 'pricing'}
          onToggle={() => toggle('pricing')}
          saved={!!savedSections['pricing']}
          onSave={() => markSaved('pricing')}
        >
          <p className="text-xs text-slate-500 -mt-1">
            Commission structures, price ranges, and budget thresholds. Helps the AI qualify leads
            by budget accurately so agents only receive warm handoffs.
          </p>
          <QAEditor
            pairs={pricing}
            {...pricingHandlers}
            questionLabel="Pricing Item"
            answerLabel="Detail"
          />
        </SectionCard>

      </div>
    </div>
  );
}
