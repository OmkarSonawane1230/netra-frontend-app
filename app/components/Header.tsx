'use client'
import { useUI } from '../context/UIContext';
import { SunIcon, MoonIcon, BellIcon, UserIcon } from 'lucide-react';
import styles from '@/app/styles/views/DashboardLayout.module.css';



export default function Header() {
    const { sidebarCollapsed, toggleSidebar } = useUI();
    const { activeModule, setActiveModule } = useUI();

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <h1 className={styles.pageTitle}>
                    {activeModule === 'dashboard' ? 'Dashboard Overview' :
                        activeModule.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h1>
            </div>

            <div className={styles.headerRight}>
                {/* <button
                    className={styles.headerButton}
                    onClick={handleToggleDarkMode}
                    data-testid="button-theme-toggle"
                    title="Toggle dark mode"
                >
                    {darkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
                </button> */}

                <button
                    className={styles.headerButton}
                    onClick={() => console.log('Notifications clicked')}
                    data-testid="button-notifications"
                    title="Notifications"
                >
                    <BellIcon size={20} />
                </button>

                <div className={styles.userProfile}>
                    <button
                        className={styles.profileButton}
                        onClick={() => console.log('Profile clicked')}
                        data-testid="button-profile"
                    >
                        <UserIcon size={20} />
                        <span className={styles.profileText}>Admin</span>
                    </button>
                </div>
            </div>
        </header>
    );
}