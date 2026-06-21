"use client";

import styles from './page.module.css';
import { useLanguage } from '@/i18n/LanguageContext';
import { Users, Target, Award, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const content = {
        ar: {
            title: "من نحن",
            subtitle: "منصة وَجْه للعلاقات العامة",
            description: "وَجْه هي منصتكم الرقمية المتكاملة والمتخصصة في العلاقات العامة والاتصال المؤسسي. نسعى لتمكين المؤسسات والشركات من صياغة وإدارة رسائلها الإعلامية بذكاء وفعالية، وتوفير التحليلات والاستشارات اللازمة لبناء سمعة قوية ومستدامة.",
            mission: {
                title: "رسالتنا",
                text: "تيسير وتطوير عمليات الاتصال المؤسسي من خلال تزويد عملائنا بأدوات مبتكرة، استشارات دقيقة، ومحتوى ذكي يساهم في إحداث تأثير إيجابي ملموس."
            },
            vision: {
                title: "رؤيتنا",
                text: "أن نكون الشريك الموثوق والمنصة الأولى إقليمياً في قياس وإدارة السمعة المؤسسية والاتصال الرقمي الحديث."
            },
            team: {
                title: "فريقنا",
                text: "نخبة من خبراء العلاقات العامة، مستشاري الإعلام، ومطوري التقنيات التحليلية الذين يجمعهم شغف واحد: الارتقاء بصوت مؤسستكم وسمعتها."
            },
            values: {
                title: "قيمنا",
                text: "المصداقية في النشر، الاحترافية في التخطيط، والابتكار في إيجاد الحلول الاتصالية الفعالة والمؤثرة."
            }
        },
        en: {
            title: "About Us",
            subtitle: "Wajh PR & Communications Platform",
            description: "Wajh is your integrated digital platform specialized in public relations and corporate communications. We strive to empower institutions and companies to formulate and manage their media messages intelligently and effectively, providing the analytics and consulting needed to build a strong and sustainable reputation.",
            mission: {
                title: "Our Mission",
                text: "To facilitate and develop corporate communication by equipping our clients with innovative tools, accurate consulting, and smart content that drives positive and tangible impact."
            },
            vision: {
                title: "Our Vision",
                text: "To be the trusted partner and leading regional platform for measuring and managing corporate reputation and modern digital communication."
            },
            team: {
                title: "Our Team",
                text: "A dedicated team of PR experts, media consultants, and analytical technology developers united by a single goal: elevating your institution's voice and reputation."
            },
            values: {
                title: "Our Values",
                text: "Credibility in publishing, professionalism in planning, and innovation in creating effective and impactful communication solutions."
            }
        }
    };

    const c = isRTL ? content.ar : content.en;

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>📢</div>
                    <h1 className={styles.title}>{c.title}</h1>
                    <p className={styles.subtitle}>{c.subtitle}</p>
                </div>
            </section>

            <section className={styles.content}>
                <div className={styles.container}>
                    <p className={styles.description}>{c.description}</p>

                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <Target className={styles.cardIcon} size={32} />
                            <h3 className={styles.cardTitle}>{c.mission.title}</h3>
                            <p className={styles.cardText}>{c.mission.text}</p>
                        </div>

                        <div className={styles.card}>
                            <Award className={styles.cardIcon} size={32} />
                            <h3 className={styles.cardTitle}>{c.vision.title}</h3>
                            <p className={styles.cardText}>{c.vision.text}</p>
                        </div>

                        <div className={styles.card}>
                            <Users className={styles.cardIcon} size={32} />
                            <h3 className={styles.cardTitle}>{c.team.title}</h3>
                            <p className={styles.cardText}>{c.team.text}</p>
                        </div>

                        <div className={styles.card}>
                            <HeartHandshake className={styles.cardIcon} size={32} />
                            <h3 className={styles.cardTitle}>{c.values.title}</h3>
                            <p className={styles.cardText}>{c.values.text}</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
