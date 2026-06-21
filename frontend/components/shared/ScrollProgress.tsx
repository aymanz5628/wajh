'use client';

import { useEffect, useState } from 'react';
import styles from './ScrollProgress.module.css';

export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(scrollPercent);
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        </div>
    );
}
