export interface Article {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: { name: string; slug: string };
  author: { name: string; avatar: string };
  date: string;
  content?: string;
  rawHtml?: string;
  useRawHtml?: boolean;
}

export const mockArticles: Article[] = [
  {
    id: 1,
    slug: 'pr-strategy-digital-transformation',
    title: 'استراتيجية العلاقات العامة في عصر التحول الرقمي',
    excerpt: 'كيف تبني حضوراً رقمياً قوياً يدعم سمعة مؤسستك ويعزز الثقة.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    category: { name: 'علاقات عامة', slug: 'pr' },
    author: {
      name: 'فريق تحرير وجه',
      avatar: 'https://ui-avatars.com/api/?name=Wajh&background=1A2744&color=fff'
    },
    date: '21 يونيو 2026',
    content: 'في عصر الاتصال الفائق والتحول الرقمي المتسارع، لم تعد العلاقات العامة تقتصر على كتابة البيانات الصحفية التقليدية وإرسالها لوسائل الإعلام. اليوم، تدور العلاقات العامة حول بناء حوار تفاعلي مستمر مع الجمهور عبر قنوات اتصالية متعددة. تحتاج المؤسسات إلى تطوير استراتيجيات مرنة تعتمد على البيانات، وتفهم طبيعة سلوك الجمهور الرقمي، وتستغل أدوات النشر المبتكرة لتعزيز سمعتها ومواجهة التحديات الإعلامية فور ظهورها.'
  },
  {
    id: 2,
    slug: 'media-crisis-management-guide',
    title: 'إدارة الأزمات الإعلامية: دليل عملي',
    excerpt: 'خطوات حاسمة للتعامل مع الأزمات الإعلامية والحفاظ على صورة العلامة.',
    image: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=800',
    category: { name: 'إدارة الأزمات', slug: 'crisis' },
    author: {
      name: 'فريق تحرير وجه',
      avatar: 'https://ui-avatars.com/api/?name=Wajh&background=1A2744&color=fff'
    },
    date: '20 يونيو 2026',
    content: 'تحدث الأزمات فجأة، ولكن سرعة وذكاء الاستجابة هما ما يحددان ما إذا كانت الأزمة ستدمر السمعة المؤسسية أم ستمر بأقل الخسائر الممكنة. يتطلب النجاح في إدارة الأزمات إعداد سيناريوهات استباقية وتدريب المتحدثين الرسميين وتفعيل خلية اتصال طارئة تعمل على مدار الساعة لتقديم معلومات شفافة ودقيقة تمنع انتشار الإشاعات وتستعيد ثقة الجمهور في أسرع وقت.'
  },
  {
    id: 3,
    slug: 'content-marketing-trust',
    title: 'التسويق بالمحتوى لتعزيز ثقة الجمهور',
    excerpt: 'استراتيجيات المحتوى التي تبني جسور الثقة بين المؤسسة وجمهورها.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    category: { name: 'إعلام', slug: 'media' },
    author: {
      name: 'فريق تحرير وجه',
      avatar: 'https://ui-avatars.com/api/?name=Wajh&background=1A2744&color=fff'
    },
    date: '19 يونيو 2026',
    content: 'الجمهور الحديث يبحث عن القيمة والمصداقية. لم يعد الإعلان التقليدي كافياً لإقناع المستهلكين أو كسب ولائهم. يمثل التسويق بالمحتوى النافع والقصص الملهمة والبيانات الدقيقة الأداة الأكثر فعالية لبناء جسور قوية من الثقة الطويلة الأمد. عندما تقدم المؤسسة محتوى يحل مشاكل جمهورها أو يثري معارفهم، فإنها تضع نفسها كمرجعية موثوقة في قطاعها.'
  },
  {
    id: 4,
    slug: 'measuring-pr-campaigns',
    title: 'قياس أثر حملات العلاقات العامة',
    excerpt: 'مؤشرات الأداء الرئيسية لتقييم نجاح استراتيجيتك الإعلامية.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    category: { name: 'رقمي', slug: 'digital' },
    author: {
      name: 'فريق تحرير وجه',
      avatar: 'https://ui-avatars.com/api/?name=Wajh&background=1A2744&color=fff'
    },
    date: '18 يونيو 2026',
    content: 'ما لا يمكن قياسه لا يمكن إدارته أو تحسينه. في الماضي، كان قياس العلاقات العامة يعتمد على مساحات النشر ومكافئات القيمة الإعلانية وهي مقاييس غير دقيقة. اليوم، تتيح الأدوات الرقمية قياس النبرة العامة للمحادثات، ومستوى التفاعل والارتباط بالهوية، والتغيير في وعي الجمهور وسلوكهم، بالإضافة إلى قياس تأثير الحملات الاتصالية على الأهداف العامة للمؤسسة.'
  },
  {
    id: 5,
    slug: 'government-pr-institutional-trust',
    title: 'العلاقات العامة الحكومية: بناء الثقة المؤسسية',
    excerpt: 'كيف تبني الجهات الحكومية علاقة قوية وشفافة مع المواطنين والإعلام.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    category: { name: 'مؤسسي', slug: 'corporate' },
    author: {
      name: 'فريق تحرير وجه',
      avatar: 'https://ui-avatars.com/api/?name=Wajh&background=1A2744&color=fff'
    },
    date: '17 يونيو 2026',
    content: 'الاتصال الحكومي الفعال هو الركيزة الأساسية لنجاح السياسات العامة وتعزيز المشاركة الوطنية. يجب أن يعتمد الاتصال الحكومي على الوضوح التام والوصول السريع للمعلومات وتفنيد الشائعات بشكل موضوعي. من خلال تبني مبادئ الشفافية والشراكة مع وسائل الإعلام، تستطيع المؤسسات الحكومية بناء حوار بناء يسهم في تحقيق التنمية المستدامة واستقرار الثقة العامة.'
  }
];

export const getArticles = (lang: 'ar' | 'en'): Article[] => {
  if (lang === 'en') {
    return mockArticles.map(art => {
      let title = art.title;
      let excerpt = art.excerpt;
      let content = art.content;
      let catName = art.category.name;

      if (art.slug === 'pr-strategy-digital-transformation') {
        title = 'PR Strategy in the Age of Digital Transformation';
        excerpt = 'How to build a strong digital presence that supports your institution\'s reputation.';
        content = 'In the era of hyper-connectivity and rapid digital transformation, public relations is no longer limited to writing traditional press releases and sending them to the media. Today, PR revolves around building a continuous, interactive dialogue with the audience across multiple communication channels. Organizations need to develop agile, data-driven strategies that understand digital audience behavior and leverage innovative publishing tools to protect reputation and address media challenges in real-time.';
        catName = 'Public Relations';
      } else if (art.slug === 'media-crisis-management-guide') {
        title = 'Media Crisis Management: A Practical Guide';
        excerpt = 'Critical steps for handling media crises and preserving brand image.';
        content = 'Crises happen suddenly, but the speed and intelligence of the response determine whether the crisis will destroy corporate reputation or pass with minimal damage. Success in crisis management requires preparing proactive scenarios, training official spokespeople, and activating a 24/7 crisis communication cell to provide transparent and accurate information that prevents the spread of rumors and restores public trust quickly.';
        catName = 'Crisis Management';
      } else if (art.slug === 'content-marketing-trust') {
        title = 'Content Marketing to Build Public Trust';
        excerpt = 'Content strategies that build bridges of trust between organizations and their audiences.';
        content = 'Modern audiences look for value and credibility. Traditional advertising is no longer enough to persuade consumers or earn their loyalty. Content marketing using useful resources, inspiring stories, and accurate data represents the most effective tool to build strong, long-term bridges of trust. When an organization provides content that solves its audience\'s problems or enriches their knowledge, it establishes itself as a trusted authority in its field.';
        catName = 'Media';
      } else if (art.slug === 'measuring-pr-campaigns') {
        title = 'Measuring the Impact of PR Campaigns';
        excerpt = 'Key performance indicators to evaluate your media strategy\'s success.';
        content = 'What cannot be measured cannot be managed or improved. In the past, PR measurement relied on clipping books and advertising value equivalents (AVEs), which are inaccurate. Today, digital tools allow for measuring the sentiment of conversations, engagement levels, brand affinity, and shifts in audience awareness and behavior, as well as the direct impact of communication campaigns on overall corporate objectives.';
        catName = 'Digital';
      } else if (art.slug === 'government-pr-institutional-trust') {
        title = 'Government PR: Building Institutional Trust';
        excerpt = 'How government entities build strong, transparent relationships with citizens and media.';
        content = 'Effective government communication is the cornerstone of successful public policies and national engagement. Government communication must rely on complete clarity, rapid access to information, and objective refutation of rumors. By adopting principles of transparency and partnership with the media, government institutions can build a constructive dialogue that contributes to sustainable development and public trust stability.';
        catName = 'Corporate';
      }

      return {
        ...art,
        title,
        excerpt,
        content,
        category: { ...art.category, name: catName },
        author: { ...art.author, name: 'Wajh Editorial Team' },
        date: art.date.replace('يونيو', 'June')
      };
    });
  }
  return mockArticles;
};
