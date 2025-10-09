import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';

export default function DashboardLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {/* Side Navigation */}
            <Sidebar />

            {/* Header and Main Content */}
            <MainContent>
                {children}
            </MainContent>

            {/* BackgroundScheduler is mounted globally in RootLayout to avoid duplicate instances */}
        </>
    );
}
