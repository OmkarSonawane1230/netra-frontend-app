// src/context/AuthContext.js (Final Version)
"use client";
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiLogin } from '@/services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext<{
  user: LoginResponse | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}>({
  user: null,
  login: async (_username: string, _password: string) => {},
  logout: () => {},
  isAuthenticated: false,
});
export const useAuth = () => useContext(AuthContext);

import { ReactNode } from 'react';

export interface LoginResponse {
  access_token: string;
  // Add other properties returned by apiLogin here
  [key: string]: any;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            const decoded = jwtDecode(token);
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            }
        } catch (e) {
            console.error("AuthContext - Invalid token:", e);
            localStorage.clear();
        }
    }
    
    setLoading(false);
  }, []);
  
  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/login';
      const isHomePage = pathname === '/';
      const userExists = !!user;
      console.log("AuthContext - Navigation check:", { 
        pathname, 
        userExists, 
        userRole: user?.role, 
        isAuthPage,
        isHomePage
      });
      
      // Only redirect if on login page and user is authenticated
      // Let the home page handle other redirects
      if (userExists && isAuthPage && user.role) {
        console.log("AuthContext - Redirecting from login to dashboard:", user.role);
        router.replace(`/${user.role}`);
      } else if (!userExists && !isAuthPage && !isHomePage) {
        console.log("AuthContext - Redirecting to login (no user, not on home/login)");
        router.replace('/login');
      }
    }
  }, [loading, user, pathname, router]);

  const login = async (username : string, password : string) => {
    const data = await apiLogin(username, password);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    // Redirect directly to user's dashboard to avoid home page redirect loop
    if (data.role) {
      router.push(`/${data.role}`);
    } else {
      router.push('/');
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/login');
  };
  
  if (loading) return <div>Loading Application...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};