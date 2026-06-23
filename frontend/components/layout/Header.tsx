"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Search, Globe, Moon, Sun } from 'lucide-react';
import styles from './Header.module.css';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { language, setLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [query, setQuery] = useState('');
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 900);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setShowMobileSearch(false);
            setQuery('');
        }
    };

    const handleMobileSearchClick = () => {
        if (isMobile) {
            setShowMobileSearch(!showMobileSearch);
        }
    };

    const isActive = (path: string) => {
        if (path.startsWith('/#')) return false;
        return pathname === path || pathname?.startsWith(path + '/');
    };

    const toggleLanguage = () => {
        setLanguage(language === 'ar' ? 'en' : 'ar');
    };

    const navLinks = [
        { href: '/', label: t('nav.home'), exact: true },
        { href: '/category/topics', label: t('nav.topics') },
        { href: '/#programs', label: t('nav.programs') },
        { href: '/#documentaries', label: t('nav.documentaries') },
        { href: '/gallery', label: t('nav.gallery') },
    ];

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('/#')) {
            if (pathname === '/') {
                e.preventDefault();
                const id = href.replace('/#', '');
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <Image 
                        src="/logo.svg" 
                        alt="وجه" 
                        width={44} 
                        height={44} 
                        className={styles.logoIcon}
                        priority
                    />
                    <span className={styles.logoText}>
                        {language === 'ar' ? 'وجه' : 'Wajh'}
                    </span>
                </Link>

                {/* Navigation */}
                <nav className={styles.nav}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.navLink} ${(link.exact ? pathname === link.href : isActive(link.href)) ? styles.active : ''}`}
                            onClick={(e) => handleLinkClick(e, link.href)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className={styles.actions}>
                    {/* Desktop Search Form */}
                    <form onSubmit={handleSearch} className={styles.searchForm}>
                        <input
                            type="text"
                            placeholder={t('nav.search')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        <button type="submit" className={styles.searchButton}>
                            <Search size={18} />
                        </button>
                    </form>
                    
                    {/* Mobile Search Button */}
                    <button 
                        type="button"
                        onClick={handleMobileSearchClick}
                        className={styles.mobileSearchBtn}
                        aria-label="Search"
                    >
                        <Search size={18} />
                    </button>
                    
                    <button 
                        onClick={toggleTheme}
                        className={styles.themeToggle}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    
                    <button 
                        onClick={toggleLanguage}
                        className={styles.langToggle}
                        aria-label="Toggle language"
                    >
                        <Globe size={18} />
                        <span>{language === 'ar' ? 'EN' : 'AR'}</span>
                    </button>
                </div>
            </div>
            
            {/* Mobile Search Overlay */}
            {showMobileSearch && (
                <div className={styles.mobileSearchOverlay}>
                    <form onSubmit={handleSearch} className={styles.mobileSearchForm}>
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'ابحث هنا...' : 'Search...'}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className={styles.mobileSearchInput}
                            autoFocus
                        />
                        <button type="submit" className={styles.mobileSearchSubmit}>
                            <Search size={20} />
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setShowMobileSearch(false)}
                            className={styles.mobileSearchClose}
                        >
                            ✕
                        </button>
                    </form>
                </div>
            )}
        </header>
    );
}
