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
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Solicitudes</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Lista de todas las solicitudes de reservación
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => router.push('/dashboard/solicitudes/nueva')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Nueva Solicitud
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:flex md:items-center md:justify-between">
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, solicitante o sala..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 transition-colors"
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
            <option value="completada">Completada</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredSolicitudes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No se encontraron solicitudes</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSolicitudes.map((solicitud) => (
              <li key={solicitud.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                          {solicitud.numeroReservacion}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(solicitud.estado)}`}>
                          {getEstadoTexto(solicitud.estado)}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center text-sm text-gray-900 dark:text-white">
                        {solicitud.titulo}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleVerDetalles(solicitud)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        Ver detalles
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex space-y-2 sm:space-y-0 sm:space-x-6">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {solicitud.participantes} participantes
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {solicitud.ubicacion.sala}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-6 flex flex-col sm:flex-row text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {formatFechaSafe(solicitud.fechaInicio)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {formatHoraSafe(solicitud.fechaInicio)} - {formatHoraSafe(solicitud.fechaFin)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      <ReservacionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservacion={selectedSolicitud}
      />
    </div>
  );
}