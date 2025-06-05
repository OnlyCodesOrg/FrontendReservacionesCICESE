'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CirclePlusIcon } from "lucide-react";

interface Sala {
  id: number;
  nombreSala: string;
  ubicacion?: string;
  capacidadMax: number;
  disponible: boolean;
  totalEventos: number;
  ultimoUso?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Sala[];
}

export default function SalasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    obtenerSalas();
  }, []);

  const obtenerSalas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/salas/historial`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setSalas(data.data);
      } else {
        setError(data.message || 'Error al obtener las salas');
      }
    } catch (err) {
      console.error('Error al obtener salas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar las salas');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar salas según búsqueda y filtro de estado
  const salasFiltradas = salas.filter(sala => {
    const matchesSearch = 
      sala.nombreSala.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sala.ubicacion && sala.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "available" && sala.disponible) ||
      (statusFilter === "unavailable" && !sala.disponible);
    
    return matchesSearch && matchesStatus;
  });

  const handleVerDetalles = (idSala: number) => {
    router.push(`/salas-tecnico/${idSala}`);
  };

  const handleEditar = (idSala: number) => {
    router.push(`/salas-tecnico/${idSala}/editar`);
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando salas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Error al cargar las salas
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={obtenerSalas}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              Gestión de Salas
            </h1>
            <h2 className="text-lg text-gray-700 dark:text-gray-300">
              Administra y visualiza todas las salas disponibles
            </h2>
          </div>
          <button 
            onClick={() => router.push('/salas/nueva')}
            className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
          >
            <CirclePlusIcon className="inline-block mr-2 h-7 w-5" />
            Agregar Sala
          </button>
        </div>

        {/* Sección de búsqueda y filtros */}
        <div className="mb-6 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Buscar salas por nombre o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex justify-between items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">No disponibles</option>
            </select>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {salasFiltradas.length} sala{salasFiltradas.length !== 1 ? 's' : ''} encontrada{salasFiltradas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Grid de cards de salas */}
        {salasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No se encontraron salas
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== "all" 
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay salas registradas en el sistema"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {salasFiltradas.map((sala) => (
              <div
                key={sala.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                {/* Imagen de la sala */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <svg className="h-16 w-16 text-white opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  {/* Badge de estado */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        sala.disponible
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}
                    >
                      {sala.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>

                {/* Contenido de la card */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                    {sala.nombreSala}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{sala.ubicacion || 'Sin ubicación'}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Capacidad: {sala.capacidadMax} personas
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVerDetalles(sala.id)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => handleEditar(sala.id)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}