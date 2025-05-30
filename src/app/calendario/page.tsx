"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendario";
import { Conferencia, DisponibilidadHorario } from "@/types/components";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

// Utilizamos la interfaz DisponibilidadHorario importada desde @/types/components

export default function CalendarioPage() {
  const router = useRouter();
  const [conferencias, setConferencias] = useState<Conferencia[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadHorario[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch de ejemplo para las conferencias
  useEffect(() => {
    // Simulación de datos de conferencias
    const conferenciasSimuladas: Conferencia[] = [
      {
        id: "1",
        titulo: "Avances en Oceanografía",
        fechaInicio: "2025-05-05T10:00:00",
        fechaFin: "2025-05-05T12:00:00",
        color: "bg-blue-500",
        salaId: "sala1",
        nombreSala: "Auditorio Principal"
      },
      {
        id: "2",
        titulo: "Tecnologías Emergentes",
        fechaInicio: "2025-05-05T14:00:00",
        fechaFin: "2025-05-05T16:00:00",
        color: "bg-green-500",
        salaId: "sala2",
        nombreSala: "Sala de Juntas"
      },
      {
        id: "3",
        titulo: "Biología Marina",
        fechaInicio: "2025-05-12T09:00:00",
        fechaFin: "2025-05-12T11:30:00",
        color: "bg-purple-500",
        salaId: "sala1",
        nombreSala: "Auditorio Principal"
      },
      {
        id: "4",
        titulo: "Cambio Climático",
        fechaInicio: "2025-05-20T13:00:00",
        fechaFin: "2025-05-20T15:00:00",
        color: "bg-yellow-500",
        salaId: "sala3",
        nombreSala: "Sala Multimedia"
      },
      {
        id: "5",
        titulo: "Inteligencia Artificial",
        fechaInicio: "2025-05-28T16:00:00",
        fechaFin: "2025-05-28T18:00:00",
        color: "bg-red-500",
        salaId: "sala2",
        nombreSala: "Sala de Juntas"
      }
    ];

    setConferencias(conferenciasSimuladas);
  }, []);

  // Manejar la seleccion de un dia y mostrar disponibilidad
  const handleDaySelect = (date: Date, disponibilidadHorarios: DisponibilidadHorario[]) => {
    setSelectedDate(date);
    setDisponibilidad(disponibilidadHorarios);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Calendario de Reservaciones</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Selecciona un día en el calendario para ver los horarios disponibles y reservar una sala.
          </p>
        </div>
        
        <Calendar 
          conferencias={conferencias} 
          onDaySelect={handleDaySelect} 
        />
      </div>
    </div>
  );
}