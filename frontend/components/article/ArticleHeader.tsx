"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import styles from './ArticleHeader.module.css';

interface ArticleHeaderProps {
  title: string;
  excerpt: string;
  category: string;
  categorySlug?: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
}

export default function ArticleHeader({ title, excerpt, category, categorySlug, author, date }: ArticleHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className={styles.header}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">{t('nav.home')}</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <Link href={`/category/${categorySlug || 'pr'}`}>{category}</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>{title.length > 30 ? title.slice(0, 30) + '...' : title}</span>
      </nav>

      <Link href={`/category/${categorySlug || 'pr'}`} className={styles.categoryTag}>
        {category}
      </Link>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.excerpt}>{excerpt}</p>
      
      <div className={styles.meta}>
        <div className={styles.avatarWrapper}>
           <Image 
             src={author.avatar} 
             alt={author.name} 
             fill 
             className={styles.authorAvatar}
           />
        </div>
        <div className={styles.metaText}>
           <span className={styles.authorName}>{author.name}</span>
           <span className={styles.date}>{date}</span>
        </div>
      </div>
    </header>
  );
}
