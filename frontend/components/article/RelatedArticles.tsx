"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { getArticles } from '@/lib/data';
import styles from './RelatedArticles.module.css';

interface RelatedArticlesProps {
  currentArticleSlug?: string;
  categorySlug?: string;
}

export default function RelatedArticles({ currentArticleSlug, categorySlug }: RelatedArticlesProps) {
  const { language } = useLanguage();
  const allArticles = getArticles(language);

  // Filter out the current article, and try to prioritize articles in the same category
  const related = allArticles
    .filter(art => art.slug !== currentArticleSlug)
    .sort((a, b) => {
      if (categorySlug) {
        const aSame = a.category.slug === categorySlug ? 1 : 0;
        const bSame = b.category.slug === categorySlug ? 1 : 0;
        return bSame - aSame; // prioritizes same category
      }
      return 0;
    })
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>
        {language === 'ar' ? 'اقرأ أيضاً' : 'Related Articles'}
      </h3>
      <div className={styles.list}>
        {related.map(article => (
          <Link href={`/articles/${article.slug}`} key={article.slug} className={styles.item}>
             <div className={styles.content}>
               <span className={styles.category}>{article.category.name}</span>
               <h4 className={styles.title}>{article.title}</h4>
             </div>
             <div className={styles.imageWrapper}>
               <Image src={article.image} alt={article.title} fill className={styles.image} sizes="160px" />
             </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
