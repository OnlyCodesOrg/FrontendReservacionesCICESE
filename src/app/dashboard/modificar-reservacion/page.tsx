"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerHistorialReservaciones, buscarReservaciones } from '@/app/api/reservaciones/reservacionesService';
import { AuthGuard } from '@/components/AuthGuard';
import { Search, Calendar, Clock, MapPin, Users, Edit } from 'lucide-react';

interface ReservacionItem {
  idReservacion: number;
  numeroSolicitud: string;
  nombreEvento: string;
  salaEvento: string;
  fechaEvento: string;
  estadoActual: string;
  horaInicio: string;
  horaFin: string;
}

export default function BuscarReservacionesPage() {
  const router = useRouter();
  const { user, getUserId } = useAuth();
  const [reservaciones, setReservaciones] = useState<ReservacionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReservaciones, setFilteredReservaciones] = useState<ReservacionItem[]>([]);

  // Cargar reservaciones del usuario al montar el componente
  useEffect(() => {
    const cargarReservaciones = async () => {
      const userId = getUserId();
      if (!userId) {
        setError('Usuario no autenticado');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await obtenerHistorialReservaciones(userId);
        if (response?.success && response.data) {
          setReservaciones(response.data);
          setFilteredReservaciones(response.data);
        } else {
          setError(response?.message || 'Error al cargar las reservaciones');
        }
      } catch (err) {
        setError('Error de conexión al cargar reservaciones');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      cargarReservaciones();
    }
  }, [user, getUserId]);

  // Filtrar reservaciones según el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredReservaciones(reservaciones);
      return;
    }

    const filtered = reservaciones.filter(reservacion =>
      reservacion.numeroSolicitud.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservacion.nombreEvento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservacion.salaEvento.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredReservaciones(filtered);
  }, [searchTerm, reservaciones]);

  // Función para ir a modificar una reservación específica
  const irAModificar = (numeroReservacion: string) => {
    router.push(`/dashboard/modificar-reservacion/${numeroReservacion}`);
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case 'aprobada': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'rechazada': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'cancelada': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      case 'en proceso': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'completada': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  // Verificar si una reservación puede ser modificada
  const puedeModificar = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    return ['pendiente', 'aprobada'].includes(estadoLower);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Modificar Reservaciones
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Selecciona una reservación de la lista para modificar sus detalles
            </p>
          </div>

          {/* Búsqueda */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por número de reservación, nombre del evento o sala..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Mensajes de error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando reservaciones...</span>
            </div>
          )}

          {/* Lista de reservaciones */}
          {!loading && filteredReservaciones.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tus Reservaciones ({filteredReservaciones.length})
                </h3>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReservaciones.map((reservacion) => (
                  <div key={reservacion.idReservacion} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Header con número y estado */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {reservacion.numeroSolicitud}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(reservacion.estadoActual)}`}>
                            {reservacion.estadoActual}
                          </span>
                        </div>

                        {/* Título del evento */}
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                          {reservacion.nombreEvento}
                        </h4>

                        {/* Detalles */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(reservacion.fechaEvento).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{reservacion.horaInicio} - {reservacion.horaFin}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{reservacion.salaEvento}</span>
                          </div>
                        </div>
                      </div>

                      {/* Botón de acción */}
                      <div className="ml-4 flex-shrink-0">
                        {puedeModificar(reservacion.estadoActual) ? (
                          <button
                            onClick={() => irAModificar(reservacion.numeroSolicitud)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            Modificar
                          </button>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            No modificable
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sin resultados */}
          {!loading && filteredReservaciones.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No se encontraron reservaciones' : 'No tienes reservaciones'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Crea tu primera reservación para poder modificarla después'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/dashboard/salas')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Nueva Reservación
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 