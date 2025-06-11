"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  rol: {
    id: number;
    nombre: string;
  };
  departamento?: {
    id: number;
    nombre: string;
  } | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  getUserId: () => number | null;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
  }>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/auth/login', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    checkAuth();
  }, []);

  // Efecto para redirigir si ya está autenticado y está en login
  useEffect(() => {
    if (!authState.loading && authState.isAuthenticated && pathname === '/auth/login') {
      router.push('/dashboard/salas');
    }
  }, [authState.isAuthenticated, authState.loading, pathname, router]);

  const checkAuth = async () => {
    try {
      const accessToken = Cookies.get('access_token');
      const userStr = Cookies.get('user');

      if (accessToken && userStr) {
        const user = JSON.parse(userStr);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        
        // Solo redirigir a login si no estamos en una ruta pública
        if (!isPublicRoute) {
          router.push('/auth/login');
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      logout();
    }
  };

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    Cookies.set('access_token', accessToken, { expires: 1 });
    Cookies.set('refresh_token', refreshToken, { expires: 7 });
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });
    
    setAuthState({
      isAuthenticated: true,
      user: userData,
      loading: false,
    });
  };

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
    
    router.push('/');
  };

  const getUserId = (): number | null => {
    if (!authState.isAuthenticated || !authState.user) {
      return null;
    }
    return authState.user.id;
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = Cookies.get('access_token');

    if (!token) {
      throw new Error('No hay token de acceso');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Si recibimos 401, intentar refrescar el token
    if (response.status === 401) {
      console.log('Token expirado, intentando refrescar...');
      // Lógica de refresh simplificada por ahora
      logout();
    }

    return response;
  };

  // No renderizar contenido protegido si no está autenticado (excepto en rutas públicas)
  if (!authState.loading && !authState.isAuthenticated && !isPublicRoute) {
    return null;
  }

  // Mostrar loading spinner mientras se verifica la autenticación
  if (authState.loading && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        getUserId,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 