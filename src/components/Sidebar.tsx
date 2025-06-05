"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

type User = {
  id: number;
  email: string;
  id_rol: number;
  nombre: string;
  apellidos: string;
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          localStorage.removeItem("access_token");
          setUser(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API_URL]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/login");
  };

  const menuItems = [
    {
      icon: "🏠",
      label: "Inicio",
      href: "/dashboard"
    },
    {
      icon: "📅",
      label: "Calendario",
      href: "/dashboard/calendario"
    },
    {
      icon: "📋",
      label: "Mis Solicitudes",
      href: "/dashboard/reservas"
    },
    {
      icon: "🏢",
      label: "Salas",
      href: "/dashboard/salas"
    }
  ];

  const isActive = (href: string) => pathname === href;
  const isLoginPage = pathname === "/login";

  //Si no hay usuario, no mostrar el sidebar
//   if ((!user && !loading) || isLoginPage) {
//     return null;
//   }
    if (isLoginPage) {
    return null;
    }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Logo y Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src="https://sic.cultura.gob.mx/images/62215"
            alt="Logo CICESE"
            width={32}
            height={32}
            className="dark:invert"
          />
          <span className="font-semibold text-gray-900 dark:text-white">
            CICESE
          </span>
        </div>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sección de Soporte */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/soporte"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="text-lg">❓</span>
          <span>Soporte</span>
        </Link>
      </div>

      {/* Usuario y Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="text-sm text-gray-500">Cargando...</div>
        ) : user ? (
          <div className="space-y-3">
            {/* Info del Usuario */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.nombre} {user.apellidos}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            
            {/* Botón Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <span>🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}