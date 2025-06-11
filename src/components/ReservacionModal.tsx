"use client";

import { useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { X, Calendar, Clock, MapPin, Users, User, Mail, Building, ExternalLink, Edit, Save, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { modificarReservacion, validarDisponibilidadSala } from '@/app/api/reservaciones/reservacionesService';
import { getSalas } from '@/app/api/salas/useGetSalas';
import { Sala, ModificarReservacionRequest } from '@/types/reservacion';

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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para los campos editables
  const [editData, setEditData] = useState({
    nombreEvento: '',
    tipoEvento: 'Conferencia',
    fechaEvento: '',
    horaInicio: '',
    horaFin: '',
    asistentes: 0,
    observaciones: '',
    idSala: 0,
    tipoRecurrencia: 'Ninguna',
    fechaFinRecurrencia: ''
  });

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

  // Cargar salas disponibles
  const cargarSalas = async () => {
    try {
      const salasData = await getSalas();
      if (salasData) {
        setSalas(salasData);
      }
    } catch (error) {
      console.error('Error al cargar salas:', error);
    }
  };

  // Inicializar datos de edición cuando se abre el modal
  useEffect(() => {
    if (isOpen && reservacion) {
      const fechaInicio = parseISO(reservacion.fechaInicio);
      const fechaFin = parseISO(reservacion.fechaFin);
      
      setEditData({
        nombreEvento: reservacion.titulo,
        tipoEvento: 'Conferencia', // Se puede mapear según el tipo real
        fechaEvento: isValid(fechaInicio) ? format(fechaInicio, 'yyyy-MM-dd') : '',
        horaInicio: isValid(fechaInicio) ? format(fechaInicio, 'HH:mm') : '',
        horaFin: isValid(fechaFin) ? format(fechaFin, 'HH:mm') : '',
        asistentes: reservacion.participantes || 0,
        observaciones: reservacion.descripcion || '',
        idSala: 0, // Se obtiene de la ubicación
        tipoRecurrencia: 'Ninguna',
        fechaFinRecurrencia: ''
      });
      
      cargarSalas();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, reservacion]);

  // Manejar inicio de edición
  const handleEditarReservacion = () => {
    setIsEditing(true);
  };

  // Manejar cancelación de edición
  const handleCancelarEdicion = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  // Validar disponibilidad de sala
  const validarDisponibilidad = async () => {
    if (!editData.idSala || !editData.fechaEvento || !editData.horaInicio || !editData.horaFin) {
      return false;
    }

    try {
      const disponibilidad = await validarDisponibilidadSala(
        editData.idSala,
        editData.fechaEvento,
        editData.horaInicio,
        editData.horaFin
      );
      
      return disponibilidad?.success || false;
    } catch (error) {
      console.error('Error al validar disponibilidad:', error);
      return false;
    }
  };

  // Manejar guardado de cambios
  const handleGuardarCambios = async () => {
    if (!reservacion) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validaciones básicas
      if (!editData.nombreEvento.trim()) {
        throw new Error('El nombre del evento es requerido');
      }

      if (!editData.fechaEvento || !editData.horaInicio || !editData.horaFin) {
        throw new Error('La fecha y horarios son requeridos');
      }

      if (editData.asistentes <= 0) {
        throw new Error('El número de asistentes debe ser mayor a 0');
      }

      // Validar disponibilidad de sala si se cambió
      if (editData.idSala > 0) {
        const disponible = await validarDisponibilidad();
        if (!disponible) {
          throw new Error('La sala no está disponible en el horario seleccionado');
        }
      }

      // Preparar datos para el endpoint
      const datosModificacion: ModificarReservacionRequest = {
        numeroReservacion: reservacion.numeroReservacion,
        nombreEvento: editData.nombreEvento,
        tipoEvento: editData.tipoEvento,
        fechaEvento: editData.fechaEvento,
        horaInicio: editData.horaInicio,
        horaFin: editData.horaFin,
        asistentes: editData.asistentes,
        observaciones: editData.observaciones,
        ...(editData.idSala > 0 && { idSala: editData.idSala }),
        ...(editData.tipoRecurrencia !== 'Ninguna' && { 
          tipoRecurrencia: editData.tipoRecurrencia,
          fechaFinRecurrencia: editData.fechaFinRecurrencia
        })
      };

      const response = await modificarReservacion(datosModificacion);
      
      if (response?.success) {
        setSuccess('Reservación modificada exitosamente');
        setIsEditing(false);
        // Aquí podrías actualizar los datos de la reservación si necesitas
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(response?.message || 'Error al modificar la reservación');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al modificar la reservación');
    } finally {
      setLoading(false);
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
            {/* Mensajes de error y éxito */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
              </div>
            )}

            {!isEditing ? (
              <>
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

                {/* Detalles del Evento - Vista */}
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
              </>
            ) : (
              /* Modo Edición */
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Modificar Reservación
                </h3>
                
                {/* Nombre del Evento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Evento *
                  </label>
                  <input
                    type="text"
                    value={editData.nombreEvento}
                    onChange={(e) => setEditData({ ...editData, nombreEvento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese el nombre del evento"
                  />
                </div>

                {/* Tipo de Evento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Evento
                  </label>
                                          <select
                          value={editData.tipoEvento}
                          onChange={(e) => setEditData({ ...editData, tipoEvento: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Conferencia">Conferencia</option>
                          <option value="Reunion">Reunión</option>
                          <option value="Videoconferencia">Videoconferencia</option>
                          <option value="Presentacion">Presentación</option>
                          <option value="Capacitacion">Capacitación</option>
                          <option value="Otro">Otro</option>
                        </select>
                </div>

                {/* Fecha y Horarios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha del Evento *
                    </label>
                    <input
                      type="date"
                      value={editData.fechaEvento}
                      onChange={(e) => setEditData({ ...editData, fechaEvento: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hora de Inicio *
                    </label>
                    <input
                      type="time"
                      value={editData.horaInicio}
                      onChange={(e) => setEditData({ ...editData, horaInicio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hora de Fin *
                    </label>
                    <input
                      type="time"
                      value={editData.horaFin}
                      onChange={(e) => setEditData({ ...editData, horaFin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Número de Asistentes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de Asistentes *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editData.asistentes}
                    onChange={(e) => setEditData({ ...editData, asistentes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Número de asistentes"
                  />
                </div>

                {/* Sala (opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cambiar Sala (opcional)
                  </label>
                  <select
                    value={editData.idSala}
                    onChange={(e) => setEditData({ ...editData, idSala: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Mantener sala actual</option>
                    {salas.map((sala) => (
                      <option key={sala.id} value={sala.id}>
                        {sala.nombreSala} - {sala.ubicacion} (Capacidad: {sala.capacidadMax})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    rows={3}
                    value={editData.observaciones}
                    onChange={(e) => setEditData({ ...editData, observaciones: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observaciones adicionales"
                  />
                </div>

                {/* Recurrencia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Recurrencia
                    </label>
                    <select
                      value={editData.tipoRecurrencia}
                      onChange={(e) => setEditData({ ...editData, tipoRecurrencia: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Ninguna">Sin recurrencia</option>
                      <option value="Diaria">Diaria</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Mensual">Mensual</option>
                    </select>
                  </div>
                  {editData.tipoRecurrencia !== 'Ninguna' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha Fin Recurrencia
                      </label>
                      <input
                        type="date"
                        value={editData.fechaFinRecurrencia}
                        onChange={(e) => setEditData({ ...editData, fechaFinRecurrencia: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
            {!isEditing ? (
              <>
                <button
                  onClick={handleVerDetalles}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Ver Detalles
                </button>
                
                {/* Solo mostrar botón de editar si el estado es 'pendiente' */}
                {reservacion.estado === 'pendiente' && (
                  <button
                    onClick={handleEditarReservacion}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Reservación
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleCancelarEdicion}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar
                </button>
                
                <button
                  onClick={handleGuardarCambios}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}