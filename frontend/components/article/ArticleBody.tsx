'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/i18n/LanguageContext';
import styles from './ArticleBody.module.css';

interface ArticleBodyProps {
  content: string;
  image?: string;
  rawHtml?: string;
  useRawHtml?: boolean;
  articleTitle?: string;
}

const socialShareStyles = `
  .social-share-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-top: 50px;
    padding: 30px 0;
  }
  .social-share-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .social-share-buttons {
    display: flex;
    gap: 18px;
    align-items: center;
  }
  .share-btn {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .share-btn:hover {
    transform: translateY(-6px) scale(1.1);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  .share-twitter:hover { background: linear-gradient(135deg, #1DA1F2, #0D8BD9); border-color: transparent; }
  .share-facebook:hover { background: linear-gradient(135deg, #1877F2, #0D65D9); border-color: transparent; }
  .share-linkedin:hover { background: linear-gradient(135deg, #0A66C2, #004182); border-color: transparent; }
  .share-whatsapp:hover { background: linear-gradient(135deg, #25D366, #128C7E); border-color: transparent; }
  @media (max-width: 768px) {
    .share-btn { width: 48px; height: 48px; }
    .share-btn svg { width: 18px; height: 18px; }
    .social-share-buttons { gap: 14px; }
  }
`;

export default function ArticleBody({ content, image, rawHtml, useRawHtml, articleTitle }: ArticleBodyProps) {
  const { language } = useLanguage();
  const rawHtmlRef = useRef<HTMLDivElement>(null);

  const shouldUseRawHtml = useRawHtml && rawHtml && rawHtml.trim().length > 0;
  const finalContent = shouldUseRawHtml ? rawHtml : content;
  const isHtml = finalContent && (finalContent.includes('<') || finalContent.includes('&lt;'));

  useEffect(() => {
    if (shouldUseRawHtml && rawHtmlRef.current && rawHtml) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');
      
      const styleElements = doc.querySelectorAll('style');
      const styleId = 'raw-html-styles-' + Date.now();
      
      document.querySelectorAll('[data-raw-html-style]').forEach(el => el.remove());
      
      styleElements.forEach((styleEl) => {
        const newStyle = document.createElement('style');
        newStyle.textContent = styleEl.textContent;
        newStyle.setAttribute('data-raw-html-style', styleId);
        document.head.appendChild(newStyle);
      });

      const socialStyle = document.createElement('style');
      socialStyle.textContent = socialShareStyles;
      socialStyle.setAttribute('data-raw-html-style', styleId);
      document.head.appendChild(socialStyle);
      
      const bodyContent = doc.body.innerHTML;
      rawHtmlRef.current.innerHTML = bodyContent;

      // ── تشغيل السكريبتات المحقونة من rawhtml ──
      const injectedScripts = rawHtmlRef.current.querySelectorAll('script');
      injectedScripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });

      // ── إذا وُجد wdeck (النمط الجديد) لا نتدخل ──
      const hasNewDeck = !!rawHtmlRef.current.querySelector('.wdeck, #wdeck, [id^="wdeck"]');
      if (hasNewDeck) {
        return () => {
          document.querySelectorAll(`[data-raw-html-style="${styleId}"]`).forEach(el => el.remove());
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
          document.documentElement.classList.remove('has-slides', 'immersive-mode');
          document.body.classList.remove('has-slides', 'immersive-mode');
        };
      }

      // ── المنطق القديم للشرائح (.slide) ──
      const isRTL = rawHtml.includes('direction: rtl') || rawHtml.includes('dir="rtl"');
      const shareLabel = isRTL ? 'شارك' : 'SHARE';
      const currentUrl = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(articleTitle || document.title);
      
      const socialShareHtml = `
        <div class="social-share-container">
          <div class="social-share-label">${shareLabel}</div>
          <div class="social-share-buttons">
            <a href="https://twitter.com/intent/tweet?url=${currentUrl}&text=${title}" target="_blank" rel="noopener noreferrer" class="share-btn share-twitter">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${currentUrl}" target="_blank" rel="noopener noreferrer" class="share-btn share-facebook">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${title}" target="_blank" rel="noopener noreferrer" class="share-btn share-linkedin">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://wa.me/?text=${title}%20${currentUrl}" target="_blank" rel="noopener noreferrer" class="share-btn share-whatsapp">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
      `;

      let keyHandler: ((e: KeyboardEvent) => void) | null = null;
      let observer: IntersectionObserver | null = null;

      const timerId = setTimeout(() => {
        const slides = rawHtmlRef.current?.querySelectorAll('.slide');
        if (slides && slides.length > 0) {
          const lastSlide = slides[slides.length - 1];
          const slideContent = lastSlide.querySelector('.slide-content');
          if (slideContent && !slideContent.querySelector('.social-share-container')) {
            slideContent.insertAdjacentHTML('beforeend', socialShareHtml);
          }

          if (slides.length > 1 && !rawHtmlRef.current?.querySelector('.slide-nav-container')) {
            const presentationContainer = rawHtmlRef.current.querySelector('.presentation') || rawHtmlRef.current;
            presentationContainer.classList.add('true-presentation-mode');
            document.documentElement.classList.add('has-slides');
            document.body.classList.add('has-slides');

            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'slide-dots-container';
            slides.forEach((_, idx) => {
              const dot = document.createElement('button');
              dot.className = `slide-dot ${idx === 0 ? 'active' : ''}`;
              dot.setAttribute('aria-label', `Slide ${idx + 1}`);
              dot.onclick = () => {
                slides[idx].scrollIntoView({ behavior: 'smooth' });
              };
              dotsContainer.appendChild(dot);
            });
            presentationContainer.appendChild(dotsContainer);

            const navContainer = document.createElement('div');
            navContainer.className = 'slide-nav-container';

            const prevBtn = document.createElement('button');
            prevBtn.className = 'slide-nav-btn';
            prevBtn.setAttribute('aria-label', isRTL ? 'الشريحة السابقة' : 'Previous Slide');
            prevBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>';

            const counter = document.createElement('span');
            counter.className = 'slide-nav-counter';
            counter.textContent = isRTL ? `١ / ${slides.length.toLocaleString('ar-EG')}` : `1 / ${slides.length}`;

            const nextBtn = document.createElement('button');
            nextBtn.className = 'slide-nav-btn';
            nextBtn.setAttribute('aria-label', isRTL ? 'الشريحة التالية' : 'Next Slide');
            nextBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>';

            let currentIndex = 0;
            const updateUI = (idx: number) => {
              currentIndex = idx;
              counter.textContent = isRTL ? `${(idx + 1).toLocaleString('ar-EG')} / ${slides.length.toLocaleString('ar-EG')}` : `${idx + 1} / ${slides.length}`;
              prevBtn.disabled = idx === 0;
              nextBtn.disabled = idx === slides.length - 1;
              dotsContainer.querySelectorAll('.slide-dot').forEach((d, i) => {
                if (i === idx) d.classList.add('active');
                else d.classList.remove('active');
              });
            };

            prevBtn.onclick = () => {
              if (currentIndex > 0) slides[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
            };
            nextBtn.onclick = () => {
              if (currentIndex < slides.length - 1) slides[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
            };

            const currentKeyHandler = (e: KeyboardEvent) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') {
                e.preventDefault();
                if (currentIndex < slides.length - 1) slides[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
              } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'PageUp') {
                e.preventDefault();
                if (currentIndex > 0) slides[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
              }
            };
            keyHandler = currentKeyHandler;
            window.addEventListener('keydown', currentKeyHandler);

            navContainer.appendChild(prevBtn);
            navContainer.appendChild(counter);
            navContainer.appendChild(nextBtn);
            presentationContainer.appendChild(navContainer);

            const currentObserver = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  const idx = Array.from(slides).indexOf(entry.target);
                  if (idx !== -1) updateUI(idx);
                }
              });
            }, { threshold: 0.5 });
            observer = currentObserver;

            slides.forEach((s) => currentObserver.observe(s));
          }
        }
      }, 100);
      
      return () => {
        clearTimeout(timerId);
        document.querySelectorAll(`[data-raw-html-style="${styleId}"]`).forEach(el => el.remove());
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.documentElement.classList.remove('has-slides', 'immersive-mode');
        document.body.classList.remove('has-slides', 'immersive-mode');
        if (keyHandler) window.removeEventListener('keydown', keyHandler);
        if (observer) observer.disconnect();
      };
    }
  }, [shouldUseRawHtml, rawHtml, articleTitle]);
  
  return (
    <div className={styles.body}>
      {!shouldUseRawHtml && image && (
        <div className={styles.imageWrapper}>
          <Image src={image} alt="Article Image" fill className={styles.image} />
        </div>
      )}
      
      {shouldUseRawHtml ? (
        <div ref={rawHtmlRef} className={`${styles.rawHtmlContent} raw-html-container`} />
      ) : (
        finalContent && (
          isHtml ? (
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: finalContent }} />
          ) : (
            <div className={styles.content}>
              {finalContent.split('\n').map((paragraph, index) => (
                paragraph.trim() && <p key={index}>{paragraph}</p>
              ))}
            </div>
          )
        )
      )}
      
      {!finalContent && !shouldUseRawHtml && (
        <p className={styles.noContent}>
          {language === 'ar' ? 'لا يوجد محتوى لهذه المقالة.' : 'No content available for this article.'}
        </p>
      )}
    </div>
  );
}
