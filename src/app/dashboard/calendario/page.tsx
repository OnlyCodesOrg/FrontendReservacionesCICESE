"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendario";
import { Conferencia } from "@/types/components";

// Interfaces para los datos de la API
interface ApiReservacion {
  id: number;
  numeroReservacion: string;
  idUsuario: number;
  idTecnicoAsignado: number | null;
  idSala: number;
  nombreEvento: string;
  tipoEvento: string;
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
  numeroAsistentesEstimado: number;
  numeroAsistentesReal: number | null;
  estadoSolicitud: string;
  tipoRecurrencia: string;
  fechaFinRecurrencia: string | null;
  observaciones: string;
  fechaCreacionSolicitud: string;
  fechaUltimaModificacion: string | null;
  idUsuarioUltimaModificacion: number | null;
  linkReunionOnline: string | null;
  fallasRegistradas: string | null;
  sala: {
    nombreSala: string;
    ubicacion: string;
  };
  usuario: {
    nombre: string;
    apellidos: string;
    email: string;
  };
}

interface ApiResponse {
  error: boolean;
  mensaje: string;
  data: ApiReservacion[];
}

export default function CalendarioPage() {
  const [conferencias, setConferencias] = useState<Conferencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuración de la API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://reservaciones-cicese-app.ambitioussea-007d0918.westus3.azurecontainerapps.io";

  useEffect(() => {
    obtenerReservaciones();
  }, []);

  const obtenerReservaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const fechaInicio = "2024-01-01";
      const fechaFin = "2030-12-31";
      
      const response = await fetch(
        `${API_BASE_URL}/reservaciones/listar?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store',
          signal: AbortSignal.timeout(15000),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.error && data.data) {
        const conferenciasTransformadas = transformarReservaciones(data.data);
        setConferencias(conferenciasTransformadas);
      } else {
        throw new Error(data.mensaje || 'Error al obtener las reservaciones');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      usarDatosSimulados();
    } finally {
      setLoading(false);
    }
  };

  const transformarReservaciones = (reservaciones: ApiReservacion[]): Conferencia[] => {
    return reservaciones.map((reservacion) => {
      const fechaEvento = reservacion.fechaEvento.split('T')[0];
      const horaInicio = new Date(reservacion.horaInicio).toTimeString().slice(0, 8);
      const horaFin = new Date(reservacion.horaFin).toTimeString().slice(0, 8);
      
      const fechaInicio = `${fechaEvento}T${horaInicio}`;
      const fechaFinCompleta = `${fechaEvento}T${horaFin}`;

      const color = getColorByEstado(reservacion.estadoSolicitud);
      const { equipoRequerido, serviciosExtra, descripcionLimpia } = extraerDetallesDeObservaciones(
        reservacion.observaciones
      );
      const capacidadMaxima = estimarCapacidadSala(reservacion.sala.nombreSala);

      const conferencia: Conferencia = {
        id: reservacion.id.toString(),
        numeroReservacion: reservacion.numeroReservacion,
        titulo: reservacion.nombreEvento,
        fechaInicio,
        fechaFin: fechaFinCompleta,
        color,
        salaId: reservacion.idSala.toString(),
        nombreSala: reservacion.sala.nombreSala,
        solicitante: {
          nombre: `${reservacion.usuario.nombre} ${reservacion.usuario.apellidos}`,
          email: reservacion.usuario.email,
          departamento: 'No especificado'
        },
        ubicacion: {
          sala: reservacion.sala.nombreSala,
          edificio: extraerEdificio(reservacion.sala.ubicacion),
          piso: extraerPiso(reservacion.sala.ubicacion),
          capacidadMaxima
        },
        participantes: reservacion.numeroAsistentesEstimado,
        estado: mapearEstado(reservacion.estadoSolicitud), // ✅ Usar función de mapeo
        fechaCreacion: reservacion.fechaCreacionSolicitud,
        descripcion: descripcionLimpia || `${reservacion.tipoEvento} - ${reservacion.nombreEvento}`,
        equipoRequerido,
        serviciosExtra,
        ...(reservacion.linkReunionOnline && { enlaceVideoconferencia: reservacion.linkReunionOnline })
      };

      return conferencia;
    });
  };

  // ✅ Función para mapear estados de la API a los tipos permitidos
  const mapearEstado = (estadoAPI: string): 'pendiente' | 'aprobada' | 'rechazada' | 'completada' => {
    const estadoLower = estadoAPI.toLowerCase();
    switch (estadoLower) {
      case 'aprobada':
        return 'aprobada';
      case 'pendiente':
        return 'pendiente';
      case 'rechazada':
      case 'rechazado':
        return 'rechazada';
      case 'completada':
      case 'completado':
      case 'finalizada':
      case 'finalizado':
        return 'completada';
      default:
        return 'pendiente'; // Valor por defecto
    }
  };

  const getColorByEstado = (estado: string): string => {
    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case 'aprobada':
        return 'bg-green-500';
      case 'pendiente':
        return 'bg-yellow-500';
      case 'rechazada':
        return 'bg-red-500';
      case 'cancelada':
        return 'bg-gray-500';
      case 'completada':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  const extraerDetallesDeObservaciones = (observaciones: string) => {
    let equipoRequerido: string[] = [];
    let serviciosExtra: string[] = [];
    let descripcionLimpia = observaciones;

    const equipoMatch = observaciones.match(/Equipo requerido:\s*([^.]*)/i);
    if (equipoMatch) {
      equipoRequerido = equipoMatch[1]
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      descripcionLimpia = descripcionLimpia.replace(/Equipo requerido:\s*[^.]*/i, '').trim();
    }

    const serviciosMatch = observaciones.match(/Servicios requeridos:\s*([^.]*)/i);
    if (serviciosMatch) {
      serviciosExtra = serviciosMatch[1]
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
      descripcionLimpia = descripcionLimpia.replace(/Servicios requeridos:\s*[^.]*/i, '').trim();
    }

    descripcionLimpia = descripcionLimpia
      .replace(/Asistentes adicionales:\s*[^.]*/i, '')
      .replace(/\.\s*\./g, '.')
      .trim();

    return { equipoRequerido, serviciosExtra, descripcionLimpia };
  };

  const extraerEdificio = (ubicacion: string): string => {
    const match = ubicacion.match(/^([^,]+)/);
    return match ? match[1].trim() : 'Edificio no especificado';
  };

  const extraerPiso = (ubicacion: string): string => {
    const match = ubicacion.match(/,\s*(.+)$/);
    return match ? match[1].trim() : 'Piso no especificado';
  };

  const estimarCapacidadSala = (nombreSala: string): number => {
    const nombre = nombreSala.toLowerCase();
    if (nombre.includes('auditorio')) return 100;
    if (nombre.includes('videoconferencia')) return 20;
    if (nombre.includes('reunion')) return 15;
    if (nombre.includes('conferencia')) return 50;
    if (nombre.includes('junta')) return 10;
    if (nombre.includes('multimedia')) return 30;
    return 25;
  };

  const usarDatosSimulados = () => {
    const conferenciasSimuladas: Conferencia[] = [
      {
        id: "sim-1",
        numeroReservacion: "SIM-001",
        titulo: "Conferencia de Ejemplo",
        fechaInicio: "2025-06-15T10:00:00",
        fechaFin: "2025-06-15T12:00:00",
        color: "bg-orange-500",
        salaId: "sim-sala1",
        nombreSala: "Sala de Conferencias",
        solicitante: {
          nombre: "Usuario de Prueba",
          email: "prueba@cicese.mx",
          departamento: "Sistemas"
        },
        ubicacion: {
          sala: "Sala de Conferencias",
          edificio: "Edificio Principal",
          piso: "Piso 1",
          capacidadMaxima: 25
        },
        participantes: 15,
        estado: "pendiente", // ✅ Valor literal válido
        fechaCreacion: "2025-06-01T09:00:00",
        descripcion: "Datos simulados - API no disponible",
        equipoRequerido: ["Proyector", "Audio"],
        serviciosExtra: ["WiFi"]
      }
    ];

    setConferencias(conferenciasSimuladas);
  };

  const recargarDatos = () => {
    obtenerReservaciones();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando reservaciones...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Error al cargar el calendario
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4 text-sm">{error}</p>
            <button 
              onClick={recargarDatos}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Calendar conferencias={conferencias} />
    </div>
  );
}