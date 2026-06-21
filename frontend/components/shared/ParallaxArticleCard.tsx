'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ParallaxArticleCard.module.css';

interface ParallaxArticleCardProps {
    id: string | number;
    slug: string;
    title: string;
    excerpt?: string;
    image: string;
    category: { name: string; slug: string };
}

const ParallaxArticleCard: React.FC<ParallaxArticleCardProps> = ({
    id,
    slug,
    excerpt,
    title,
    image,
    category,
}) => {
    const linkSlug = slug || (typeof id === 'string' ? id : id.toString());

    return (
        <div className={styles.card}>
            <Link href={`/articles/${linkSlug}`} className={styles.cardLink}>
                <div className={styles.imageContainer}>
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
                <div className={styles.content}>
                    <span className={styles.category}>{category.name}</span>
                    <h3 className={styles.title}>{title}</h3>
                    {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
                </div>
                <div className={styles.overlay} />
            </Link>
        </div>
    );
};

export default ParallaxArticleCard;
