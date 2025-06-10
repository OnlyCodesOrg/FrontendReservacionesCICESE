import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Interfaces para las respuestas del backend
interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: boolean;
  mensaje?: string;
}

interface ReservacionHistorial {
  idReservacion: number;
  numeroSolicitud: string;
  nombreEvento: string;
  salaEvento: string;
  fechaEvento: string;
  estadoActual: string;
  horaInicio: string;
  horaFin: string;
}

interface DetalleReservacion {
  id: number;
  numeroReservacion: string;
  nombreEvento: string;
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
  estadoSolicitud: string;
  numeroAsistentesEstimado: number;
  fechaCreacionSolicitud: string;
  linkReunionOnline?: string;
  observaciones?: string;
  equipoRequerido?: string;
  serviciosExtra?: string;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
    departamento: string;
  };
  sala: {
    nombreSala: string;
    ubicacion: string;
    piso: string;
    capacidad: number;
  };
}

interface ValidarDisponibilidadRequest {
  idSala: number;
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
}

interface ValidarDisponibilidadResponse {
  success: boolean;
  message: string;
  conflict?: {
    hasConflict: boolean;
    conflictDetails?: any;
    sugerencias?: any;
  };
}

interface ModificarReservacionRequest {
  numeroReservacion: string;
  idSala?: number;
  idUsuario?: number;
  nombreEvento: string;
  tipoEvento: string;
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
  asistentes: number;
  observaciones?: string;
  idTecnicoAsignado?: number;
  estadoSolicitud?: string;
  tipoRecurrencia?: string;
  fechaFinRecurrencia?: string;
  idUsuarioUltimaModificacion?: number;
  linkReunion?: string;
  fallasRegistradas?: string;
}

// Helper para obtener headers con token
const getAuthHeaders = () => {
  const token = Cookies.get('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Obtiene el historial de reservaciones de un usuario
 */
export const obtenerHistorialReservaciones = async (idUsuario: number): Promise<ApiResponse<ReservacionHistorial[]>> => {
  try {
    const response = await fetch(`${API_URL}/reservaciones/historial/${idUsuario}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error al obtener historial de reservaciones:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Obtiene los detalles de una reservación específica
 */
export const obtenerDetalleReservacion = async (idReservacion: number): Promise<ApiResponse<DetalleReservacion>> => {
  try {
    const response = await fetch(`${API_URL}/reservaciones/reservacion/${idReservacion}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error al obtener detalle de reservación:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Valida la disponibilidad de una sala
 */
export const validarDisponibilidadSala = async (
  idSala: number,
  fechaEvento: string,
  horaInicio: string,
  horaFin: string
): Promise<ValidarDisponibilidadResponse> => {
  try {
    const response = await fetch(`${API_URL}/salas/validar-disponibilidad`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        idSala,
        fechaEvento,
        horaInicio,
        horaFin,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al validar disponibilidad:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Modifica una reservación existente
 */
export const modificarReservacion = async (datos: ModificarReservacionRequest): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/reservaciones/modificar`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Reservación modificada exitosamente',
      data: data.data,
    };
  } catch (error) {
    console.error('Error al modificar reservación:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Busca reservaciones (usando el endpoint listar con filtros)
 */
export const buscarReservaciones = async (filtros: {
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<ApiResponse> => {
  try {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

    const url = `${API_URL}/reservaciones/listar${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: !data.error,
      message: data.mensaje,
      data: data.data,
    };
  } catch (error) {
    console.error('Error al buscar reservaciones:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Obtiene la lista de salas con disponibilidad
 */
export const obtenerSalasDisponibles = async (fecha: string, salasSeleccionadas?: number[]): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/salas/listar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fecha,
        salasSeleccionadas: salasSeleccionadas || [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener salas disponibles:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

export { type DetalleReservacion, type ReservacionHistorial, type ModificarReservacionRequest }; 