export const translations = {
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.services": "الخدمات",
    "nav.topics": "المواضيع",
    "nav.cases": "حالات النجاح",
    "nav.insights": "المقالات",
    "nav.gallery": "المعرض",
    "nav.search": "ابحث...",

    // Footer
    "footer.copyright": "جميع الحقوق محفوظة لمنصة وجه 2026 ©",
    "footer.about": "من نحن",
    "footer.advertise": "اشترك معنا",
    "footer.careers": "الوظائف",
    "footer.privacy": "سياسة الخصوصية",

    // Sections
    "section.latestTopics": "أحدث المواضيع",
    "section.mostViewed": "الأكثر مشاهدة",
    "section.programs": "خدماتنا",
    "section.documentaries": "حالات النجاح",
    "section.gallery": "المعرض",

    // Gallery
    "gallery.title": "معرض وجه",
    "gallery.description": "استكشف أبرز أعمالنا وحملاتنا في مجال العلاقات العامة.",
    "gallery.loading": "جاري تحميل المعرض...",
    "gallery.empty": "لا توجد صور في المعرض حالياً",

    // Loading
    "loading.content": "جاري تحميل المحتوى...",

    // Categories
    "category.pr": "علاقات عامة",
    "category.media": "إعلام",
    "category.crisis": "إدارة الأزمات",
    "category.digital": "رقمي",
    "category.corporate": "مؤسسي",
    "category.general": "عام",
    "category.aviation": "علاقات عامة",
    "category.travel": "إعلام",

    // Mock Articles
    "article.1.title": "استراتيجية العلاقات العامة في عصر التحول الرقمي",
    "article.1.excerpt": "كيف تبني حضوراً رقمياً قوياً يدعم سمعة مؤسستك",
    "article.2.title": "إدارة الأزمات الإعلامية: دليل عملي",
    "article.2.excerpt": "خطوات حاسمة للتعامل مع الأزمات الإعلامية والحفاظ على صورة العلامة",
    "article.3.title": "التسويق بالمحتوى لتعزيز ثقة الجمهور",
    "article.3.excerpt": "استراتيجيات المحتوى التي تبني جسور الثقة بين المؤسسة وجمهورها",
    "article.4.title": "قياس أثر حملات العلاقات العامة",
    "article.4.excerpt": "مؤشرات الأداء الرئيسية لتقييم نجاح استراتيجيتك الإعلامية",
    "article.5.title": "العلاقات العامة الحكومية: بناء الثقة المؤسسية",
    "article.5.excerpt": "كيف تبني الجهات الحكومية علاقة قوية وشفافة مع المواطنين والإعلام",

    // Programs / Services
    "program.1": "استشارات العلاقات العامة",
    "program.2": "إدارة الأزمات الإعلامية",
    "program.3": "التخطيط الاستراتيجي",
    "program.4": "تحليل وسائل الإعلام",

    // Case Studies / Documentaries
    "doc.1": "نجاح إطلاق منتج عالمي",
    "doc.2": "أزمة إعلامية تحولت لفرصة",
    "doc.3": "بناء هوية علامة تجارية",
    "doc.4": "حملة توعية ناجحة",

    // Author
    "author.editor": "فريق تحرير وجه",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.topics": "Topics",
    "nav.cases": "Success Cases",
    "nav.insights": "Insights",
    "nav.gallery": "Gallery",
    "nav.search": "Search...",

    // Footer
    "footer.copyright": "All rights reserved for Wajh Platform 2026 ©",
    "footer.about": "About Us",
    "footer.advertise": "Partner With Us",
    "footer.careers": "Careers",
    "footer.privacy": "Privacy Policy",

    // Sections
    "section.latestTopics": "Latest Topics",
    "section.mostViewed": "Most Viewed",
    "section.programs": "Our Services",
    "section.documentaries": "Success Cases",
    "section.gallery": "Gallery",

    // Gallery
    "gallery.title": "Wajh Gallery",
    "gallery.description": "Explore our finest PR campaigns and media achievements.",
    "gallery.loading": "Loading gallery...",
    "gallery.empty": "No photos in gallery yet",

    // Loading
    "loading.content": "Loading content...",

    // Categories
    "category.pr": "Public Relations",
    "category.media": "Media",
    "category.crisis": "Crisis Management",
    "category.digital": "Digital",
    "category.corporate": "Corporate",
    "category.general": "General",
    "category.aviation": "Public Relations",
    "category.travel": "Media",

    // Mock Articles
    "article.1.title": "PR Strategy in the Age of Digital Transformation",
    "article.1.excerpt": "How to build a strong digital presence that supports your institution's reputation",
    "article.2.title": "Media Crisis Management: A Practical Guide",
    "article.2.excerpt": "Critical steps for handling media crises and preserving brand image",
    "article.3.title": "Content Marketing to Build Public Trust",
    "article.3.excerpt": "Content strategies that build bridges of trust between organizations and their audiences",
    "article.4.title": "Measuring the Impact of PR Campaigns",
    "article.4.excerpt": "Key performance indicators to evaluate your media strategy's success",
    "article.5.title": "Government PR: Building Institutional Trust",
    "article.5.excerpt": "How government entities build strong, transparent relationships with citizens and media",

    // Programs / Services
    "program.1": "PR Consulting",
    "program.2": "Media Crisis Management",
    "program.3": "Strategic Planning",
    "program.4": "Media Analytics",

    // Case Studies
    "doc.1": "Successful Global Product Launch",
    "doc.2": "A Crisis Turned Into Opportunity",
    "doc.3": "Building a Brand Identity",
    "doc.4": "Impactful Awareness Campaign",

    // Author
    "author.editor": "Wajh Editorial Team",
  }
};

export type Language = 'ar' | 'en';
export type TranslationKey = keyof typeof translations.ar;
