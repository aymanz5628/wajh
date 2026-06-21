'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import styles from './ArticleCarousel.module.css';

interface ArticleItem {
    id: string | number;
    slug: string;
    title: string;
    excerpt?: string;
    image: string;
    category: { name: string; slug: string };
    date?: string;
    author?: { name: string; avatar: string };
}

interface ArticleCarouselProps {
    articles: ArticleItem[];
    autoPlayInterval?: number;
}

export default function ArticleCarousel({ articles, autoPlayInterval = 4000 }: ArticleCarouselProps) {
    const { language } = useLanguage();
    const [activeIndex, setActiveIndex] = useState(0);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartX = useRef<number>(0);

    const total = articles.length;

    // Auto-play
    useEffect(() => {
        if (total === 0) return;
        autoPlayRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % total);
        }, autoPlayInterval);
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [total, autoPlayInterval]);

    const resetAutoPlay = useCallback(() => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % total);
        }, autoPlayInterval);
    }, [total, autoPlayInterval]);

    const goTo = useCallback((index: number) => {
        setActiveIndex(index);
        resetAutoPlay();
    }, [resetAutoPlay]);

    const goNext = useCallback(() => {
        setActiveIndex(prev => (prev + 1) % total);
        resetAutoPlay();
    }, [total, resetAutoPlay]);

    const goPrev = useCallback(() => {
        setActiveIndex(prev => (prev - 1 + total) % total);
        resetAutoPlay();
    }, [total, resetAutoPlay]);

    // Touch/swipe
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

    // Keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goNext, goPrev]);

    const [cardSpacing, setCardSpacing] = useState(400);
    useEffect(() => {
        const updateSpacing = () => {
            const w = window.innerWidth;
            if (w <= 768) setCardSpacing(w * 0.60);
            else setCardSpacing(w * 0.35);
        };
        updateSpacing();
        window.addEventListener('resize', updateSpacing);
        return () => window.removeEventListener('resize', updateSpacing);
    }, []);

    // 3D card positioning
    const getCardStyle = (index: number): React.CSSProperties => {
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
        const scale = isActive ? 1.12 : Math.max(0.7, 1 - absOffset * 0.13);
        const opacity = isActive ? 1 : Math.max(0.35, 1 - absOffset * 0.28);
        const zIndex = 10 - absOffset;
        const rotateY = language === 'ar' ? offset * 5 : offset * -5;

        return {
            transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
            opacity,
            zIndex,
            pointerEvents: absOffset <= 1 ? 'auto' as const : 'none' as const,
        };
    };

    if (total === 0) return null;

    return (
        <div>
            <div
                className={styles.carouselWrapper}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Prev Arrow */}
                <button
                    className={`${styles.navButton} ${styles.navPrev}`}
                    onClick={goPrev}
                    aria-label="Previous"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Cards */}
                <div className={styles.cardsContainer}>
                    {articles.map((article, index) => {
                        const style = getCardStyle(index);
                        const isActive = index === activeIndex;
                        const linkSlug = article.slug || `article-${article.id}`;

                        return (
                            <Link
                                key={`${article.id}-${index}`}
                                href={`/articles/${linkSlug}`}
                                className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
                                style={style}
                                onClick={(e) => {
                                    if (index !== activeIndex) {
                                        e.preventDefault();
                                        goTo(index);
                                    }
                                }}
                            >
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    fill
                                    className={styles.cardImage}
                                    sizes="(max-width: 480px) 290px, (max-width: 768px) 340px, (max-width: 1024px) 420px, 480px"
                                />
                                <div className={styles.cardOverlay} />
                                <div className={styles.cardContent}>
                                    <span className={styles.cardCategory}>{article.category.name}</span>
                                    <h3 className={styles.cardTitle}>{article.title}</h3>
                                    {article.excerpt && (
                                        <p className={styles.cardExcerpt}>{article.excerpt}</p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Next Arrow */}
                <button
                    className={`${styles.navButton} ${styles.navNext}`}
                    onClick={goNext}
                    aria-label="Next"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Dots */}
            <div className={styles.dotsContainer}>
                {articles.map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
                        onClick={() => goTo(index)}
                        aria-label={`Go to article ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
