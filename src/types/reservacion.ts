export interface Reservacion {
  numeroReservacion: string;
  idSala: number;
  idUsuario: number;
  nombreEvento: string;
  tipoEvento: 'Reunion' | 'Videoconferencia' | 'Presentacion' | 'Capacitacion' | 'Conferencia' | 'Otro';
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
  numeroAsistentes: number;
  numeroAsistentesReal: number;
  estadoSolicitud: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Cancelada' | 'En proceso' | 'Completada';
  observaciones?: string;
  idTecnicoAsignado?: number;
  tipoRecurrencia?: 'Ninguna' | 'Diaria' | 'Semanal' | 'Mensual';
  fechaFinRecurrencia?: string;
  idUsuarioUltimaModificacion?: number;
  fallasRegistradas?: string;
  linkReunion?: string;
}

export interface ModificarReservacionRequest {
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

export interface BuscarReservacionRequest {
  numeroReservacion?: string;
  idUsuario?: number;
  fechaEvento?: string;
  estadoSolicitud?: string;
  nombreEvento?: string;
}

export interface ReservacionResponse {
  success: boolean;
  message: string;
  data: Reservacion;
}

export interface BuscarReservacionesResponse {
  success: boolean;
  message: string;
  data: Reservacion[];
}

export interface Sala {
  id: number;
  nombreSala: string;
  ubicacion: string;
  capacidadMax: number;
  estaDisponible: boolean;
}

export interface DisponibilidadSala {
  idSala: number;
  nombreSala: string;
  disponible: boolean;
  horariosOcupados: {
    horaInicio: string;
    horaFin: string;
  }[];
} 