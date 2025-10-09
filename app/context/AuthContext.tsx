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
  isVerifying: boolean;
  setIsVerifying: (v: boolean) => void;
  currentLecture: any;
  setCurrentLecture: (l: any) => void;
}>({
  user: null,
  login: async (_username: string, _password: string) => {},
  logout: () => {},
  isAuthenticated: false,
  isVerifying: false,
  setIsVerifying: () => {},
  currentLecture: null,
  setCurrentLecture: () => {},
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
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [currentLecture, setCurrentLecture] = useState<any>(null);
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
        // Normalize naming differences between backend and frontend
        const normalizedUser = {
          username: parsedUser.username || parsedUser.user?.username || parsedUser.user?.name || null,
          fullName: parsedUser.fullName || parsedUser.user?.fullName || parsedUser.user?.full_name || parsedUser.full_name || null,
          role: (parsedUser.role || parsedUser.user?.role || parsedUser.user?.role || null),
          department: parsedUser.department || parsedUser.user?.department || parsedUser.user?.dept || null,
          // Ensure access_token is available on the user object for components that read it
          access_token: token || parsedUser.access_token || parsedUser.token || null,
          // backend returns assignedClass while DB uses assigned_class
          assignedClass: parsedUser.assignedClass ?? parsedUser.user?.assignedClass ?? parsedUser.assigned_class ?? parsedUser.user?.assigned_class ?? null,
          // Keep other props if present
          ...parsedUser
        };
        setUser(normalizedUser as unknown as LoginResponse);
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
  const dataAny: any = await apiLogin(username, password);
  const token: string = dataAny?.access_token || '';
    // Write token
    if (token) localStorage.setItem('token', token);

    // The backend returns { access_token, user: { ... } }
  const serverUser: any = dataAny?.user || dataAny;

    // Normalize the user object keys so frontend can reliably read role/assignedClass/department
    const normalizedUser = {
  username: serverUser.username || serverUser.user?.username || null,
  fullName: serverUser.fullName || serverUser.user?.fullName || serverUser.user?.full_name || serverUser.full_name || null,
  role: serverUser.role || serverUser.user?.role || null,
  department: serverUser.department || serverUser.user?.department || serverUser.user?.dept || null,
  // include access_token so other components can use user.access_token
  access_token: token,
  assignedClass: serverUser.assignedClass ?? serverUser.assigned_class ?? serverUser.user?.assignedClass ?? serverUser.user?.assigned_class ?? null,
      ...serverUser
    };

    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser as unknown as LoginResponse);

    // Redirect directly to user's dashboard to avoid home page redirect loop
    if (normalizedUser.role) {
      router.push(`/${normalizedUser.role}`);
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
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isVerifying, setIsVerifying, currentLecture, setCurrentLecture }}>
      {children}
    </AuthContext.Provider>
  );
};