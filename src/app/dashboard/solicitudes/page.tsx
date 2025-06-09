"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Clock, MapPin, Users, Eye, Filter, X } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import ReservacionModal from "@/components/ReservacionModal";

interface Solicitud {
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
}

export default function SolicitudesPage() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<Solicitud[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Datos hardcodeados de solicitudes
    const solicitudesSimuladas: Solicitud[] = [
      {
        id: "1",
        numeroReservacion: "SOL-2025001",
        titulo: "Reunión de Avances Proyecto Marina",
        fechaInicio: "2025-06-10T14:00:00",
        fechaFin: "2025-06-10T16:00:00",
        solicitante: {
          nombre: "Dr. Eduardo Santamaría",
          email: "eduardo.santamaria@cicese.mx",
          departamento: "Oceanografía Biológica"
        },
        ubicacion: {
          sala: "Sala de Conferencias B",
          edificio: "Edificio Principal",
          piso: "Piso 1",
          capacidadMaxima: 20
        },
        participantes: 12,
        estado: "pendiente",
        fechaCreacion: "2025-06-01T10:30:00",
        enlaceVideoconferencia: "https://teams.microsoft.com/l/meetup-join/19%3a...",
        descripcion: "Reunión quincenal para revisar avances del proyecto de investigación sobre biodiversidad marina en el Golfo de California.",
        equipoRequerido: ["Proyector", "Sistema de audio", "Pizarrón"],
        serviciosExtra: ["Café", "Conexión a internet estable"]
      },
      {
        id: "2",
        numeroReservacion: "SOL-2025002",
        titulo: "Seminario de Tesis Doctoral",
        fechaInicio: "2025-06-15T09:00:00",
        fechaFin: "2025-06-15T11:00:00",
        solicitante: {
          nombre: "Ana Lucía Morales",
          email: "ana.morales@estudiante.cicese.mx",
          departamento: "Geofísica Aplicada"
        },
        ubicacion: {
          sala: "Aula Magna",
          edificio: "Centro de Investigación",
          piso: "Planta Baja",
          capacidadMaxima: 80
        },
        participantes: 45,
        estado: "aprobada",
        fechaCreacion: "2025-05-28T16:45:00",
        enlaceVideoconferencia: "https://zoom.us/j/987654321",
        descripcion: "Presentación de avances de tesis doctoral sobre análisis sísmico en la región de Baja California.",
        equipoRequerido: ["Proyector 4K", "Micrófono inalámbrico", "Sistema de grabación"],
        serviciosExtra: ["Transmisión en vivo", "Grabación"]
      },
      {
        id: "3",
        numeroReservacion: "SOL-2025003",
        titulo: "Workshop Técnicas de Muestreo",
        fechaInicio: "2025-06-22T13:00:00",
        fechaFin: "2025-06-22T17:00:00",
        solicitante: {
          nombre: "M.C. Roberto Velasco",
          email: "roberto.velasco@cicese.mx",
          departamento: "Ecología Marina"
        },
        ubicacion: {
          sala: "Laboratorio de Prácticas",
          edificio: "Edificio de Laboratorios",
          piso: "Piso 2",
          capacidadMaxima: 15
        },
        participantes: 14,
        estado: "rechazada",
        fechaCreacion: "2025-06-03T11:20:00",
        descripcion: "Taller práctico sobre técnicas avanzadas de muestreo en ambientes marinos costeros.",
        equipoRequerido: ["Equipo de laboratorio", "Microscopio", "Materiales de muestreo"],
        serviciosExtra: ["Material de laboratorio", "Equipo de seguridad"]
      },
      {
        id: "4",
        numeroReservacion: "SOL-2025004",
        titulo: "Conferencia Magistral: Cambio Climático",
        fechaInicio: "2025-06-30T16:00:00",
        fechaFin: "2025-06-30T18:00:00",
        solicitante: {
          nombre: "Dra. Carmen Jiménez",
          email: "carmen.jimenez@cicese.mx",
          departamento: "Climatología"
        },
        ubicacion: {
          sala: "Auditorio Principal",
          edificio: "Centro de Investigación",
          piso: "Planta Baja",
          capacidadMaxima: 200
        },
        participantes: 150,
        estado: "aprobada",
        fechaCreacion: "2025-06-05T14:15:00",
        enlaceVideoconferencia: "https://meet.google.com/xyz-abc-def",
        descripcion: "Conferencia magistral sobre los últimos hallazgos en investigación del cambio climático y su impacto en ecosistemas marinos.",
        equipoRequerido: ["Sistema de audio profesional", "Proyector 4K", "Iluminación especial"],
        serviciosExtra: ["Transmisión en vivo", "Traducción simultánea", "Refrigerio"]
      },
      {
        id: "5",
        numeroReservacion: "SOL-2025005",
        titulo: "Junta Directiva Mensual",
        fechaInicio: "2025-06-08T10:00:00",
        fechaFin: "2025-06-08T12:00:00",
        solicitante: {
          nombre: "Dr. Fernando Aguirre",
          email: "fernando.aguirre@cicese.mx",
          departamento: "Dirección General"
        },
        ubicacion: {
          sala: "Sala de Juntas Ejecutiva",
          edificio: "Edificio Administrativo",
          piso: "Piso 3",
          capacidadMaxima: 12
        },
        participantes: 10,
        estado: "completada",
        fechaCreacion: "2025-05-25T09:00:00",
        enlaceVideoconferencia: "https://teams.microsoft.com/l/meetup-join/confidencial",
        descripcion: "Junta mensual de la dirección para revisar avances institucionales y tomar decisiones estratégicas.",
        equipoRequerido: ["Sistema de videoconferencia", "Pantalla interactiva"],
        serviciosExtra: ["Catering ejecutivo", "Servicio de café"]
      }
    ];

    // Simular carga asíncrona
    setTimeout(() => {
      setSolicitudes(solicitudesSimuladas);
      setFilteredSolicitudes(solicitudesSimuladas);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar solicitudes
  useEffect(() => {
    let filtered = solicitudes;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(solicitud =>
        solicitud.numeroReservacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solicitud.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solicitud.solicitante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solicitud.ubicacion.sala.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(solicitud => solicitud.estado === statusFilter);
    }

    setFilteredSolicitudes(filtered);
  }, [searchTerm, statusFilter, solicitudes]);

  const handleVerDetalles = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSolicitud(null);
  };

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

  const formatFechaSafe = (fechaString: string) => {
    if (!fechaString) return 'Fecha no disponible';
    
    try {
      const fecha = parseISO(fechaString);
      if (!isValid(fecha)) return 'Fecha inválida';
      return format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      return 'Error en fecha';
    }
  };

  const formatHoraSafe = (fechaString: string) => {
    if (!fechaString) return '--:--';
    
    try {
      const fecha = parseISO(fechaString);
      if (!isValid(fecha)) return '--:--';
      return format(fecha, "HH:mm");
    } catch (error) {
      return '--:--';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Mis Solicitudes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Consulta y gestiona todas tus solicitudes de reservación
            </p>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Buscador */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar por ID, título, sala o solicitante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filtro por estado */}
              <div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="aprobada">Aprobadas</option>
                    <option value="rechazada">Rechazadas</option>
                    <option value="completada">Completadas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredSolicitudes.length} solicitud{filteredSolicitudes.length !== 1 ? 'es' : ''} encontrada{filteredSolicitudes.length !== 1 ? 's' : ''}
                {searchTerm && ` para "${searchTerm}"`}
                {statusFilter !== "all" && ` con estado "${getEstadoTexto(statusFilter)}"`}
              </p>
            </div>
          </div>

          {/* Lista de solicitudes */}
          {filteredSolicitudes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-4">
                <Search className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No se encontraron solicitudes
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== "all" 
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No tienes solicitudes registradas"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSolicitudes.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {solicitud.titulo}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {solicitud.numeroReservacion}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(solicitud.estado)}`}>
                          {getEstadoTexto(solicitud.estado)}
                        </span>
                      </div>

                      {/* Detalles en grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{formatFechaSafe(solicitud.fechaInicio)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{formatHoraSafe(solicitud.fechaInicio)} - {formatHoraSafe(solicitud.fechaFin)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{solicitud.ubicacion.sala}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4" />
                          <span>{solicitud.participantes} personas</span>
                        </div>
                      </div>

                      {/* Descripción truncada */}
                      {solicitud.descripcion && (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {solicitud.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Botón de acción */}
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <button
                        onClick={() => handleVerDetalles(solicitud)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal reutilizado */}
      <ReservacionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservacion={selectedSolicitud}
      />
    </>
  );
}