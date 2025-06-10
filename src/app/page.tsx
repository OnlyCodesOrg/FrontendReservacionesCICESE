"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

// Componente para el contenido cuando está autenticado
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-72'
        }`}>
        {children}
      </main>
    </div>
  );
}

// Componente para el contenido cuando NO está autenticado
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleProtectedAction = (path: string) => {
    if (isAuthenticated) {
      router.push(path);
    } else {
      router.push('/auth/login');
    }
  };

  const landingContent = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header/Navigation - Solo mostrar si NO está autenticado */}
      {!isAuthenticated && (
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img
                  src="https://www.cicese.edu.mx/recorrido-virtual/img/cicese/logo-cicese.png"
                  alt="CICESE"
                  className="h-8 w-auto"
                />
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                  Reservaciones CICESE
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <section className={`${isAuthenticated ? 'py-8 px-6' : 'py-16'}`}>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900 dark:text-blue-100">
                Sistema de Gestión de Salas y Videoconferencias
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Reserva salas, organiza conferencias y gestiona recursos de
                forma eficiente en tiempo real.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleProtectedAction('/dashboard/salas')}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md shadow-sm transition-colors"
                >
                  Nueva Reserva
                </button>
                <button
                  onClick={() => handleProtectedAction('/dashboard/calendario')}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Ver Calendario
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://cicese.edu.mx/recorrido-virtual/img/cicese/social-hero.jpg"
                alt="Ilustración de gestión de salas"
                width={500}
                height={400}
                className="rounded-lg object-cover shadow-xl dark:opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`${isAuthenticated ? 'py-8 px-6' : 'py-16'} bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8`}>
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900 dark:text-blue-100">
            Funcionalidades Principales
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Gestión de Salas",
                desc: "Visualiza la disponibilidad de salas en tiempo real y reserva con anticipación.",
                icon: "🏢",
              },
              {
                title: "Calendario Integrado",
                desc: "Filtros avanzados para visualizar reservas por sala, edificio o estado.",
                icon: "📅",
              },
              {
                title: "Reportes Técnicos",
                desc: "Notifica problemas con equipos y sigue el estado de las reparaciones.",
                icon: "🔧",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} CICESE Conferencias | Sistema de Gestión de Salas
      </footer>
    </div>
  );

  if (isAuthenticated) {
    return (
      <SidebarProvider>
        <AuthenticatedLayout>
          {landingContent}
        </AuthenticatedLayout>
      </SidebarProvider>
    );
  }

  return (
    <PublicLayout>
      {landingContent}
    </PublicLayout>
  );
}