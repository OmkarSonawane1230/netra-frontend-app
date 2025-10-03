'use client'
import LoginPage from "./login/page";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export default function Home() {

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This component's only job is to figure out where the user should go.
    const user = localStorage.getItem('user');

    if (user) {
      // If user is logged in, send them to the dashboard.
      // The (dashboard) folder's page.js will handle the rest.
      router.push('/attendance'); 
    } else {
      // If no user, send them to the login page.
      router.push('/login');
    }
    // We don't need to setLoading(false) because the page will be replaced.
  }, [router]);

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


