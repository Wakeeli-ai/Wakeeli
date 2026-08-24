import { useState } from 'react';
import { BookOpen, Edit2, Save, X, ChevronRight } from 'lucide-react';

type Language = 'en' | 'ar';
type SectionKey = 'qualifying' | 'objections' | 'closing' | 'negotiation' | 'tour';

const SECTION_LABELS: Record<SectionKey, { en: string; ar: string }> = {
  qualifying: { en: 'Qualifying Questions', ar: 'أسئلة التأهيل' },
  objections: { en: 'Objection Handling', ar: 'التعامل مع الاعتراضات' },
  closing: { en: 'Closing Techniques', ar: 'تقنيات الإغلاق' },
  negotiation: { en: 'Negotiation Guidelines', ar: 'إرشادات التفاوض' },
  tour: { en: 'Property Tour Checklist', ar: 'قائمة التحقق للجولة' },
};

const SECTION_ORDER: SectionKey[] = ['qualifying', 'objections', 'closing', 'negotiation', 'tour'];

const CONTENT: Record<SectionKey, { en: string; ar: string }> = {
  qualifying: {
    en: `**Core Questions to Ask Every Lead**

1. What is your main reason for buying/renting right now?
2. What is your timeline? Are you looking to move within 1 month, 3 months, or longer?
3. What is your total budget (including fees and transfer costs)?
4. Which areas/districts are you targeting? Any areas you would never consider?
5. How many bedrooms do you need? Any specific floor requirements?
6. Is parking a must-have or nice-to-have?
7. Generator and water tank: mandatory for Lebanese market. Confirm building status.
8. Do you have dependents or pets? (impacts property type)
9. Are you paying cash or via bank loan? (affects timeline and negotiation)
10. Have you already viewed other properties? What did you like or dislike?

**Red Flags**
- Refuses to give a budget range
- Unclear on timeline (could be browsing only)
- Multiple agents working in parallel (low intent)

**Green Flags**
- Specific requirements and clear timeline
- Pre-approved for bank loan or has cash ready
- Has viewed 2-3 properties and knows what they want`,

    ar: `**الأسئلة الأساسية لكل عميل محتمل**

1. ما هو السبب الرئيسي لرغبتك في الشراء أو الإيجار الآن؟
2. ما هو إطارك الزمني؟ هل تبحث عن الانتقال خلال شهر أو 3 أشهر أو أكثر؟
3. ما هو إجمالي ميزانيتك (بما يشمل الرسوم وتكاليف النقل)؟
4. ما هي المناطق التي تستهدفها؟ هل هناك مناطق لن تفكر فيها أبداً؟
5. كم عدد غرف النوم التي تحتاجها؟ هل لديك تفضيل لطابق معين؟
6. هل الموقف ضرورة أم مجرد ميزة إضافية؟
7. المولد وخزان المياه: إلزامي في السوق اللبناني. تحقق من وضع المبنى.
8. هل لديك معالون أو حيوانات أليفة؟ (يؤثر على نوع العقار)
9. هل الدفع نقداً أم عبر قرض مصرفي؟ (يؤثر على الجدول الزمني والتفاوض)
10. هل شاهدت عقارات أخرى من قبل؟ ماذا أعجبك أو لم يعجبك؟

**علامات تحذيرية**
- يرفض تحديد نطاق الميزانية
- غير واضح بشأن الجدول الزمني (قد يكون مجرد تصفح)
- وكلاء متعددون يعملون بالتوازي (نية منخفضة)

**علامات إيجابية**
- متطلبات محددة وجدول زمني واضح
- حصل على موافقة مسبقة من البنك أو لديه نقد جاهز
- شاهد 2-3 عقارات ويعرف ما يريد`,
  },

  objections: {
    en: `**Common Lebanese Market Objections**

**"The price is too high"**
Script: "I understand. Let's look at what similar units in this area sold for in the last 3 months. [Show comparables]. The owner has some flexibility on price. What range would you be comfortable with?"

**"I need to think about it"**
Script: "Of course. Just so you have the full picture: this building has a generator, water tank, and 24/7 concierge. Properties at this price point in [Area] tend to move fast. Can I ask what specifically you need to think about? Maybe I can help answer that now."

**"The dollar rate is unstable, I am not sure it is the right time"**
Script: "Real estate in Lebanon has historically been one of the safest hedges against currency fluctuations. Many buyers are actually accelerating their purchase decisions for exactly that reason. USD-priced properties hold their value better than cash in most local banks."

**"I want to wait and see if prices drop"**
Script: "That is a valid concern. The reality in the Lebanese market is that quality properties in prime areas rarely drop significantly. Sellers are already pricing in future uncertainty. What I can do is help you find a property where the owner has more negotiating room."

**"I can find the same thing cheaper directly from the owner"**
Script: "You can certainly try. What we add is legal due diligence, title verification, and protection throughout the transaction. Many direct deals have hidden issues that cost buyers more in the long run. We work on success fee only, so you pay nothing unless we close."

**"The building is too old"**
Script: "Older buildings in Achrafieh, Verdun, or Hamra often have better construction quality, larger room sizes, and unique architectural character. Plus the land value alone justifies it. Let's compare the price per sqm to newer buildings on the same street."`,

    ar: `**الاعتراضات الشائعة في السوق اللبناني**

**"السعر مرتفع جداً"**
السيناريو: "أفهم ذلك. دعنا ننظر إلى ما بيعت به الوحدات المماثلة في هذه المنطقة خلال الأشهر الثلاثة الماضية. [اعرض المقارنات]. لدى المالك بعض المرونة في السعر. ما النطاق الذي تشعر بالارتياح معه؟"

**"أحتاج إلى التفكير"**
السيناريو: "بالطبع. فقط لإعطائك الصورة الكاملة: هذا المبنى يحتوي على مولد وخزان مياه وبواب على مدار الساعة. العقارات بهذا السعر في [المنطقة] تميل إلى البيع بسرعة. هل يمكنني أن أسألك ما الذي تحتاج تحديداً إلى التفكير فيه؟"

**"سعر الدولار غير مستقر، لست متأكداً من أن الوقت مناسب"**
السيناريو: "العقارات في لبنان كانت تاريخياً من أكثر الاستثمارات أماناً في مواجهة تقلبات العملة. العقارات المسعّرة بالدولار تحتفظ بقيمتها أفضل من النقد في معظم البنوك المحلية."

**"أريد الانتظار لرؤية ما إذا كانت الأسعار ستنخفض"**
السيناريو: "هذا قلق مشروع. الواقع في السوق اللبناني أن العقارات الجيدة في المناطق الرئيسية نادراً ما تنخفض بشكل ملحوظ. ما يمكنني فعله هو مساعدتك في إيجاد عقار يتمتع فيه المالك بمرونة أكبر في التفاوض."

**"يمكنني إيجاد نفس الشيء بسعر أرخص مباشرة من المالك"**
السيناريو: "يمكنك بالتأكيد المحاولة. ما نضيفه هو العناية القانونية الواجبة والتحقق من الملكية والحماية طوال المعاملة. نعمل بعمولة نجاح فقط، لذلك لا تدفع شيئاً ما لم ننجح."`,
  },

  closing: {
    en: `**Closing Techniques for Lebanese Real Estate**

**The Summary Close**
After the tour: "Based on everything you've told me, this property checks all your boxes: [list their requirements]. The price is [X] which falls within your budget. What would it take for you to move forward today?"

**The Urgency Close (use sparingly and honestly)**
"I have two other families viewing this property tomorrow. I cannot hold it without a good faith gesture. If this is really what you want, let's talk about next steps."

**The Trial Close**
During the tour, ask small yes questions:
- "Would you be happy with this kitchen layout?"
- "Is this view what you had in mind?"
- "Could you see yourself living here?"
Each yes builds commitment.

**The Alternative Close**
"Are you thinking about the 3BR on the 4th floor or the 2BR on the 7th with the sea view?"
Both options lead to a commitment.

**The Assumptive Close**
"Let's go ahead and schedule the notary for next week. Are Tuesdays or Thursdays better for you?"

**The Reverse Close (for hesitant buyers)**
"If everything checks out with the title and building status, is there any other reason you would not move forward?"

**Lebanese-Specific Notes**
- Family approval often matters. Offer a second viewing with the full family.
- Word of mouth factor: "This seller is well known in the community and deals with integrity."
- Ramadan and August slowdowns are real. Create urgency before these periods.`,

    ar: `**تقنيات إغلاق الصفقات في العقارات اللبنانية**

**إغلاق الملخص**
بعد الجولة: "بناءً على كل ما أخبرتني به، هذا العقار يلبي جميع متطلباتك. السعر هو [X] والذي يقع ضمن ميزانيتك. ما الذي يلزم لتتقدم اليوم؟"

**إغلاق الإلحاح (استخدمه بحذر وبصدق)**
"لدي عائلتان أخريان ستريان هذا العقار غداً. لا يمكنني الاحتفاظ به دون إيماءة حسن نية. دعنا نتحدث عن الخطوات التالية."

**إغلاق الاختبار**
خلال الجولة، اطرح أسئلة صغيرة بنعم:
- "هل ستكون راضياً عن هذا التصميم للمطبخ؟"
- "هل هذا المنظر ما كنت تتخيله؟"
- "هل يمكنك أن تتخيل نفسك تعيش هنا؟"
كل نعم يبني الالتزام.

**إغلاق البديل**
"هل تفكر في الشقة ذات 3 غرف في الطابق الرابع أم الشقة ذات الغرفتين في الطابع السابع مع إطلالة بحرية؟"
كلا الخيارين يؤديان إلى التزام.

**إغلاق الافتراض**
"دعنا نحدد موعد الموثق للأسبوع القادم. هل الثلاثاء أو الخميس أنسب لك؟"

**ملاحظات خاصة بالسوق اللبناني**
- موافقة العائلة غالباً مهمة. اعرض جولة ثانية مع كامل العائلة.
- عامل التوصيات الشفهية مهم جداً في المجتمع اللبناني.
- تباطؤ رمضان وشهر أغسطس حقيقي. أنشئ إلحاحاً قبل هذه الفترات.`,
  },

  negotiation: {
    en: `**Negotiation Guidelines**

**Before You Start**
- Know the seller's bottom line (ask your manager or broker)
- Know the buyer's maximum (already done in qualifying)
- Understand the seller's motivations: urgent sale? Empty unit costs? Emigrating?
- Research comparable transactions in the last 6 months in that building or street

**Opening Position**
- First offer should be 5-10% below asking in a normal market
- In a buyer's market, 15-20% below asking is acceptable
- Always frame the offer respectfully: "My client is serious and cash-ready. They would like to start at [X]"
- Never lowball to the point of insulting the seller

**Negotiation Levers (beyond price)**
- Closing timeline: fast close is valuable to sellers
- Down payment percentage: higher deposit means more security for seller
- What stays in the property: furniture, appliances, AC units
- Fee splitting: who pays notary, transfer fees, municipality fees
- Occupancy date: flexibility can be worth $5,000-$10,000

**Protecting the Deal**
- If both sides are $5k apart, suggest they split the difference
- "I can get the seller to [X] if you can come up to [Y]"
- Get verbal commitments before going back to either side
- Document every agreed point via WhatsApp for a clear trail

**Lebanese-Specific Considerations**
- Prices almost always quoted in USD. Confirm exact exchange rate for any LBP components.
- Mortgage approval from BLOM, BankMed, or Fransabank can take 3-6 weeks. Factor in timeline.
- Post-revolution, some sellers prefer staggered payments. Clarify payment structure upfront.
- Always verify clear title and no encumbrances before starting negotiation seriously.`,

    ar: `**إرشادات التفاوض**

**قبل البدء**
- اعرف الحد الأدنى للبائع (اسأل مديرك أو الوسيط)
- اعرف الحد الأقصى للمشتري (تم بالفعل في التأهيل)
- افهم دوافع البائع: بيع عاجل؟ تكاليف الوحدة الفارغة؟ مهاجر؟
- ابحث في المعاملات المماثلة خلال الأشهر الستة الماضية في نفس المبنى أو الشارع

**موقف الافتتاح**
- يجب أن يكون العرض الأول أقل بـ 5-10% من السعر المطلوب في السوق العادية
- في سوق المشترين، يُقبل 15-20% أقل من السعر المطلوب
- احرص دائماً على صياغة العرض باحترام: "عميلي جاد ولديه نقد جاهز"
- لا تقدم عرضاً منخفضاً جداً لدرجة إهانة البائع

**الروافع التفاوضية (بعيداً عن السعر)**
- الجدول الزمني للإغلاق: الإغلاق السريع له قيمة لدى البائعين
- نسبة الدفعة المقدمة: الوديعة الأعلى تعني أمان أكبر للبائع
- ما يبقى في العقار: الأثاث والأجهزة ووحدات التكييف
- تقسيم الرسوم: من يدفع الموثق ورسوم النقل والبلدية
- تاريخ الإشغال: المرونة يمكن أن تساوي 5,000-10,000 دولار

**حماية الصفقة**
- إذا كان كلا الطرفين يفصل بينهما 5 آلاف دولار، اقترح تقسيم الفرق
- وثّق كل نقطة متفق عليها عبر واتساب للحصول على مسار واضح
- تحقق دائماً من صحة العنوان وغياب الأعباء قبل بدء التفاوض بجدية`,
  },

  tour: {
    en: `**Property Tour Checklist**

**Before the Tour (24h before)**
- Confirm appointment time with lead via WhatsApp
- Send property address and Google Maps pin
- Brief the lead: "We'll spend about 45 minutes. Ask anything you want."
- Confirm parking availability for lead

**Arrival**
- Arrive 10 minutes early
- Make sure the property is well-lit and ventilated
- Have the property listing ready on your phone
- Note any issues to address proactively

**During the Tour**

Structural:
- Check all windows open and close properly
- Check water pressure (run kitchen and bathroom taps simultaneously)
- Test all light switches
- Check for visible dampness, cracks, or water stains
- Verify generator connection and solar panels if listed

Building:
- Show common areas: lobby, elevator, rooftop, parking
- Introduce to concierge if present
- Check building entrance security
- Mention building management company name

Neighborhood:
- Point out nearest supermarket, pharmacy, school, and highway access
- Note any nearby construction that could impact the view

**Closing the Tour**
- Ask: "What did you like most? Is there anything that concerns you?"
- Address any objections on the spot
- Have next steps ready: "If you are interested, I can schedule a second viewing with your family"
- Follow up within 2 hours via WhatsApp

**Documentation**
- Take notes on their feedback immediately after the tour
- Log the tour outcome in the CRM`,

    ar: `**قائمة التحقق لجولة العقار**

**قبل الجولة (قبل 24 ساعة)**
- تأكيد موعد اللقاء مع العميل عبر واتساب
- إرسال عنوان العقار وموقع Google Maps
- إعطاء العميل نبذة مختصرة: "سنقضي حوالي 45 دقيقة. اسأل عن أي شيء تريده."
- تأكيد توفر موقف سيارات للعميل

**عند الوصول**
- كن هناك قبل 10 دقائق من الموعد
- تأكد من إضاءة العقار وتهويته جيداً
- جهّز قائمة العقار الرقمية على هاتفك
- لاحظ أي مشاكل لمعالجتها بشكل استباقي

**خلال الجولة**

الهيكل:
- تحقق من فتح وإغلاق جميع النوافذ بشكل صحيح
- تحقق من ضغط المياه (افتح صنابير المطبخ والحمام معاً)
- اختبر جميع مفاتيح الإضاءة
- تحقق من وجود أي رطوبة أو شقوق أو بقع مياه مرئية
- تحقق من توصيل المولد والطاقة الشمسية إن كانت مدرجة

المبنى:
- أظهر المناطق المشتركة: المدخل، المصعد، السطح، الموقف
- قدّم للبواب إن وُجد
- اذكر شركة إدارة المبنى

الحي:
- أشر إلى أقرب سوبرماركت وصيدلية ومدرسة وطريق سريع
- لاحظ أي بناء قريب قد يؤثر على المنظر مستقبلاً

**إنهاء الجولة**
- اسأل: "ما الذي أعجبك أكثر؟ هل هناك شيء يقلقك؟"
- عالج أي اعتراضات في الحال
- كن مستعداً للخطوات التالية: "إذا كنت مهتماً، يمكنني ترتيب جولة ثانية مع عائلتك"
- تابع خلال ساعتين عبر واتساب`,
  },
};

type EditState = Partial<Record<SectionKey, { en: string; ar: string }>>;

function renderContent(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={i} className="font-bold text-slate-900 text-sm mt-5 first:mt-0">
          {line.slice(2, -2)}
        </p>
      );
    }
    if (/^\d+\./.test(line)) {
      return (
        <p key={i} className="text-sm text-slate-700 pl-4 mt-1.5 leading-relaxed">
          {line}
        </p>
      );
    }
    if (line.startsWith('- ')) {
      return (
        <div key={i} className="flex items-start gap-2 mt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-[7px]" />
          <p className="text-sm text-slate-700 leading-relaxed">{line.slice(2)}</p>
        </div>
      );
    }
    if (line === '') {
      return <div key={i} className="h-1" />;
    }
    return (
      <p key={i} className="text-sm text-slate-700 mt-1.5 leading-relaxed">
        {line}
      </p>
    );
  });
}

export default function Playbook() {
  const [activeSection, setActiveSection] = useState<SectionKey>('qualifying');
  const [language, setLanguage] = useState<Language>('en');
  const [editMode, setEditMode] = useState(false);
  const [edits, setEdits] = useState<EditState>({});

  function getContent(section: SectionKey, lang: Language): string {
    return edits[section]?.[lang] ?? CONTENT[section][lang];
  }

  const currentText = getContent(activeSection, language);

  function handleSave() {
    setEditMode(false);
  }

  function handleDiscard() {
    setEdits((prev) => {
      const next = { ...prev };
      delete next[activeSection];
      return next;
    });
    setEditMode(false);
  }

  function handleEdit(value: string) {
    setEdits((prev) => ({
      ...prev,
      [activeSection]: {
        en: prev[activeSection]?.en ?? CONTENT[activeSection].en,
        ar: prev[activeSection]?.ar ?? CONTENT[activeSection].ar,
        [language]: value,
      },
    }));
  }

  const isEdited = (s: SectionKey) => Boolean(edits[s]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Agent Playbook</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Scripts, guides, and checklists for every stage of the sale
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                language === 'en' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                language === 'ar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              AR
            </button>
          </div>

          {editMode ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscard}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors min-h-[36px]"
              >
                <X size={12} />
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors min-h-[36px]"
              >
                <Save size={12} />
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors min-h-[36px]"
            >
              <Edit2 size={12} />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Mobile: horizontal scroll tabs */}
        <div className="md:hidden overflow-x-auto -mx-4 px-4">
          <div className="flex gap-1.5 pb-2 w-max">
            {SECTION_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
                  activeSection === key
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {language === 'en' ? SECTION_LABELS[key].en : SECTION_LABELS[key].ar}
                {isEdited(key) && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: vertical sidebar */}
        <div className="hidden md:block w-52 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {SECTION_ORDER.map((key, idx) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-between gap-2 ${
                  idx > 0 ? 'border-t border-slate-100' : ''
                } ${
                  activeSection === key
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">
                  {language === 'en' ? SECTION_LABELS[key].en : SECTION_LABELS[key].ar}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isEdited(key) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                  <ChevronRight
                    size={13}
                    className={activeSection === key ? 'text-brand-500' : 'text-slate-300'}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                <BookOpen size={15} className="text-brand-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm">
                  {language === 'en'
                    ? SECTION_LABELS[activeSection].en
                    : SECTION_LABELS[activeSection].ar}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'en' ? 'English version' : 'النسخة العربية'}
                  {isEdited(activeSection) && (
                    <span className="ml-2 text-amber-500 font-semibold">Edited</span>
                  )}
                </p>
              </div>
            </div>

            {/* Content */}
            <div
              className={`p-5 ${language === 'ar' ? 'text-right' : ''}`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {editMode ? (
                <textarea
                  value={currentText}
                  onChange={(e) => handleEdit(e.target.value)}
                  className="w-full min-h-[460px] text-sm font-mono text-slate-700 border border-slate-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y leading-relaxed"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
              ) : (
                <div className="space-y-0.5">
                  {renderContent(currentText)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
