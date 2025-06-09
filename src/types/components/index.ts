import { Room, User } from '@/types/globals';

interface ReservationFormProps {
  availableRooms: Room[];
  currentUser: User;
  onSubmit: (formData: ReservationFormData) => Promise<void>;
  initialData?: Partial<ReservationFormData>;
}

export interface ReservationFormData {
  title: string;
  description?: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  attendees?: number;
  requiredEquipment: string[];
}

// Tipo para las conferencias que recibe el componente
export interface Conferencia {
  id: string;
  numeroReservacion: string;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  color: string;
  salaId: string;
  nombreSala: string;
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

export default function ReservationForm({ availableRooms, currentUser, onSubmit, initialData }: ReservationFormProps) {
  // Implementación del componente
}