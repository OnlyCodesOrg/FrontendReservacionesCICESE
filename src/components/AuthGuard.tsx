import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole = [] 
}) => {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (requiredRole.length > 0 && user) {
        const userRole = user.rol.nombre.toLowerCase();
        const hasRequiredRole = requiredRole.some(role => 
          userRole.includes(role.toLowerCase())
        );
        
        if (!hasRequiredRole) {
          router.push('/auth/login');
        }
      }
    }
  }, [isAuthenticated, loading, requiredRole, router, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole.length > 0 && user) {
    const userRole = user.rol.nombre.toLowerCase();
    const hasRequiredRole = requiredRole.some(role => 
      userRole.includes(role.toLowerCase())
    );
    
    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
};
