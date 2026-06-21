'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
    id: string | number;
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    category: { name: string; slug: string };
    author?: { name: string; avatar: string };
    date?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
    id,
    slug,
    title,
    excerpt,
    image,
    category,
}) => {
    const linkSlug = slug || (typeof id === 'string' ? id : id.toString());

    return (
        <div className={styles.card}>
            <Link href={`/articles/${linkSlug}`} className={styles.imageWrapper}>
                <Image
                    src={image}
                    alt={title}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </Link>

            <div className={styles.content}>
                <Link href={`/category/${category.slug}`} className={styles.category}>
                    {category.name}
                </Link>

                <Link href={`/articles/${linkSlug}`}>
                    <h3 className={styles.title}>{title}</h3>
                </Link>
                
                <p className={styles.excerpt}>{excerpt}</p>
            </div>
        </div>
    );
};

export default ArticleCard;
