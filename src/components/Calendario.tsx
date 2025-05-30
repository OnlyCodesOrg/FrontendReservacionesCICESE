"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO, isAfter, isBefore, isEqual, set } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Conferencia, DisponibilidadHorario } from "@/types/components";

export interface CalendarProps {
  conferencias: Conferencia[];
  onDaySelect?: (date: Date, disponibilidad: DisponibilidadHorario[]) => void;
}

export default function Calendar({ conferencias, onDaySelect }: CalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadHorario[]>([]);
  const [loading, setLoading] = useState(false);

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
  
  // Verificar disponibilidad de horarios para un día específico
  const checkDisponibilidad = async (day: Date) => {
    setLoading(true);
    try {
      // Aquí se haría la llamada a la API para obtener la disponibilidad real
      // Por ahora simulamos la respuesta con datos de ejemplo
      
      // Horarios estándar de operación (8:00 AM - 8:00 PM) con intervalos de 30 minutos
      const horariosBase = [
        { horaInicio: '08:00', horaFin: '09:00', disponible: true },
        { horaInicio: '09:00', horaFin: '10:00', disponible: true },
        { horaInicio: '10:00', horaFin: '11:00', disponible: true },
        { horaInicio: '11:00', horaFin: '12:00', disponible: true },
        { horaInicio: '12:00', horaFin: '13:00', disponible: true },
        { horaInicio: '13:00', horaFin: '14:00', disponible: true },
        { horaInicio: '14:00', horaFin: '15:00', disponible: true },
        { horaInicio: '15:00', horaFin: '16:00', disponible: true },
        { horaInicio: '16:00', horaFin: '17:00', disponible: true },
        { horaInicio: '17:00', horaFin: '18:00', disponible: true },
        { horaInicio: '18:00', horaFin: '19:00', disponible: true },
        { horaInicio: '19:00', horaFin: '20:00', disponible: true }
      ];
      
      // Marcar horarios como no disponibles basados en las conferencias existentes
      const confsDelDia = getConferenciasByDay(day);
      
      const horariosActualizados = horariosBase.map(horario => {
        // Convertir horarios a objetos Date para comparación
        const horaInicioBase = set(day, { 
          hours: parseInt(horario.horaInicio.split(':')[0]), 
          minutes: parseInt(horario.horaInicio.split(':')[1]),
          seconds: 0
        });
        
        const horaFinBase = set(day, { 
          hours: parseInt(horario.horaFin.split(':')[0]), 
          minutes: parseInt(horario.horaFin.split(':')[1]),
          seconds: 0
        });
        
        // Verificar si hay alguna conferencia que se solape con este horario
        const estaOcupado = confsDelDia.some(conf => {
          const confInicio = parseISO(conf.fechaInicio);
          const confFin = parseISO(conf.fechaFin);
          
          // Verificar solapamiento
          return (
            (isAfter(confInicio, horaInicioBase) || isEqual(confInicio, horaInicioBase)) && 
            (isBefore(confInicio, horaFinBase)) ||
            (isAfter(confFin, horaInicioBase)) && 
            (isBefore(confFin, horaFinBase) || isEqual(confFin, horaFinBase)) ||
            (isBefore(confInicio, horaInicioBase) && isAfter(confFin, horaFinBase))
          );
        });
        
        // Si está ocupado, agregar información de la sala
        if (estaOcupado) {
          const confQueOcupa = confsDelDia.find(conf => {
            const confInicio = parseISO(conf.fechaInicio);
            const confFin = parseISO(conf.fechaFin);
            
            return (
              (isAfter(confInicio, horaInicioBase) || isEqual(confInicio, horaInicioBase)) && 
              (isBefore(confInicio, horaFinBase)) ||
              (isAfter(confFin, horaInicioBase)) && 
              (isBefore(confFin, horaFinBase) || isEqual(confFin, horaFinBase)) ||
              (isBefore(confInicio, horaInicioBase) && isAfter(confFin, horaFinBase))
            );
          });
          
          return {
            ...horario,
            disponible: false,
            salaId: confQueOcupa?.salaId,
            nombreSala: confQueOcupa?.nombreSala
          };
        }
        
        return horario;
      });
      
      setDisponibilidad(horariosActualizados);
      
      // Si hay un callback de selección, llamarlo con la fecha y disponibilidad
      if (onDaySelect) {
        onDaySelect(day, horariosActualizados);
      }
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      // Mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  // Función para navegar a la página de detalles
  const handleConferenciaClick = (id: string) => {
    router.push(`/conferencia/${id}`);
  };
  
  // Función para manejar la selección de un día
  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    checkDisponibilidad(day);
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
          
          return (
            <div
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              className={`min-h-[120px] border border-gray-200 dark:border-gray-700 p-1 ${
                isSameMonth(day, currentDate)
                  ? "bg-white dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-400"
              } ${
                selectedDay && isSameDay(day, selectedDay)
                  ? "ring-2 ring-blue-500 dark:ring-blue-400"
                  : ""
              } hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200`}
            >
              <div className="font-medium mb-1">{format(day, "d")}</div>
              
              <div className="space-y-1">
                {conferenciasDelDia.map((conf) => {
                  const inicio = parseISO(conf.fechaInicio);
                  const fin = parseISO(conf.fechaFin);
                  
                  return (
                    <div
                      key={conf.id}
                      onClick={() => handleConferenciaClick(conf.id)}
                      className={`${conf.color} text-white text-xs p-1 rounded truncate cursor-pointer hover:opacity-90 transition-transform hover:scale-105`}
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
      
      {/* Panel de disponibilidad */}
      {selectedDay && (
        <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              Horarios disponibles para {format(selectedDay, "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </h3>
            <button 
              onClick={() => setSelectedDay(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {disponibilidad.map((slot, index) => (
                <div 
                  key={`${slot.horaInicio}-${index}`}
                  className={`p-3 rounded-lg border ${slot.disponible 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/50' 
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30'}`}
                  onClick={() => {
                    if (slot.disponible) {
                      // Codificar las conferencias para pasarlas como parámetro
                      const confsParam = encodeURIComponent(JSON.stringify(conferencias));
                      // Navegar a la página de reserva con todos los datos necesarios
                      router.push(`/reservar?fecha=${format(selectedDay, 'yyyy-MM-dd')}&horaInicio=${slot.horaInicio}&horaFin=${slot.horaFin}&conferencias=${confsParam}`);
                    }
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{slot.horaInicio} - {slot.horaFin}</span>
                    {slot.disponible ? (
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">Disponible</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 text-sm font-medium">Ocupado</span>
                    )}
                  </div>
                  {!slot.disponible && slot.nombreSala && (
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Reservado: {slot.nombreSala}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => router.push('/reservar')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Reservar sala
            </button>
          </div>
        </div>
      )}
    </div>
  );
}