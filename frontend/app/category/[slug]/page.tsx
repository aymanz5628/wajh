'use client';

import { useEffect, useState, use } from 'react';
import ArticleCard from '@/components/shared/ArticleCard';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { fetchAPI, getAPIURL } from '@/lib/api';
import { getArticles, Article } from '@/lib/data';
import styles from './page.module.css';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { language, t } = useLanguage();
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    const [articles, setArticles] = useState<Article[]>([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const fetchArticles = async () => {
            setLoading(true);
            setError(false);

            const defaultArticles = getArticles(language);
            // Filter mock articles matching the category slug, or show all if slug is 'topics' or 'pr'
            const isAllTopics = slug === 'topics' || slug === 'insights';
            const mockFiltered = isAllTopics 
                ? defaultArticles 
                : defaultArticles.filter(art => art.category.slug === slug);

            // Determine initial category name
            let catName = slug;
            if (isAllTopics) {
                catName = language === 'ar' ? 'المواضيع' : 'Topics';
            } else {
                const match = defaultArticles.find(art => art.category.slug === slug);
                if (match) {
                    catName = match.category.name;
                } else if (slug === 'pr') {
                    catName = t('category.pr');
                } else if (slug === 'crisis') {
                    catName = t('category.crisis');
                } else if (slug === 'media') {
                    catName = t('category.media');
                } else if (slug === 'digital') {
                    catName = t('category.digital');
                } else if (slug === 'corporate') {
                    catName = t('category.corporate');
                }
            }
            setCategoryName(catName);

            try {
                const queryParams: any = {
                    populate: '*',
                    sort: 'publishedAt:desc',
                    pagination: { limit: 50 },
                    locale: language,
                };

                if (!isAllTopics) {
                    queryParams.filters = {
                        category: {
                            slug: { $eq: slug }
                        }
                    };
                }

                const res = await fetchAPI('/articles', queryParams);
                const rawArticles = res?.data || [];

                if (rawArticles.length > 0) {
                    if (!isAllTopics) {
                        const firstArticle = rawArticles[0];
                        const attr = firstArticle.attributes || firstArticle;
                        const catData = attr.category?.data?.attributes || attr.category;
                        if (catData?.name) setCategoryName(catData.name);
                    }

                    const mapped: Article[] = rawArticles.map((article: any) => {
                        const attr = article.attributes || article;
                        const catData = attr.category?.data?.attributes || attr.category || {};

                        const imgData = attr.coverImage?.data?.attributes || attr.coverImage?.data || attr.coverImage || attr.image?.data?.attributes || attr.image?.data || attr.image;
                        const imageUrl = imgData?.url ? getAPIURL(imgData.url) : (mockFiltered[0]?.image || defaultArticles[0].image);

                        return {
                            id: article.id,
                            slug: attr.slug || `article-${article.id}`,
                            title: attr.title || (language === 'ar' ? 'بدون عنوان' : 'Untitled'),
                            excerpt: attr.excerpt || attr.description || '',
                            image: imageUrl,
                            category: {
                                name: catData.name || (language === 'ar' ? 'عام' : 'General'),
                                slug: catData.slug || 'general'
                            },
                            date: attr.publishedAt
                                ? new Date(attr.publishedAt).toLocaleDateString(
                                    language === 'ar' ? 'ar-SA' : 'en-US',
                                    { year: 'numeric', month: 'long', day: 'numeric' }
                                  )
                                : '',
                            author: {
                                name: t('author.editor'),
                                avatar: 'https://ui-avatars.com/api/?name=W&background=1A2744&color=fff'
                            }
                        };
                    });

                    // Merge Strapi articles and matching mock articles to ensure a full list
                    const strapiSlugs = new Set(mapped.map(a => a.slug));
                    const filteredMocks = mockFiltered.filter(m => !strapiSlugs.has(m.slug));
                    setArticles([...mapped, ...filteredMocks]);
                } else {
                    setArticles(mockFiltered);
                }
            } catch (err) {
                console.error('Category fetch error:', err);
                // On error, show mock filtered articles
                setArticles(mockFiltered);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [slug, language, t]);

    if (loading) {
        return (
            <main className={`${styles.main} container`}>
                <div className={styles.loadingContainer}>
                    <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'float 2s ease-in-out infinite' }}>📢</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                        {language === 'ar' ? 'جاري تحميل المقالات...' : 'Loading articles...'}
                    </p>
                    <style>{`@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
                </div>
            </main>
        );
    }

    return (
        <main className={`${styles.main} container`}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/" className={styles.backLink} aria-label="Back">
                    {language === 'ar' ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
                </Link>
                <div className={styles.titleWrapper}>
                    <span className={styles.label}>
                        {language === 'ar' ? 'تصنيف' : 'Category'}
                    </span>
                    <h1 className={styles.pageTitle}>
                        {categoryName || slug}
                    </h1>
                </div>
            </div>

            {/* Error State */}
            {error && articles.length === 0 && (
                <div className={styles.noResults}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        {language === 'ar' ? 'حدث خطأ في تحميل المقالات' : 'Error loading articles'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className={styles.retryBtn}
                    >
                        {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                    </button>
                </div>
            )}

            {/* Grid */}
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
            ) : !error ? (
                <div className={styles.noResults}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                    <h3 className={styles.noResultsTitle}>
                        {language === 'ar' ? 'لا توجد مقالات في هذا التصنيف حالياً' : 'No articles in this category yet'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        {language === 'ar' ? 'سنضيف محتوى جديد قريباً' : 'New content coming soon'}
                    </p>
                    <Link href="/" className={styles.backHomeLink}>
                        {language === 'ar' ? '← العودة للرئيسية' : '← Back to Homepage'}
                    </Link>
                </div>
            ) : null}
        </main>
    );
}
