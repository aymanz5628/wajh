'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/home/Hero';
import ArticleCarousel from '@/components/shared/ArticleCarousel';
import GallerySection from '@/components/home/GallerySection';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { useLanguage } from '@/i18n/LanguageContext';
import { getArticles } from '@/lib/data';
import { fetchAPI, getAPIURL } from '@/lib/api';

export default function Home() {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [articles, setArticles] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [documentaries, setDocumentaries] = useState<any[]>([]);

    const getMockPrograms = () => [
        { id: 'p1', title: t('program.1'), link: '#', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800' },
        { id: 'p2', title: t('program.2'), link: '#', image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800' },
        { id: 'p3', title: t('program.3'), link: '#', image: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=800' },
        { id: 'p4', title: t('program.4'), link: '#', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800' },
    ];

    const getMockDocs = () => [
        { id: 'd1', title: t('doc.1'), link: '#', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800' },
        { id: 'd2', title: t('doc.2'), link: '#', image: 'https://images.unsplash.com/photo-1521791136368-1a46827d0a92?auto=format&fit=crop&q=80&w=800' },
        { id: 'd3', title: t('doc.3'), link: '#', image: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&q=80&w=800' },
        { id: 'd4', title: t('doc.4'), link: '#', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800' },
    ];

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            const defaultArticles = getArticles(language);
            
            // Safety timeout
            const timeoutId = setTimeout(() => {
                if (isMounted) {
                    setArticles(defaultArticles);
                    setPrograms(getMockPrograms());
                    setDocumentaries(getMockDocs());
                    setLoading(false);
                }
            }, 5000);

            try {
                const urlParams = {
                    populate: '*',
                    sort: 'publishedAt:desc',
                    pagination: { limit: 20 },
                    locale: language,
                };

                const data = await fetchAPI('/articles', urlParams);

                if (isMounted) {
                    clearTimeout(timeoutId);
                    const rawArticles = data.data || [];

                    if (rawArticles.length > 0) {
                        const strapiSlugs = new Set<string>();
                        const formattedStrapiArticles = rawArticles.map((article: any) => {
                            const attr = article.attributes || article;
                            const cat = attr.category?.data?.attributes || attr.category || { name: t('category.general'), slug: 'general' };
                            const articleSlug = attr.slug || 'article-' + article.id;
                            strapiSlugs.add(articleSlug);

                            const imgData = attr.coverImage?.data?.attributes || attr.coverImage?.data || attr.coverImage || attr.image?.data?.attributes || attr.image?.data || attr.image;
                            const imageUrl = imgData?.url ? getAPIURL(imgData.url) : defaultArticles[0].image;

                            return {
                                id: article.id,
                                slug: articleSlug,
                                title: attr.title || 'Untitled',
                                excerpt: attr.excerpt || attr.description || '',
                                image: imageUrl,
                                category: { name: cat.name || t('category.general'), slug: cat.slug || 'general' },
                                date: attr.publishedAt ? new Date(attr.publishedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : '',
                                author: { name: t('author.editor'), avatar: 'https://ui-avatars.com/api/?name=W' }
                            };
                        });

                        const mockArticlesFiltered = defaultArticles.filter(
                            (mock: any) => !strapiSlugs.has(mock.slug)
                        );
                        setArticles([...formattedStrapiArticles, ...mockArticlesFiltered]);
                    } else {
                        setArticles(defaultArticles);
                    }
                    setPrograms(getMockPrograms());
                    setDocumentaries(getMockDocs());
                }
            } catch (error) {
                console.error('[Home] Error fetching data:', error);
                if (isMounted) {
                    setArticles(defaultArticles);
                    setPrograms(getMockPrograms());
                    setDocumentaries(getMockDocs());
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [language]);

    const heroArticles = articles.slice(0, 1);
    const latestTopics = articles.slice(1, 5);
    const mostViewed = articles.slice(0, 4);

    if (loading) {
        return (
            <main className={styles.main}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '20px', position: 'relative', width: '80px', height: '80px' }}>
                        <Image
                            src="/logo.svg"
                            alt="Loading"
                            fill
                            style={{ objectFit: 'contain' }}
                            priority
                            className={styles.pulse}
                        />
                    </div>
                    <p style={{ fontSize: '18px', color: 'var(--royal-blue)', fontFamily: 'var(--font-ibm-plex-sans-arabic)' }}>
                        {t('loading.content')}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.heroSection}><Hero articles={heroArticles} /></div>
            <section className={styles.parallaxSection}>
                <div className="container">
                    <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>{t('section.latestTopics')}</h2></div>
                    <ArticleCarousel articles={latestTopics} autoPlayInterval={5000} />
                </div>
            </section>
            <section className={styles.parallaxSection}>
                <div className="container">
                    <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>{t('section.mostViewed')}</h2></div>
                    <ArticleCarousel articles={mostViewed} autoPlayInterval={6000} />
                </div>
            </section>
            <GallerySection />
            <section id="programs" className={styles.seriesSection}>
                <div className="container">
                    <div className={styles.seriesHeader}><h2 className={styles.seriesTitle}>{t('section.programs')}</h2></div>
                    <div className={styles.seriesGrid}>
                        {programs.map((item: any) => (
                            <div key={item.id} className={styles.seriesCard}>
                                <Image src={item.image} alt={item.title} fill className={styles.seriesImage} sizes="(max-width: 768px) 50vw, 25vw" />
                                <div className={styles.seriesOverlay} />
                                <div className={styles.seriesContent}>
                                    <h4 className={styles.seriesCardTitle}>{item.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section id="documentaries" className={styles.seriesSection}>
                <div className="container">
                    <div className={styles.seriesHeader}><h2 className={styles.seriesTitle}>{t('section.documentaries')}</h2></div>
                    <div className={styles.seriesGrid}>
                        {documentaries.map((item: any) => (
                            <div key={item.id} className={styles.seriesCard}>
                                <Image src={item.image} alt={item.title} fill className={styles.seriesImage} sizes="(max-width: 768px) 50vw, 25vw" />
                                <div className={styles.seriesOverlay} />
                                <div className={styles.seriesContent}>
                                    <h4 className={styles.seriesCardTitle}>{item.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
