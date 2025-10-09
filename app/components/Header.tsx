'use client'
import { useUI } from '../context/UIContext';
import { BellIcon, UserIcon } from 'lucide-react';
import styles from '@/app/styles/views/DashboardLayout.module.css';
import { useRouter } from 'next/navigation';


export default function Header() {
    const { activeModule, userRole } = useUI();
    const router = useRouter();

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <h1 className={styles.pageTitle}>
                    {activeModule === '' ? (
                        userRole === 'hod' ? 'HOD Dashboard'
                        : userRole === 'principal' ? 'Principal Dashboard'
                        : userRole === 'staff' ? 'Staff Dashboard'
                        : userRole === 'mentor' ? 'Mentor Dashboard'
                        : 'Dashboard Overview'
                    ) : (
                        activeModule.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                    )}
                </h1>
            </div>

            <div className={styles.headerRight}>
                <button
                    className={styles.headerButton}
                    onClick={() => router.push(`/${userRole}/notifications`)}
                    data-testid="button-notifications"
                    title="Notifications"
                >
                    <BellIcon size={24} />
                </button>

                <div className={styles.userProfile}>
                    <button
                        className={styles.profileButton}
                        onClick={() => router.push(`/${userRole}/profile`)}
                        data-testid="button-profile"
                    >
                        <UserIcon size={24} />
                    </button>
                </div>
            </div>
        </header>
    );
}