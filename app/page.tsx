'use client'
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check localStorage directly as a fallback
    const storedUser = localStorage.getItem('user');
    const localUser = storedUser ? JSON.parse(storedUser) : null;
    
    // Prioritize AuthContext, but fall back to localStorage
    const effectiveAuth = isAuthenticated || !!localUser;
    const effectiveUser = user || localUser;

    
    if (effectiveAuth) {
      router.replace(`/${effectiveUser.user.role}`);
    } else if (!effectiveAuth) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  // Show loading while determining where to redirect
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '24px',
      fontFamily: 'sans-serif'
    }}>
      Loading Project Netra...
    </div>
  );
}


