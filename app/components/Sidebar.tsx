'use client'
import { useUI } from "@/app/context/UIContext";
import styles from '@/app/styles/views/Sidebar.module.css';
import { Button } from './ui/Button';
import { useRouter, usePathname } from 'next/navigation';

import {
  HomeIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  CalendarIcon,
  UsersIcon,
  BuildingIcon,
  BookOpenIcon,
  ChartBarIcon,
  UserCogIcon,
  MenuIcon,
  XIcon
} from "lucide-react";

type Role = 'principal' | 'hod' | 'mentor' | 'staff';

const navLinks: Record<Role, { name: string; path: string; icon: React.ElementType; }[]> = {
  principal: [
    { name: "Dashboard Home", path: "", icon: HomeIcon },
    { name: "Manage Departments", path: "departments", icon: BuildingIcon },
    { name: "Manage HODs", path: "hods", icon: UserCogIcon },
    { name: "Attendance Report", path: "reports", icon: ChartBarIcon },
  ],
  hod: [
    { name: "Dashboard Home", path: "", icon: HomeIcon },
    { name: "Manage Staff", path: "staffs", icon: UsersIcon },
    { name: "Manage Subjects", path: "subjects", icon: BookOpenIcon },
    { name: "Timetable", path: "timetable", icon: CalendarIcon },
    { name: "Attendance Report", path: "reports", icon: ChartBarIcon },
],
mentor: [
    { name: "Dashboard Home", path: "", icon: HomeIcon },
    { name: "Live Attendance", path: "attendance", icon: ClipboardListIcon },
    { name: "Manage Students", path: "students", icon: GraduationCapIcon },
    { name: "Attendance Report", path: "reports", icon: ChartBarIcon },
],
staff: [
    { name: "Dashboard Home", path: "", icon: HomeIcon },
    { name: "Live Attendance", path: "attendance", icon: ClipboardListIcon },
    { name: "Attendance Report", path: "reports", icon: ChartBarIcon },
  ],
};

export default function Sidebar() {
    const { sidebarCollapsed, toggleSidebar } = useUI();
    const { activeModule, setActiveModule } = useUI();
    const pathname = usePathname();
    const router = useRouter();
    const role = pathname.split("/")[1] as Role;

    console.log("Active route page: ", role);

    const handleToggleSidebar = () => {
        toggleSidebar();
    };

    const navItems = navLinks[role] || [];

    return (
        <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    {!sidebarCollapsed && <span className={styles.logoText}>Netra</span>}
                </div>
                <Button
                    className={styles.toggleButton}
                    onClick={handleToggleSidebar}
                    icon={sidebarCollapsed ? <MenuIcon size={24} /> : <XIcon size={24} />}
                />
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <Button
                                    className={`${styles.navItem} ${activeModule === item.path ? styles.active : ''}`}
                                    data-testid={`nav-${item.path}`}
                                    title={sidebarCollapsed ? item.name : undefined}
                                    icon={<Icon size={24} className={styles.navIcon} />}
                                    onClick={() => router.push(`/${role}${(item.path.length == 0) ? '' : `/${item.path}`}`)}
                                >
                                    {!sidebarCollapsed && <span className={styles.navLabel}>{item.name}</span>}
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}