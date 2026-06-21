"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, Expand } from 'lucide-react';
import styles from './page.module.css';
import { useLanguage } from '@/i18n/LanguageContext';
import { fetchAPI, extractImageUrl } from '@/lib/api';

const LOCAL_PHOTOS_AR = [
    { id: 1, src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800", caption: "المؤتمر الصحفي السنوي لإطلاق الهوية الرقمية الجديدة" },
    { id: 2, src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800", caption: "ورشة عمل تفاعلية لبناء استراتيجية الاتصال المؤسسي" },
    { id: 3, src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800", caption: "جلسة نقاشية في قمة الاتصال الرقمي وتأثير العلامة" },
    { id: 4, src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", caption: "تحليل وقياس مؤشرات الأداء وحملات العلاقات العامة" },
    { id: 5, src: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800", caption: "تغطية إعلامية حية وحوارات صحفية حصرية مع القيادات" },
    { id: 6, src: "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=800", caption: "اجتماع فريق الاتصال لتطوير دليل الاستجابة للأزمات" },
    { id: 7, src: "https://images.unsplash.com/photo-1521791136368-1a46827d0a92?auto=format&fit=crop&q=80&w=800", caption: "توقيع اتفاقيات شراكة استراتيجية مع وكالات الإعلام العالمية" },
    { id: 8, src: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=800", caption: "صياغة المحتوى الاستراتيجي وبناء قصة العلامة التجارية" },
];

const LOCAL_PHOTOS_EN = [
    { id: 1, src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800", caption: "Annual press conference for the launch of the new digital identity" },
    { id: 2, src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800", caption: "Interactive workshop on corporate communication strategy" },
    { id: 3, src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800", caption: "Panel discussion at the Digital Communication & Brand Impact Summit" },
    { id: 4, src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", caption: "Analyzing and measuring PR campaign performance indicators" },
    { id: 5, src: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800", caption: "Live media coverage and exclusive press interviews with leaders" },
    { id: 6, src: "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=800", caption: "Communications team meeting to develop crisis response guidelines" },
    { id: 7, src: "https://images.unsplash.com/photo-1521791136368-1a46827d0a92?auto=format&fit=crop&q=80&w=800", caption: "Signing strategic partnership agreements with global media agencies" },
    { id: 8, src: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&q=80&w=800", caption: "Crafting strategic content and building the brand narrative" },
];

interface GalleryPhoto {
    id: number;
    src: string;
    caption: string;
}

export default function GalleryPage() {
    const { language } = useLanguage();
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState<number | null>(null);
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

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
                    const strapiPhotos: GalleryPhoto[] = [];
                    data.forEach((item: any, idx: number) => {
                        const attr = item.attributes || item;
                        const url = extractImageUrl(attr.image);
                        if (url) {
                            const caption = language === 'ar'
                                ? (attr.caption_ar || attr.caption_en || '')
                                : (attr.caption_en || attr.caption_ar || '');
                            strapiPhotos.push({
                                id: item.id || idx,
                                src: url,
                                caption,
                            });
                        }
                    });

                    if (strapiPhotos.length > 0) {
                        setPhotos(strapiPhotos);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) {
                console.error('Gallery API fetch failed, using local photos:', e);
            }

            setPhotos(language === 'ar' ? LOCAL_PHOTOS_AR : LOCAL_PHOTOS_EN);
            setLoading(false);
        }

        loadGallery();
    }, [language]);

    // Auto-rotate featured image
    useEffect(() => {
        if (photos.length === 0) return;
        autoPlayRef.current = setInterval(() => {
            setFeaturedIndex(prev => (prev + 1) % photos.length);
        }, 6000);
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [photos.length]);

    const selectFeatured = useCallback((index: number) => {
        setFeaturedIndex(index);
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
            setFeaturedIndex(prev => (prev + 1) % photos.length);
        }, 6000);
    }, [photos.length]);

    const goNext = useCallback(() => {
        selectFeatured((featuredIndex + 1) % photos.length);
    }, [featuredIndex, photos.length, selectFeatured]);

    const goPrev = useCallback(() => {
        selectFeatured((featuredIndex - 1 + photos.length) % photos.length);
    }, [featuredIndex, photos.length, selectFeatured]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightbox !== null) {
                if (e.key === 'Escape') setLightbox(null);
                if (e.key === 'ArrowRight') setLightbox(prev => prev !== null ? Math.min(prev + 1, photos.length - 1) : null);
                if (e.key === 'ArrowLeft') setLightbox(prev => prev !== null ? Math.max(prev - 1, 0) : null);
            } else {
                if (e.key === 'ArrowRight') goNext();
                if (e.key === 'ArrowLeft') goPrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightbox, photos.length, goNext, goPrev]);

    // Scroll carousel thumb into view
    useEffect(() => {
        if (carouselRef.current) {
            const thumb = carouselRef.current.children[featuredIndex] as HTMLElement;
            if (thumb) {
                thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [featuredIndex]);

    const featured = photos[featuredIndex];
    const photoCount = photos.length;

    if (loading) {
        return (
            <main className={styles.main}>
                <div className={styles.loadingContainer}>
                    <div style={{ fontSize: '56px' }} className={styles.loadingSpinner}>📢</div>
                    <p className={styles.loadingText}>
                        {language === 'ar' ? 'جاري تحميل المعرض...' : 'Loading gallery...'}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            {/* Featured Hero Image */}
            <motion.section
                className={styles.heroSection}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className={styles.heroWrapper}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={featured.id}
                            className={styles.heroImageContainer}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Image
                                src={featured.src}
                                alt={featured.caption}
                                fill
                                className={styles.heroImage}
                                sizes="100vw"
                                priority
                            />
                            <div className={styles.heroGradient} />
                        </motion.div>
                    </AnimatePresence>

                    {/* Hero Caption */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`caption-${featured.id}`}
                            className={styles.heroCaption}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            <p className={styles.heroCaptionText}>{featured.caption}</p>
                            <span className={styles.heroCounter}>
                                {featuredIndex + 1} / {photoCount}
                            </span>
                        </motion.div>
                    </AnimatePresence>

                    {/* Hero Controls */}
                    <button className={`${styles.heroNav} ${styles.heroNavPrev}`} onClick={goPrev} aria-label="Previous">
                        <ChevronLeft size={28} />
                    </button>
                    <button className={`${styles.heroNav} ${styles.heroNavNext}`} onClick={goNext} aria-label="Next">
                        <ChevronRight size={28} />
                    </button>

                    {/* Expand Button */}
                    <button className={styles.heroExpand} onClick={() => setLightbox(featuredIndex)} aria-label="View fullscreen">
                        <Expand size={20} />
                    </button>
                </div>
            </motion.section>

            {/* Thumbnail Carousel */}
            <motion.section
                className={styles.carouselSection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <div className={styles.carouselTrack} ref={carouselRef}>
                    {photos.map((photo, index) => (
                        <motion.div
                            key={photo.id}
                            className={`${styles.thumb} ${index === featuredIndex ? styles.thumbActive : ''}`}
                            onClick={() => selectFeatured(index)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Image
                                src={photo.src}
                                alt={photo.caption}
                                fill
                                className={styles.thumbImage}
                                sizes="200px"
                            />
                            <div className={styles.thumbOverlay}>
                                <ZoomIn size={18} />
                            </div>
                            {index === featuredIndex && (
                                <motion.div
                                    className={styles.thumbIndicator}
                                    layoutId="activeThumb"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Grid Section */}
            <motion.section
                className={styles.gridSection}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className={styles.gridTitle}>
                    {language === 'ar' ? 'جميع الصور' : 'All Photos'}
                </h2>
                <div className={styles.masonryGrid}>
                    {photos.map((photo, index) => (
                        <motion.div
                            key={photo.id}
                            className={`${styles.gridCard} ${index % 5 === 0 ? styles.gridCardLarge : ''}`}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.06 }}
                            onClick={() => setLightbox(index)}
                        >
                            <Image
                                src={photo.src}
                                alt={photo.caption}
                                fill
                                className={styles.gridImage}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className={styles.gridOverlay}>
                                <ZoomIn size={24} className={styles.gridZoomIcon} />
                                <p className={styles.gridCaption}>{photo.caption}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox !== null && (
                    <motion.div
                        className={styles.lightbox}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setLightbox(null)}
                    >
                        <motion.div
                            className={styles.lightboxContent}
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>
                                <X size={22} />
                            </button>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={lightbox}
                                    className={styles.lightboxImageWrap}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <Image
                                        src={photos[lightbox].src}
                                        alt={photos[lightbox].caption}
                                        fill
                                        className={styles.lightboxImage}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            <div className={styles.lightboxFooter}>
                                <p className={styles.lightboxCaption}>{photos[lightbox].caption}</p>
                                <span className={styles.lightboxCounter}>{lightbox + 1} / {photoCount}</span>
                            </div>

                            {lightbox > 0 && (
                                <button className={styles.lightboxPrev} onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}>
                                    <ChevronLeft size={28} />
                                </button>
                            )}
                            {lightbox < photos.length - 1 && (
                                <button className={styles.lightboxNext} onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}>
                                    <ChevronRight size={28} />
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
