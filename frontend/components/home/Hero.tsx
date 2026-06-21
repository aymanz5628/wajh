'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import styles from './Hero.module.css';
import { useLanguage } from '@/i18n/LanguageContext';

interface Article {
    id: string | number;
    slug: string;
    image: string;
    category: {
        name: string;
        slug: string;
    };
    title: string;
    excerpt: string;
    author: {
        name: string;
        avatar: string;
    };
    date: string;
}

interface HeroProps {
    articles: Article[];
}

export default function Hero({ articles }: HeroProps) {
    const { language } = useLanguage();
    const containerRef = useRef<HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Take up to 5 featured articles for the carousel
    const featured = articles && articles.length > 0 ? articles.slice(0, 5) : [];
    const article = featured[activeIndex] || null;

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);

    // Auto-rotate carousel
    useEffect(() => {
        if (featured.length <= 1 || isPaused) return;
        const timer = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % featured.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [featured.length, isPaused]);

    const goToSlide = useCallback((index: number) => {
        setActiveIndex(index);
        setIsPaused(true);
        // Resume auto-play after 10s of inactivity
        setTimeout(() => setIsPaused(false), 10000);
    }, []);

    if (!article) {
        return (
            <section ref={containerRef} className={styles.heroSection}>
                <div className={styles.heroCard}>
                    <div className={styles.heroSkeleton}>
                        <div className={styles.skeletonBadge} />
                        <div className={styles.skeletonTitle} />
                        <div className={styles.skeletonSubtitle} />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={containerRef}
            className={styles.heroSection}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <Link href={`/articles/${article.slug}`} className={styles.heroLink}>
                <div className={styles.heroCard}>
                    {/* Background image with parallax */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            className={styles.imageContainer}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            style={{ y }}
                        >
                            <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                sizes="100vw"
                                className={styles.heroImage}
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Gradient overlays */}
                    <div className={styles.overlay} />
                    <div className={styles.overlayRadial} />

                    {/* Geometric border accent */}
                    <div className={styles.geometricBorder} />

                    {/* Content */}
                    <motion.div className={styles.content} style={{ opacity }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                className={styles.contentInner}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <span className={styles.categoryBadge}>
                                    {article.category.name}
                                </span>
                                <h2 className={styles.title}>{article.title}</h2>
                                <p className={styles.subtitle}>{article.excerpt}</p>
                                <span className={styles.readMore}>
                                    {language === 'ar' ? 'اقرأ المزيد ←' : 'Read More →'}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* Carousel indicators */}
                    {featured.length > 1 && (
                        <div className={styles.indicators} onClick={(e) => e.preventDefault()}>
                            {featured.map((_, index) => (
                                <button
                                    key={index}
                                    className={`${styles.indicator} ${index === activeIndex ? styles.indicatorActive : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        goToSlide(index);
                                    }}
                                    aria-label={`Slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Progress bar */}
                    {featured.length > 1 && !isPaused && (
                        <motion.div
                            className={styles.progressBar}
                            key={`progress-${activeIndex}`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 6, ease: "linear" }}
                        />
                    )}
                </div>
            </Link>
        </section>
    );
}
