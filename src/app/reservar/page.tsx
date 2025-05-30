"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parse, isAfter, isBefore, isEqual, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Room, User } from "@/types/globals";
import { ReservationFormData, DisponibilidadHorario, Conferencia } from "@/types/components";
import Calendar from "@/components/Calendario";

export default function ReservarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [salas, setSalas] = useState<Room[]>([]);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<ReservationFormData>>({
    title: "",
    description: "",
    roomId: "",
    startTime: new Date(),
    endTime: new Date(),
    attendees: 1,
    requiredEquipment: [],
    requesterId: "",
    requesterName: ""
  });
  
  // Conferencias existentes (reservas)
  const [conferencias, setConferencias] = useState<Conferencia[]>([]);
  
  // Horarios disponibles para selección
  const [horariosDisponibles, setHorariosDisponibles] = useState<{value: string, label: string, disponible: boolean}[]>([]);
  const [horaInicioSeleccionada, setHoraInicioSeleccionada] = useState("");
  const [horaFinSeleccionada, setHoraFinSeleccionada] = useState("");
  const [equipoDisponible, setEquipoDisponible] = useState([
    { id: "proyector", name: "Proyector" },
    { id: "audio", name: "Sistema de Audio" },
    { id: "videoconferencia", name: "Equipo de Videoconferencia" },
    { id: "pizarra", name: "Pizarra Inteligente" },
    { id: "computadoras", name: "Computadoras" }
  ]);
  
  // Directorio institucional simulado
  const [directorioInstitucional, setDirectorioInstitucional] = useState<User[]>([
    {
      id: "user1",
      name: "Usuario de Prueba",
      email: "usuario@cicese.edu.mx",
      role: "user",
      department: "Oceanografía"
    },
    {
      id: "user2",
      name: "Ana Rodríguez",
      email: "arodriguez@cicese.edu.mx",
      role: "user",
      department: "Física"
    },
    {
      id: "user3",
      name: "Carlos Mendoza",
      email: "cmendoza@cicese.edu.mx",
      role: "user",
      department: "Biología"
    },
    {
      id: "user4",
      name: "Laura Sánchez",
      email: "lsanchez@cicese.edu.mx",
      role: "admin",
      department: "Administración"
    }
  ]);
  
  // Estado para controlar si se muestra el directorio
  const [mostrarDirectorio, setMostrarDirectorio] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Manejar la selección de un día y mostrar disponibilidad
  const handleDaySelect = (date: Date, disponibilidadHorarios: DisponibilidadHorario[]) => {
    setSelectedDate(date);
    
    // Actualizar el formulario con la fecha seleccionada
    const fechaStr = format(date, 'yyyy-MM-dd');
    
    // Buscar el primer horario disponible
    const primerHorarioDisponible = disponibilidadHorarios.find(slot => slot.disponible);
    
    if (primerHorarioDisponible) {
      const horaInicio = primerHorarioDisponible.horaInicio;
      const horaFin = primerHorarioDisponible.horaFin;
      
      const horaInicioObj = parse(`${fechaStr} ${horaInicio}`, 'yyyy-MM-dd HH:mm', new Date());
      const horaFinObj = parse(`${fechaStr} ${horaFin}`, 'yyyy-MM-dd HH:mm', new Date());
      
      setFormData(prev => ({
        ...prev,
        startTime: horaInicioObj,
        endTime: horaFinObj
      }));
      
      setHoraInicioSeleccionada(horaInicio);
      setHoraFinSeleccionada(horaFin);
      
      // Generar opciones de horarios
      generarOpcionesHorarios(fechaStr);
    }
    
    // Ocultar el calendario después de seleccionar una fecha
    setShowCalendar(false);
  };
  
  // Generar opciones de horarios disponibles
  const generarOpcionesHorarios = (fecha: string) => {
    const horarios = [];
    for (let hora = 8; hora < 20; hora++) {
      // Hora en punto
      const horaStr = `${hora.toString().padStart(2, '0')}:00`;
      const horaObj = parse(`${fecha} ${horaStr}`, "yyyy-MM-dd HH:mm", new Date());
      const disponible = verificarDisponibilidad(horaObj, fecha);
      
      horarios.push({ 
        value: horaStr, 
        label: horaStr,
        disponible: disponible
      });
      
      // Media hora
      const mediaHoraStr = `${hora.toString().padStart(2, '0')}:30`;
      const mediaHoraObj = parse(`${fecha} ${mediaHoraStr}`, "yyyy-MM-dd HH:mm", new Date());
      const disponibleMediaHora = verificarDisponibilidad(mediaHoraObj, fecha);
      
      horarios.push({ 
        value: mediaHoraStr, 
        label: mediaHoraStr,
        disponible: disponibleMediaHora
      });
    }
    
    // Agregar la última opción (20:00)
    const ultimaHoraStr = '20:00';
    const ultimaHoraObj = parse(`${fecha} ${ultimaHoraStr}`, "yyyy-MM-dd HH:mm", new Date());
    const disponibleUltimaHora = verificarDisponibilidad(ultimaHoraObj, fecha);
    
    horarios.push({ 
      value: ultimaHoraStr, 
      label: ultimaHoraStr,
      disponible: disponibleUltimaHora
    });
    
    setHorariosDisponibles(horarios);
  };
  
  // Cargar datos iniciales desde los parámetros de URL
  useEffect(() => {
    const fecha = searchParams.get("fecha");
    const horaInicio = searchParams.get("horaInicio");
    const horaFin = searchParams.get("horaFin");
    const confsParam = searchParams.get("conferencias");
    
    // Cargar conferencias existentes si se pasan como parámetro
    if (confsParam) {
      try {
        const confsData = JSON.parse(decodeURIComponent(confsParam));
        setConferencias(confsData);
      } catch (error) {
        console.error('Error al parsear conferencias:', error);
      }
    }
    
    if (fecha && horaInicio && horaFin) {
      const fechaObj = parse(fecha, "yyyy-MM-dd", new Date());
      const horaInicioObj = parse(`${fecha} ${horaInicio}`, "yyyy-MM-dd HH:mm", new Date());
      const horaFinObj = parse(`${fecha} ${horaFin}`, "yyyy-MM-dd HH:mm", new Date());
      
      setFormData(prev => ({
        ...prev,
        startTime: horaInicioObj,
        endTime: horaFinObj
      }));
      
      setHoraInicioSeleccionada(horaInicio);
      setHoraFinSeleccionada(horaFin);
      
      // Generar opciones de horarios
      generarOpcionesHorarios(fecha);
      
      // Establecer la fecha seleccionada para el calendario
      setSelectedDate(fechaObj);
    }
    
    // Simulación de carga de salas disponibles
    const salasDisponibles: Room[] = [
      { id: "sala1", name: "Auditorio Principal", building: "Edificio A", capacity: 100, hasVideoConference: true, equipment: [], status: 'available' },
      { id: "sala2", name: "Sala de Juntas", building: "Edificio B", capacity: 20, hasVideoConference: true, equipment: [], status: 'available' },
      { id: "sala3", name: "Sala Multimedia", building: "Edificio A", capacity: 30, hasVideoConference: true, equipment: [], status: 'available' },
      { id: "sala4", name: "Laboratorio de Cómputo", building: "Edificio C", capacity: 25, hasVideoConference: false, equipment: [], status: 'available' },
      { id: "sala5", name: "Sala de Conferencias", building: "Edificio B", capacity: 50, hasVideoConference: true, equipment: [], status: 'available' }
    ];
    
    setSalas(salasDisponibles);
    
    // Simulación de usuario actual
    const usuarioActual: User = {
      id: "user1",
      name: "Usuario de Prueba",
      email: "usuario@cicese.edu.mx",
      role: "user",
      department: "Oceanografía"
    };
    
    setUsuario(usuarioActual);
    
    // Establecer el usuario actual como solicitante por defecto
    setFormData(prev => ({
      ...prev,
      requesterId: usuarioActual.id,
      requesterName: usuarioActual.name
    }));
  }, [searchParams]);

  // Función para verificar si una hora está disponible (no hay solapamiento con conferencias existentes)
  const verificarDisponibilidad = (hora: Date, fechaStr: string): boolean => {
    // Si no hay conferencias, todas las horas están disponibles
    if (!conferencias || conferencias.length === 0) return true;
    
    // Verificar si hay alguna conferencia que se solape con esta hora
    return !conferencias.some(conf => {
      // Solo verificar conferencias del mismo día
      const confInicio = parseISO(conf.fechaInicio);
      const confFin = parseISO(conf.fechaFin);
      const confFecha = format(confInicio, 'yyyy-MM-dd');
      
      if (confFecha !== fechaStr) return false;
      
      // Verificar si la hora está dentro del rango de la conferencia
      return isEqual(hora, confInicio) || 
             isEqual(hora, confFin) || 
             (isAfter(hora, confInicio) && isBefore(hora, confFin));
    });
  };
  
  // Verificar si un rango de horas se solapa con alguna conferencia existente
  const verificarSolapamiento = (horaInicio: Date, horaFin: Date): boolean => {
    // Si no hay conferencias, no hay solapamiento
    if (!conferencias || conferencias.length === 0) return false;
    
    // Verificar si hay alguna conferencia que se solape con este rango
    return conferencias.some(conf => {
      const confInicio = parseISO(conf.fechaInicio);
      const confFin = parseISO(conf.fechaFin);
      
      // Verificar solapamiento
      return (
        // Caso 1: La hora de inicio de la reserva está dentro de una conferencia existente
        (isAfter(horaInicio, confInicio) || isEqual(horaInicio, confInicio)) && 
        (isBefore(horaInicio, confFin)) ||
        
        // Caso 2: La hora de fin de la reserva está dentro de una conferencia existente
        (isAfter(horaFin, confInicio)) && 
        (isBefore(horaFin, confFin) || isEqual(horaFin, confFin)) ||
        
        // Caso 3: La reserva engloba completamente a una conferencia existente
        (isBefore(horaInicio, confInicio) && isAfter(horaFin, confFin))
      );
    });
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Manejo especial para los selectores de hora
    if (name === "horaInicio") {
      setHoraInicioSeleccionada(value);
      
      // Actualizar hora de inicio en el formulario
      if (formData.startTime) {
        const nuevaHoraInicio = parse(
          `${format(formData.startTime, 'yyyy-MM-dd')} ${value}`, 
          'yyyy-MM-dd HH:mm', 
          new Date()
        );
        
        setFormData(prev => ({
          ...prev,
          startTime: nuevaHoraInicio
        }));
      }
      return;
    }
    
    if (name === "horaFin") {
      setHoraFinSeleccionada(value);
      
      // Actualizar hora de fin en el formulario
      if (formData.endTime) {
        const nuevaHoraFin = parse(
          `${format(formData.endTime, 'yyyy-MM-dd')} ${value}`, 
          'yyyy-MM-dd HH:mm', 
          new Date()
        );
        
        setFormData(prev => ({
          ...prev,
          endTime: nuevaHoraFin
        }));
      }
      return;
    }
    
    // Para otros campos del formulario
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar cambios en el equipo requerido (checkboxes)
  const handleEquipoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      const equipoActual = prev.requiredEquipment || [];
      
      if (checked) {
        return {
          ...prev,
          requiredEquipment: [...equipoActual, value]
        };
      } else {
        return {
          ...prev,
          requiredEquipment: equipoActual.filter(item => item !== value)
        };
      }
    });
  };
  
  // Manejar la selección de un usuario desde el directorio institucional
  const handleSeleccionUsuario = (usuarioSeleccionado: User) => {
    setFormData(prev => ({
      ...prev,
      requesterId: usuarioSeleccionado.id,
      requesterName: usuarioSeleccionado.name
    }));
    
    // Ocultar el directorio después de seleccionar
    setMostrarDirectorio(false);
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Validar datos
      if (!formData.title || !formData.roomId || !formData.startTime || !formData.endTime || !formData.requesterName) {
        throw new Error("Por favor completa todos los campos obligatorios");
      }
      
      // Validar que la hora de fin sea posterior a la hora de inicio
      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        throw new Error("La hora de fin debe ser posterior a la hora de inicio");
      }
      
      // Validar que no haya solapamiento con conferencias existentes
      if (formData.startTime && formData.endTime && verificarSolapamiento(formData.startTime, formData.endTime)) {
        throw new Error("El horario seleccionado se solapa con una reserva existente. Por favor, elige otro horario.");
      }
      
      // Aquí se haría la llamada a la API para crear la reserva
      // Por ahora simulamos una respuesta exitosa
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Redirigir al calendario después de un tiempo
      setTimeout(() => {
        router.push("/calendario");
      }, 2000);
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocurrió un error al procesar la reserva");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reservar Sala</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Completa el formulario para reservar una sala en CICESE.
          </p>
        </div>
        
        {success ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2">¡Reserva realizada con éxito!</h2>
            <p className="text-green-600 dark:text-green-300">
              Tu reserva ha sido procesada correctamente. Serás redirigido al calendario en unos momentos...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título de la Reserva *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sala *
                </label>
                <select
                  id="roomId"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Selecciona una sala</option>
                  {salas.map(sala => (
                    <option key={sala.id} value={sala.id}>
                      {sala.name} (Capacidad: {sala.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Campo para el solicitante */}
            <div className="mb-6">
              <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Solicitante *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="requesterName"
                  name="requesterName"
                  value={formData.requesterName}
                  onChange={handleChange}
                  placeholder="Nombre completo del solicitante"
                  className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarDirectorio(!mostrarDirectorio)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Directorio
                </button>
              </div>
              
              {/* Directorio institucional */}
              {mostrarDirectorio && (
                <div className="mt-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seleccionar del directorio institucional:</h4>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {directorioInstitucional.map(usuario => (
                      <li key={usuario.id} className="py-2">
                        <button
                          type="button"
                          onClick={() => handleSeleccionUsuario(usuario)}
                          className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <div className="font-medium text-gray-800 dark:text-gray-200">{usuario.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{usuario.email} - {usuario.department}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha y Hora de Inicio *
                </label>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-800 dark:text-gray-200 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 flex-grow">
                      {formData.startTime ? format(formData.startTime, "EEEE d 'de' MMMM, yyyy", { locale: es }) : "No seleccionado"}
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="ml-2 px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <select
                    name="horaInicio"
                    value={horaInicioSeleccionada}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Selecciona hora de inicio</option>
                    {horariosDisponibles.map(horario => (
                      <option 
                        key={`inicio-${horario.value}`} 
                        value={horario.value}
                        disabled={(!horario.disponible) || (!!horaFinSeleccionada && horario.value >= horaFinSeleccionada)}
                      >
                        {horario.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha y Hora de Fin *
                </label>
                <div className="flex flex-col space-y-2">
                  <div className="text-gray-800 dark:text-gray-200 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                    {formData.endTime ? format(formData.endTime, "EEEE d 'de' MMMM, yyyy", { locale: es }) : "No seleccionado"}
                  </div>
                  <select
                    name="horaFin"
                    value={horaFinSeleccionada}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Selecciona hora de fin</option>
                    {horariosDisponibles.map(horario => (
                      <option 
                        key={`fin-${horario.value}`} 
                        value={horario.value}
                        disabled={(!horario.disponible) || (!!horaInicioSeleccionada && horario.value <= horaInicioSeleccionada)}
                      >
                        {horario.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número de Asistentes
                </label>
                <input
                  type="number"
                  id="attendees"
                  name="attendees"
                  value={formData.attendees || ""}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Equipo Requerido
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {equipoDisponible.map(equipo => (
                    <div key={equipo.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`equipo-${equipo.id}`}
                        name="requiredEquipment"
                        value={equipo.id}
                        checked={(formData.requiredEquipment || []).includes(equipo.id)}
                        onChange={handleEquipoChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`equipo-${equipo.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {equipo.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Calendario para seleccionar fecha */}
            {showCalendar && (
              <div className="mt-6 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Selecciona una fecha</h3>
                  <button 
                    type="button"
                    onClick={() => setShowCalendar(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Calendar 
                  conferencias={conferencias} 
                  onDaySelect={() => {}} 
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push("/calendario")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : "Confirmar Reserva"}
              </button>
            </div>
          </form>
        )}
        
        {formData.roomId && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Información de la Sala</h2>
            {salas.filter(sala => sala.id === formData.roomId).map(sala => (
              <div key={sala.id}>
                <h3 className="text-lg font-medium mb-2">{sala.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Capacidad:</span> {sala.capacity} personas
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Ubicación:</span> {sala.building}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Video Conferencia:</span> {sala.hasVideoConference ? 'Disponible' : 'No disponible'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Estado:</span> {sala.status === 'available' ? 'Disponible' : sala.status === 'maintenance' ? 'En mantenimiento' : 'Ocupada'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
