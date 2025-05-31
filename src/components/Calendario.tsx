"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Conferencia } from "@/types/components";
import { useRouter } from "next/navigation";

interface CalendarProps {
  conferencias: Conferencia[];
}

export default function Calendar({ conferencias }: CalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Funciones para navegar entre meses
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Obtener los días del mes actual
  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const days: Date[] = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Filtrar conferencias por día
  const getConferenciasByDay = (day: Date) => {
    return conferencias.filter(conf => {
      const confDate = parseISO(conf.fechaInicio);
      return isSameDay(day, confDate);
    });
  };

  // Función para navegar a la página de detalles
  const handleConferenciaClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Evitar que se active el click del día
    router.push(`/conferencia/${id}`);
  };

  // Función para navegar a la página de reservación
  const handleDayClick = (day: Date) => {
    const dateString = format(day, "yyyy-MM-dd");
    router.push(`/solicitud-reservacion?fecha=${dateString}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Calendario de Conferencias</h1>
        <div className="flex space-x-4">
          <button
            onClick={prevMonth}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            ← Mes Anterior
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            Mes Siguiente →
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day) => (
          <div key={day} className="text-center font-semibold py-2 bg-gray-100 dark:bg-gray-800">
            {day}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1 auto-rows-fr">
        {Array(firstDay.getDay())
          .fill(null)
          .map((_, idx) => (
            <div key={`empty-start-${idx}`} className="bg-gray-50 dark:bg-gray-900 p-1"></div>
          ))}

        {days.map((day) => {
          const conferenciasDelDia = getConferenciasByDay(day);
          const dayKey = day.toString();
          const isHovered = hoveredDay === dayKey;
          
          return (
            <div
              key={dayKey}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => setHoveredDay(dayKey)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`relative min-h-[120px] border border-gray-200 dark:border-gray-700 p-1 cursor-pointer transition-all duration-200 ${
                isSameMonth(day, currentDate)
                  ? "bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              } ${isHovered ? "border-blue-300 dark:border-blue-600" : ""}`}
            >
              <div className="font-medium mb-1">{format(day, "d")}</div>
              
              {/* Overlay para mostrar "Agendar Reservación" */}
              {isHovered && (
                <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center rounded z-20">
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                    Agendar Reservación
                  </span>
                </div>
              )}
              
              <div className="space-y-1 relative z-10">
                {conferenciasDelDia.map((conf) => {
                  const inicio = parseISO(conf.fechaInicio);
                  const fin = parseISO(conf.fechaFin);
                  
                  return (
                    <div
                      key={conf.id}
                      onClick={(e) => handleConferenciaClick(conf.id, e)}
                      className={`${conf.color} text-white text-xs p-1 rounded truncate cursor-pointer hover:opacity-90 transition-transform hover:scale-105 relative z-30`}
                      title={`${conf.titulo} - ${conf.nombreSala}`}
                    >
                      <div className="font-medium">{conf.titulo}</div>
                      <div>
                        {format(inicio, "HH:mm")} - {format(fin, "HH:mm")}
                      </div>
                      <div className="text-xs opacity-90">{conf.nombreSala}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {Array(6 - lastDay.getDay())
          .fill(null)
          .map((_, idx) => (
            <div key={`empty-end-${idx}`} className="bg-gray-50 dark:bg-gray-900 p-1"></div>
          ))}
      </div>
    </div>
  );
}