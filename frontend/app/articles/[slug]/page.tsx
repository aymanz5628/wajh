'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, use } from 'react';
import ArticleHeader from '@/components/article/ArticleHeader';
import ArticleBody from '@/components/article/ArticleBody';
import RelatedArticles from '@/components/article/RelatedArticles';
import { useLanguage } from '@/i18n/LanguageContext';
import { getArticles } from '@/lib/data';
import { fetchAPI, getAPIURL, extractImageUrl } from '@/lib/api';

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;
    const { language, t } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [article, setArticle] = useState<any>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const fetchArticle = async () => {
            const defaultArticles = getArticles(language);
            const mockMatch = defaultArticles.find(art => art.slug === slug);

            if (mockMatch) {
                setArticle({
                    title: mockMatch.title,
                    description: mockMatch.excerpt,
                    content: mockMatch.content || '',
                    publishedAt: new Date().toISOString(),
                    image: mockMatch.image,
                    author: mockMatch.author,
                    category: mockMatch.category,
                    rawHtml: mockMatch.rawHtml || '',
                    useRawHtml: mockMatch.useRawHtml || false
                });
                setLoading(false);
                return;
            }

            try {
                const queryParams = {
                    filters: {
                        slug: { $eq: slug }
                    },
                    populate: '*',
                    locale: language,
                };

                const data = await fetchAPI('/articles', queryParams);
                const articleData = data?.data?.[0];

                if (articleData) {
                    const attr = articleData.attributes || articleData;
                    const cat = attr.category?.data?.attributes || attr.category || { name: t('category.general'), slug: 'general' };
                    const imageUrl = extractImageUrl(attr.coverImage || attr.image || attr.cover) || defaultArticles[0].image;

                    setArticle({
                        title: attr.title || (language === 'ar' ? 'بدون عنوان' : 'Untitled'),
                        description: attr.excerpt || attr.description || '',
                        content: attr.content || '',
                        rawHtml: attr.rawHtml || attr.htmlraw || '',
                        useRawHtml: attr.useRawHtml || !!attr.rawHtml,
                        publishedAt: attr.publishedAt || new Date().toISOString(),
                        image: imageUrl,
                        author: {
                            name: t('author.editor'),
                            avatar: 'https://ui-avatars.com/api/?name=W&background=1A2744&color=fff'
                        },
                        category: {
                            name: cat.name || t('category.general'),
                            slug: cat.slug || 'general'
                        }
                    });
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error('Error fetching article:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [slug, language, t]);

    useEffect(() => {
        if (article?.useRawHtml) {
            document.documentElement.classList.add('immersive-mode');
            return () => {
                document.documentElement.classList.remove('immersive-mode');
            };
        }
    }, [article?.useRawHtml]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column' }}>
                <div style={{ marginBottom: '20px', position: 'relative', width: '80px', height: '80px' }}>
                    <Image
                        src="/logo.svg"
                        alt="Loading"
                        fill
                        style={{ objectFit: 'contain' }}
                        priority
                        className="animate-pulse"
                    />
                </div>
                <p style={{ fontSize: '18px', color: 'var(--royal-blue)', fontFamily: 'var(--font-ibm-plex-sans-arabic)' }}>
                    {language === 'ar' ? 'جاري تحميل المقال...' : 'Loading article...'}
                </p>
            </div>
        );
    }

    if (notFound || !article) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>😕</div>
                    <h1 style={{ fontSize: '24px', color: 'var(--text-primary)' }}>
                        {language === 'ar' ? 'المقال غير موجود' : 'Article Not Found'}
                    </h1>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginTop: '10px' }}>
                        {language === 'ar' ? 'عذراً، لم نتمكن من العثور على المقال المطلوب.' : 'Sorry, we could not find the requested article.'}
                    </p>
                    <Link href="/" style={{ display: 'inline-block', marginTop: '20px', color: 'var(--royal-blue)', fontWeight: 600 }}>
                        {language === 'ar' ? '← العودة للرئيسية' : '← Back to Homepage'}
                    </Link>
                </div>
            </div>
        );
    }

    const dateLocale = language === 'ar' ? 'ar-SA' : 'en-US';

    return (
        <article className={article.useRawHtml ? "min-h-screen bg-[#0a0a0a] immersive-article" : "min-h-screen bg-white pb-20 dark:bg-[#0D1526]"}>
            {!article.useRawHtml && <ArticleHeader
                title={article.title}
                excerpt={article.description}
                category={article.category?.name || (language === 'ar' ? 'عام' : 'General')}
                categorySlug={article.category?.slug}
                author={article.author}
                date={article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            />}
            <ArticleBody
                content={article.content}
                rawHtml={article.rawHtml}
                useRawHtml={article.useRawHtml}
                articleTitle={article.title}
                image={article.image || undefined}
            />
            {!article.useRawHtml && (
                <div className="container" style={{ padding: '0 20px' }}>
                    <RelatedArticles currentArticleSlug={slug} categorySlug={article.category?.slug} />
                </div>
            )}
            <Link href="/" className="floating-home-button" aria-label={language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}>
                <span className="floating-home-icon">
                    <Home size={18} />
                </span>
                <span className="floating-home-text">{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
            </Link>
        </article>
    );
}
