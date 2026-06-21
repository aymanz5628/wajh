import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./immersive.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/shared/ScrollProgress";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

const thmanyahSans = localFont({
    src: [
        { path: './fonts/thmanyahsans-Light.woff2', weight: '300', style: 'normal' },
        { path: './fonts/thmanyahsans-Regular.woff2', weight: '400', style: 'normal' },
        { path: './fonts/thmanyahsans-Medium.woff2', weight: '500', style: 'normal' },
        { path: './fonts/thmanyahsans-Bold.woff2', weight: '700', style: 'normal' },
        { path: './fonts/thmanyahsans-Black.woff2', weight: '900', style: 'normal' },
    ],
    variable: "--font-thmanyah-sans",
    display: "swap",
});

const thmanyahSerifDisplay = localFont({
    src: [
        { path: './fonts/thmanyahserifdisplay-Light.woff2', weight: '300', style: 'normal' },
        { path: './fonts/thmanyahserifdisplay-Regular.woff2', weight: '400', style: 'normal' },
        { path: './fonts/thmanyahserifdisplay-Medium.woff2', weight: '500', style: 'normal' },
        { path: './fonts/thmanyahserifdisplay-Bold.woff2', weight: '700', style: 'normal' },
        { path: './fonts/thmanyahserifdisplay-Black.woff2', weight: '900', style: 'normal' },
    ],
    variable: "--font-thmanyah-serif-display",
    display: "swap",
});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    weight: ["400", "600", "700"],
    display: "swap",
});

export const metadata: Metadata = {
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.png",
        apple: "/apple-touch-icon.png",
    },
    title: "وجه | Wajh - منصة العلاقات العامة",
    description: "وجه هي منصتك المتخصصة في العلاقات العامة — محتوى احترافي، رؤى استراتيجية، وأدوات تواصل متكاملة",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body className={`${thmanyahSans.variable} ${thmanyahSerifDisplay.variable} ${inter.variable}`}>
                <ThemeProvider>
                    <LanguageProvider>
                        <ScrollProgress />
                        <Header />
                        <main style={{ minHeight: 'calc(100vh - 200px)' }}>
                            {children}
                        </main>
                        <Footer />
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
