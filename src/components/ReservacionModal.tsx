"use client";

import { useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { X, Calendar, Clock, MapPin, Users, User, Mail, Building, ExternalLink, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReservacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservacion: {
    id: string;
    numeroReservacion: string;
    titulo: string;
    fechaInicio: string;
    fechaFin: string;
    solicitante: {
      nombre: string;
      email: string;
      departamento: string;
    };
    ubicacion: {
      sala: string;
      edificio: string;
      piso: string;
      capacidadMaxima: number;
    };
    participantes: number;
    estado: 'pendiente' | 'aprobada' | 'rechazada' | 'completada';
    fechaCreacion: string;
    enlaceVideoconferencia?: string;
    descripcion?: string;
    equipoRequerido?: string[];
    serviciosExtra?: string[];
  } | null;
}

export default function ReservacionModal({ isOpen, onClose, reservacion }: ReservacionModalProps) {
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Función para formatear fechas de forma segura
  const formatFechaSafe = (fechaString: string, formatStr: string = "d 'de' MMMM 'de' yyyy") => {
    if (!fechaString) return 'Fecha no disponible';
    
    try {
      const fecha = parseISO(fechaString);
      if (!isValid(fecha)) {
        console.warn('Fecha inválida:', fechaString);
        return 'Fecha inválida';
      }
      return format(fecha, formatStr, { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error, fechaString);
      return 'Error en fecha';
    }
  };

  // Función para formatear hora de forma segura
  const formatHoraSafe = (fechaString: string) => {
    if (!fechaString) return '--:--';
    
    try {
      const fecha = parseISO(fechaString);
      if (!isValid(fecha)) {
        return '--:--';
      }
      return format(fecha, "HH:mm");
    } catch (error) {
      console.error('Error al formatear hora:', error, fechaString);
      return '--:--';
    }
  };

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !reservacion) return null;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'aprobada':
        return 'Aprobada';
      case 'pendiente':
        return 'Pendiente';
      case 'rechazada':
        return 'Rechazada';
      case 'completada':
        return 'Completada';
      default:
        return estado;
    }
  };

  const handleEditarReservacion = () => {
    router.push(`/dashboard/modificar-reservacion/${reservacion.id}`);
    onClose();
  };

  const handleVerDetalles = () => {
    router.push(`/dashboard/conferencia/${reservacion.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {reservacion.titulo || 'Sin título'}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(reservacion.estado)}`}>
                  {getEstadoTexto(reservacion.estado)}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID de Reservación: #{reservacion.numeroReservacion || 'N/A'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Creada el {formatFechaSafe(reservacion.fechaCreacion)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Datos del Solicitante */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Datos del Solicitante
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{reservacion.solicitante?.nombre || 'No especificado'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{reservacion.solicitante?.email || 'No especificado'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span>Departamento: {reservacion.solicitante?.departamento || 'No especificado'}</span>
                </div>
              </div>
            </div>

            {/* Detalles del Evento */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Detalles del Evento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">Fecha</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {formatFechaSafe(reservacion.fechaInicio, "EEEE, d 'de' MMMM 'de' yyyy")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">Horario</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {formatHoraSafe(reservacion.fechaInicio)} - {formatHoraSafe(reservacion.fechaFin)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">Ubicación</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {reservacion.ubicacion?.sala || 'Sin especificar'} 
                        {reservacion.ubicacion?.edificio && reservacion.ubicacion?.piso && 
                          ` (${reservacion.ubicacion.edificio}, ${reservacion.ubicacion.piso})`
                        }
                      </div>
                      {reservacion.ubicacion?.capacidadMaxima && (
                        <div className="text-xs text-gray-500">
                          Capacidad máxima: {reservacion.ubicacion.capacidadMaxima} personas
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">Participantes en sala</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {reservacion.participantes || 0} personas
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {reservacion.descripcion && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Descripción
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {showFullDescription || reservacion.descripcion.length <= 150 ? (
                    <p>{reservacion.descripcion}</p>
                  ) : (
                    <>
                      <p>{reservacion.descripcion.substring(0, 150)}...</p>
                      <button
                        onClick={() => setShowFullDescription(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium mt-1"
                      >
                        Ver más
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Enlace de Videoconferencia */}
            {reservacion.enlaceVideoconferencia && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Enlace de Videoconferencia
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <a
                    href={reservacion.enlaceVideoconferencia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {reservacion.enlaceVideoconferencia}
                  </a>
                </div>
              </div>
            )}

            {/* Equipo Requerido */}
            {reservacion.equipoRequerido && reservacion.equipoRequerido.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Equipo Requerido
                </h3>
                <div className="flex flex-wrap gap-2">
                  {reservacion.equipoRequerido.map((equipo, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                    >
                      {equipo}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Servicios Extra */}
            {reservacion.serviciosExtra && reservacion.serviciosExtra.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Servicios Extra
                </h3>
                <div className="flex flex-wrap gap-2">
                  {reservacion.serviciosExtra.map((servicio, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-md"
                    >
                      {servicio}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleVerDetalles}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Ver Detalles
            </button>
            
            <button
              onClick={handleEditarReservacion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Editar Reservación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}