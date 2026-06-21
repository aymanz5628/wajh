"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAPI, extractImageUrl } from '@/lib/api';
import styles from './GallerySection.module.css';
import { useLanguage } from '@/i18n/LanguageContext';

interface CarouselItem {
    image: string;
    caption: string;
}

const PLACEHOLDER_ITEMS_AR: CarouselItem[] = [
    { image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800", caption: "مؤتمر صحفي لإطلاق مبادرة الاتصال الرقمي الجديدة" },
    { image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800", caption: "ورشة عمل استراتيجية لبناء الهوية المؤسسية" },
    { image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800", caption: "القمة السنوية للعلاقات العامة والتأثير الإعلامي" },
    { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", caption: "تحليل البيانات وقياس أثر الحملات الاتصالية" },
    { image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800", caption: "تغطية إعلامية مباشرة ولقاءات تلفزيونية حصرية" },
    { image: "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=800", caption: "اجتماع فريق العلاقات العامة لتطوير خطة إدارة الأزمات" },
];

const PLACEHOLDER_ITEMS_EN: CarouselItem[] = [
    { image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800", caption: "Press conference launching the new digital communication initiative" },
    { image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800", caption: "Strategic workshop for building corporate identity" },
    { image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800", caption: "Annual Public Relations and Media Influence Summit" },
    { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", caption: "Data analytics and measuring the impact of communication campaigns" },
    { image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800", caption: "Live media coverage and exclusive television interviews" },
    { image: "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=800", caption: "PR team meeting to develop crisis management plans" },
];

export default function GallerySection() {
    const { t, language } = useLanguage();
    const [items, setItems] = useState<CarouselItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartX = useRef<number>(0);

    const placeholderItems = language === 'ar' ? PLACEHOLDER_ITEMS_AR : PLACEHOLDER_ITEMS_EN;

    useEffect(() => {
        async function loadGallery() {
            try {
                const res = await fetchAPI('/gallery-images', {
                    populate: '*',
                    sort: 'order:asc',
                });
                let data = [];
                if (Array.isArray(res)) {
                    data = res;
                } else if (res?.data) {
                    data = Array.isArray(res.data) ? res.data : [res.data];
                }

                if (data.length > 0) {
                    const strapiItems: CarouselItem[] = [];
                    data.forEach((item: any) => {
                        const attr = item.attributes || item;
                        const url = extractImageUrl(attr.image);
                        if (url) {
                            const caption = language === 'ar'
                                ? (attr.caption_ar || attr.caption_en || '')
                                : (attr.caption_en || attr.caption_ar || '');
                            strapiItems.push({
                                image: url,
                                caption,
                            });
                        }
                    });

                    if (strapiItems.length > 0) {
                        let displayItems = [...strapiItems];
                        while (displayItems.length < 5) {
                            displayItems = [...displayItems, ...strapiItems];
                        }
                        setItems(displayItems.slice(0, Math.min(displayItems.length, 10)));
                    } else {
                        setItems(placeholderItems);
                    }
                } else {
                    setItems(placeholderItems);
                }
            } catch (e) {
                console.error("Gallery fetch failed", e);
                setItems(placeholderItems);
            } finally {
                setLoading(false);
            }
        }
        loadGallery();
    }, [language, placeholderItems]);

    // Auto-play carousel
    useEffect(() => {
        if (items.length === 0) return;

        const startAutoPlay = () => {
            autoPlayRef.current = setInterval(() => {
                setActiveIndex(prev => (prev + 1) % items.length);
            }, 4000);
        };

        startAutoPlay();

        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [items.length]);

    const resetAutoPlay = useCallback(() => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % items.length);
        }, 4000);
    }, [items.length]);

    const goTo = useCallback((index: number) => {
        setActiveIndex(index);
        resetAutoPlay();
    }, [resetAutoPlay]);

    const goNext = useCallback(() => {
        setActiveIndex(prev => (prev + 1) % items.length);
        resetAutoPlay();
    }, [items.length, resetAutoPlay]);

    const goPrev = useCallback(() => {
        setActiveIndex(prev => (prev - 1 + items.length) % items.length);
        resetAutoPlay();
    }, [items.length, resetAutoPlay]);

    // Touch/swipe support
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 50) {
            if (delta > 0) goNext();
            else goPrev();
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goNext, goPrev]);

    const [cardSpacing, setCardSpacing] = useState(260);
    useEffect(() => {
        const updateSpacing = () => {
            setCardSpacing(window.innerWidth * 0.172);
        };
        updateSpacing();
        window.addEventListener('resize', updateSpacing);
        return () => window.removeEventListener('resize', updateSpacing);
    }, []);

    const getCardStyle = (index: number): React.CSSProperties => {
        const total = items.length;
        let offset = index - activeIndex;

        if (offset > total / 2) offset -= total;
        if (offset < -total / 2) offset += total;

        const isActive = offset === 0;
        const absOffset = Math.abs(offset);

        if (absOffset > 3) {
            return {
                opacity: 0,
                transform: `translateX(${offset * 100}px) scale(0.5)`,
                zIndex: 0,
                pointerEvents: 'none' as const,
            };
        }

        const translateX = offset * cardSpacing;
        const scale = isActive ? 1.15 : Math.max(0.7, 1 - absOffset * 0.12);
        const opacity = isActive ? 1 : Math.max(0.4, 1 - absOffset * 0.25);
        const zIndex = 10 - absOffset;
        const rotateY = language === 'ar' ? offset * 5 : offset * -5;

        return {
            transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
            opacity,
            zIndex,
            pointerEvents: absOffset <= 1 ? 'auto' as const : 'none' as const,
        };
    };

    if (loading) return null;
    if (items.length === 0) return null;

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                {/* Section Header */}
                <motion.div
                    className={styles.sectionHeader}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className={styles.sectionTitle}>{t('section.gallery')}</h2>
                    <p className={styles.sectionSubtitle}>
                        {language === 'ar'
                            ? 'أبرز فعالياتنا، مؤتمراتنا الصحفية، وحملاتنا الإعلامية الناجحة'
                            : 'Highlights of our events, press conferences, and successful media campaigns'}
                    </p>
                </motion.div>

                {/* Carousel */}
                <motion.div
                    className={styles.carouselWrapper}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Navigation - Previous */}
                    <button
                        className={`${styles.navButton} ${styles.navPrev}`}
                        onClick={goPrev}
                        aria-label="Previous"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {/* Cards */}
                    <div className={styles.cardsContainer}>
                        {items.map((item, index) => {
                            const style = getCardStyle(index);
                            const isActive = index === activeIndex;

                            return (
                                <div
                                    key={index}
                                    className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
                                    style={style}
                                    onClick={() => {
                                        if (isActive) {
                                            window.location.href = '/gallery';
                                        } else {
                                            goTo(index);
                                        }
                                    }}
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.caption || `Gallery ${index + 1}`}
                                        fill
                                        className={styles.cardImage}
                                        sizes="(max-width: 768px) 240px, 320px"
                                    />
                                    <div className={styles.cardOverlay} />
                                    {item.caption && (
                                        <div className={styles.cardContent}>
                                            <p className={styles.cardCaption}>{item.caption}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigation - Next */}
                    <button
                        className={`${styles.navButton} ${styles.navNext}`}
                        onClick={goNext}
                        aria-label="Next"
                    >
                        <ChevronRight size={24} />
                    </button>
                </motion.div>

                {/* Dots */}
                <div className={styles.dotsContainer}>
                    {items.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
                            onClick={() => goTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Gallery Link */}
                <Link href="/gallery" className={styles.galleryLink}>
                    <span>{language === 'ar' ? 'عرض كل الصور' : 'View All Photos'}</span>
                    <ArrowUpRight size={20} />
                </Link>
            </div>
        </section>
    );
}
