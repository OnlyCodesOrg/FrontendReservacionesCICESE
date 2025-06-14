"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarIcon,
  HomeIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

type User = {
  sub: number;
  email: string;
  idRol: number;
  nombre: string;
  apellidos: string;
  id_departamento: number;
};

// Función para obtener la navegación basada en el rol del usuario
const getNavigation = (userRole?: { id: number; nombre: string }) => {
  const baseNavigation = [
    { name: "Inicio", href: "/", icon: HomeIcon },
    { name: "Calendario", href: "/dashboard/calendario", icon: CalendarIcon },
  ];

  // Determinar la ruta de solicitudes según el rol
  const isTecnico = userRole?.nombre?.toLowerCase().includes('tecnico') || 
                   userRole?.nombre?.toLowerCase().includes('técnico'); 

  const solicitudesItem = {
    name: "Solicitudes",
    href: isTecnico ? "/dashboard/solicitudes-tecnico" : "/dashboard/solicitudes",
    icon: DocumentTextIcon
  };

  const salasItem = {
    name: "Salas",
    href: isTecnico ? "/dashboard/salas-tecnico" : "/dashboard/salas",
    icon: BuildingOfficeIcon
  };

  return [
    ...baseNavigation,
    solicitudesItem,
    // { name: "Conferencias", href: "/dashboard/conferencia", icon: ClipboardDocumentListIcon },
    salasItem,
    // { name: "Usuarios", href: "/dashboard/usuarios", icon: UserGroupIcon },
    // { name: "Configuración", href: "/dashboard/configuracion", icon: CogIcon },
  ];
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { isAuthenticated, user, loading, logout } = useAuth();

  const isLoginPage = pathname === "/auth/login";

  // Obtener la navegación basada en el rol del usuario
  const navigation = getNavigation(user?.rol);

  if (isLoginPage) {
    return null;
  }

  // Función para determinar si una ruta está activa
  const isRouteActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    } else {
      return pathname === href || pathname.startsWith(href + '/');
    }
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out z-40 border-r border-gray-200 dark:border-gray-700 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-300 z-10"
        aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center h-16 px-4">
          {!isCollapsed ? (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  CICESE
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reservaciones
                </p>
              </div>
            </div>
          ) : (
            <CalendarIcon className="h-8 w-8 text-blue-600 mx-auto" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = isRouteActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={`flex-shrink-0 h-5 w-5 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                  }`}
                  aria-hidden="true"
                />
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {!loading && user && (
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* User info */}
              {!isCollapsed && (
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.nombre} {user.apellidos}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>

            {/* Logout button */}
            {!isCollapsed && (
              <button
                onClick={logout}
                className="mt-3 flex w-full items-center text-sm text-red-600 hover:text-red-700"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}