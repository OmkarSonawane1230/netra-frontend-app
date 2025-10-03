"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type Role = 'principal' | 'hod' | 'mentor' | 'staff';

type UIContextType = {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;

    activeModule: string;
    setActiveModule: (path: string) => void;

    isAuthenticated: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;

    userRole: Role | undefined;
    setUserRole: (userRole: Role | undefined) => void;

    // later you can add more states like:
    // theme: "light" | "dark";
    // setTheme: (theme: "light" | "dark") => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeModule, setActiveModule] = useState<string>("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<Role>();

    const router = useRouter();
    const pathname = usePathname();
    // Update active module whenever route changes
    useEffect(() => {
        const segments = pathname?.split('/') || [];

        setUserRole(segments[1] as Role)
        setActiveModule(segments[2] || '');

        if (!isAuthenticated) {
            console.log('User not authenticated, redirect to login');
            // router.push('/login');
        }

        if (isAuthenticated && pathname === '/') {
            console.log('User is authenticated');
            router.push('/dashboard'); // or redirect to default
        }
    }, [pathname, isAuthenticated, router, userRole]);


    const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

    return (
        <UIContext.Provider
            value={{
                sidebarCollapsed,
                toggleSidebar,
                activeModule,
                setActiveModule,
                isAuthenticated,
                setIsAuthenticated,
                userRole,
                setUserRole
            }}
        >
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error("useUI must be used inside UIProvider");
    }
    return context;
}
