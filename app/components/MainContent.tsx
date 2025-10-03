'use client'
import { useUI } from '../context/UIContext';
import styles from '@/app/styles/views/DashboardLayout.module.css';
import Header from './Header';

export default function MainContent({ children }: { children: React.ReactNode }) {
    const { sidebarCollapsed, toggleSidebar } = useUI();
    const { activeModule, setActiveModule } = useUI();

    return (
        <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
            <Header />
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}