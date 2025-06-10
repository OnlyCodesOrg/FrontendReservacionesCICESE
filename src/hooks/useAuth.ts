import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

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

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const useAuth = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Verificar el estado de autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const accessToken = Cookies.get('access_token');
    const userStr = Cookies.get('user');

    if (accessToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  const getUserId = (): number | null => {
    if (!authState.isAuthenticated || !authState.user) {
      return null;
    }
    return authState.user.id;
  };

  const refreshToken = async () => {
    const refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) {
      handleLogout();
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      Cookies.set('access_token', data.data.access_token, { expires: 1 });
      Cookies.set('refresh_token', data.data.refresh_token, { expires: 7 });
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleLogout();
      return false;
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      const accessToken = Cookies.get('access_token');
      if (accessToken) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar cookies y estado
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user');
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
      router.push('/');
    }
  }, [router]);

  return {
    ...authState,
    logout: handleLogout,
    refreshToken,
    checkAuth,
    getUserId,
  };
};
