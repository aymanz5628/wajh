import { fetchAPI, getAPIURL } from '@/lib/api';
import ArticleCard from '@/components/shared/ArticleCard';
import { ArrowRight, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import { getArticles } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to normalize Arabic text for better search
function normalizeArabic(text: string): string {
    if (!text) return '';
    return text
        .toLowerCase()
        // Normalize Arabic characters
        .replace(/[أإآا]/g, 'ا')
        .replace(/[ةه]/g, 'ه')
        .replace(/[ىي]/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        // Remove diacritics (tashkeel)
        .replace(/[\u064B-\u0652]/g, '')
        // Remove extra spaces
        .replace(/\s+/g, ' ')
        .trim();
}

// Search function that matches partial words
function matchesSearch(text: string, query: string): boolean {
    if (!text || !query) return false;

    const normalizedText = normalizeArabic(text);
    const normalizedQuery = normalizeArabic(query);

    // Direct include check
    if (normalizedText.includes(normalizedQuery)) {
        return true;
    }

    // Also check original lowercase
    if (text.toLowerCase().includes(query.toLowerCase())) {
        return true;
    }

    return false;
}

interface Article {
    id: number | string;
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    category: { name: string; slug: string };
    date: string;
    author: { name: string; avatar: string };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; locale?: string }> }) {
    const params = await searchParams;
    const query = params?.q || '';
    const locale = params?.locale || 'ar';

    let articles: Article[] = [];
    const localArticles = getArticles(locale as 'ar' | 'en');

    // Filter local articles
    const localFiltered = query.trim() ? localArticles.filter((article: any) => {
        const title = article.title || '';
        const excerpt = article.excerpt || '';
        const content = article.content || '';
        const slug = article.slug || '';

        return matchesSearch(title, query) ||
            matchesSearch(excerpt, query) ||
            matchesSearch(content, query) ||
            matchesSearch(slug, query);
    }) : [];

    if (query && query.trim()) {
        try {
            const urlParams = {
                populate: '*',
                pagination: { limit: 100 },
                locale: locale,
            };

            const data = await fetchAPI('/articles', urlParams);
            const rawArticles = data.data || [];

            // Filter API articles
            const apiFiltered = rawArticles.filter((article: any) => {
                const attr = article.attributes || article;
                const title = attr.title || '';
                const description = attr.excerpt || attr.description || '';
                const content = attr.content || '';
                const slug = attr.slug || '';

                return matchesSearch(title, query) ||
                    matchesSearch(description, query) ||
                    matchesSearch(content, query) ||
                    matchesSearch(slug, query);
            });

            const mappedApi: Article[] = apiFiltered.map((article: any) => {
                const attr = article.attributes || article;
                const cat = attr.category?.data?.attributes || attr.category || {};
                const imgData = attr.coverImage?.data?.attributes || attr.coverImage?.data || attr.coverImage || attr.image?.data?.attributes || attr.image?.data || attr.image;
                const imageUrl = imgData?.url ? getAPIURL(imgData.url) : "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=600";

                return {
                    id: article.id,
                    slug: attr.slug || `article-${article.id}`,
                    title: attr.title || 'بدون عنوان',
                    excerpt: attr.excerpt || attr.description || '',
                    image: imageUrl,
                    category: {
                        name: cat.name || (locale === 'ar' ? 'عام' : 'General'),
                        slug: cat.slug || 'general'
                    },
                    date: attr.publishedAt
                        ? new Date(attr.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        : '',
                    author: {
                        name: locale === 'ar' ? 'محرر وجه' : 'Wajh Editor',
                        avatar: 'https://ui-avatars.com/api/?name=W&background=1A2744&color=fff'
                    }
                };
            });

            // Merge API and local filtered articles, ensuring no duplicates by slug
            const merged = [...mappedApi, ...localFiltered];
            articles = Array.from(new Map(merged.map(item => [item.slug, item])).values());
        } catch (err) {
            console.error("[Search] API Error, using local results only:", err);
            articles = localFiltered;
        }
    }

    const suggestions = locale === 'ar' 
        ? ['علاقات عامة', 'أزمة', 'إعلام', 'رقمي', 'مؤسسي']
        : ['PR', 'Crisis', 'Media', 'Digital', 'Corporate'];

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <Link href="/" className={styles.backLink} aria-label="Back">
                    {locale === 'ar' ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
                </Link>
                <div className={styles.titleWrapper}>
                    <Search size={28} className={styles.icon} />
                    <h1 className={styles.pageTitle}>
                        {locale === 'ar' ? 'البحث' : 'Search'}
                    </h1>
                </div>
            </div>

            {query && (
                <p className={styles.queryStats}>
                    {locale === 'ar' ? 'نتائج البحث عن:' : 'Search results for:'}{' '}
                    <span className={styles.queryHighlight}>{query}</span>
                    {articles.length > 0 && (
                        <span className={styles.resultCount}>
                            {' '}
                            ({articles.length} {locale === 'ar' ? 'نتيجة' : 'results'})
                        </span>
                    )}
                </p>
            )}

            {articles.length > 0 ? (
                <div className={styles.grid}>
                    {articles.map((article) => (
                        <ArticleCard
                            key={article.slug}
                            id={article.id}
                            slug={article.slug}
                            title={article.title}
                            excerpt={article.excerpt}
                            image={article.image}
                            category={article.category}
                            author={article.author}
                            date={article.date}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.noResults}>
                    {query ? (
                        <>
                            <div className={styles.noResultsIcon}>🔍</div>
                            <h3 className={styles.noResultsTitle}>
                                {locale === 'ar' 
                                    ? `لا توجد نتائج مطابقة لـ "${query}"`
                                    : `No results matching "${query}"`}
                            </h3>
                            <p className={styles.noResultsText}>
                                {locale === 'ar' 
                                    ? 'جرب البحث بكلمات مفتاحية مختلفة'
                                    : 'Try searching with different keywords'}
                            </p>
                            <div className={styles.suggestions}>
                                <p>{locale === 'ar' ? 'اقتراحات للبحث:' : 'Search Suggestions:'}</p>
                                <div className={styles.suggestionTags}>
                                    {suggestions.map((tag) => (
                                        <Link href={`/search?q=${encodeURIComponent(tag)}`} key={tag} className={styles.tag}>
                                            {tag}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.noResultsIcon}>🔍</div>
                            <h3 className={styles.noResultsTitle}>
                                {locale === 'ar' ? 'ابحث في المقالات والمواضيع' : 'Search Articles and Topics'}
                            </h3>
                            <p className={styles.noResultsText}>
                                {locale === 'ar' 
                                    ? 'أدخل كلمة للبحث في العناوين والمحتوى'
                                    : 'Enter keywords to search titles and content'}
                            </p>
                        </>
                    )}
                </div>
            )}
        </main>
    );
}
