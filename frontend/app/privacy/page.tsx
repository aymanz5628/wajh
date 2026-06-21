"use client";

import styles from '../about/page.module.css';
import { useLanguage } from '@/i18n/LanguageContext';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const content = {
        ar: {
            title: "سياسة الخصوصية",
            subtitle: "حماية بياناتك أولويتنا",
            description: "نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك في منصة وجه.",
            collection: {
                title: "جمع البيانات",
                text: "نجمع فقط البيانات الضرورية لتحسين تجربتك على منصتنا، مثل تفضيلات اللغة وسجل التصفح."
            },
            protection: {
                title: "حماية البيانات",
                text: "نستخدم أحدث تقنيات الأمان لحماية بياناتك من الوصول غير المصرح به أو الاختراق."
            },
            usage: {
                title: "استخدام البيانات",
                text: "نستخدم بياناتك فقط لتحسين خدماتنا وتخصيص المحتوى بما يناسب اهتماماتك الاتصالية والإعلامية."
            },
            rights: {
                title: "حقوقك",
                text: "لديك الحق في الوصول إلى بياناتك وتعديلها أو حذفها في أي وقت. تواصل معنا للمزيد."
            }
        },
        en: {
            title: "Privacy Policy",
            subtitle: "Protecting Your Data is Our Priority",
            description: "We are committed to protecting your privacy and personal data. This policy explains how we collect, use, and protect your information on Wajh.",
            collection: {
                title: "Data Collection",
                text: "We only collect data necessary to improve your experience on our platform, such as language preferences and browsing history."
            },
            protection: {
                title: "Data Protection",
                text: "We use the latest security technologies to protect your data from unauthorized access or breaches."
            },
            usage: {
                title: "Data Usage",
                text: "We use your data only to improve our services and personalize content according to your communications and media interests."
            },
            rights: {
                title: "Your Rights",
                text: "You have the right to access, modify, or delete your data at any time. Contact us for more info."
            }
        }
    };

    const c = isRTL ? content.ar : content.en;

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <Shield className={styles.heroIcon} size={64} />
                    <h1 className={styles.title}>{c.title}</h1>
                    <p className={styles.subtitle}>{c.subtitle}</p>
                </div>
            </section>

            <section className={styles.content}>
                <div className={styles.container}>
                    <p className={styles.description}>{c.description}</p>

                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <FileText className={styles.cardIcon} size={32} />
                            <h3 className={styles.cardTitle}>{c.collection.title}</h3>
                            <p className={styles.cardText}>{c.collection.text}</p>
                        </div>

                        <div className={styles.card}>
                            <Lock className={styles.cardIcon} size={32} />
                            <h3 className={styles.cardTitle}>{c.protection.title}</h3>
                            <p className={styles.cardText}>{c.protection.text}</p>
                        </div>

                        <div className={styles.card}>
                            <Eye className={styles.cardIcon} size={32} />
                            <h3 className={styles.cardTitle}>{c.usage.title}</h3>
                            <p className={styles.cardText}>{c.usage.text}</p>
                        </div>

                        <div className={styles.card}>
                            <Shield className={styles.cardIcon} size={32} />
                            <h3 className={styles.cardTitle}>{c.rights.title}</h3>
                            <p className={styles.cardText}>{c.rights.text}</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
