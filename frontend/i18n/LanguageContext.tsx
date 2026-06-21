"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ar';
  const saved = localStorage.getItem('wajh-language') as Language;
  if (saved && (saved === 'ar' || saved === 'en')) return saved;
  return 'ar';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialLang = getInitialLanguage();
    setLanguageState(initialLang);
    document.documentElement.lang = initialLang;
    document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem('wajh-language', language);
    }
  }, [language, mounted]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    const trans = translations[language] as Record<string, string>;
    return trans[key] || key;
  }, [language]);

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'ar', setLanguage, t, dir: 'rtl' }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
