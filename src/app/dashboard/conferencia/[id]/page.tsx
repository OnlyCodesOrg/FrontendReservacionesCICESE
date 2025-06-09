"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import { Conferencia } from "@/types/components";

// Simulación de datos actualizados con la nueva interfaz
const conferenciasData: Conferencia[] = [
  {
    id: "1",
    numeroReservacion: "CONF-2025001",
    titulo: "Avances en Oceanografía",
    fechaInicio: "2025-06-15T10:00:00",
    fechaFin: "2025-06-15T12:00:00",
    color: "bg-blue-500",
    salaId: "sala1",
    nombreSala: "Auditorio Principal",
    solicitante: {
      nombre: "Dra. María Rodríguez",
      email: "maria.rodriguez@cicese.mx",
      departamento: "Oceanografía Física"
    },
    ubicacion: {
      sala: "Auditorio Principal",
      edificio: "Centro de Investigación",
      piso: "Planta Baja",
      capacidadMaxima: 120
    },
    participantes: 85,
    estado: "aprobada",
    fechaCreacion: "2025-06-01T08:30:00",
    enlaceVideoconferencia: "https://zoom.us/j/123456789",
    descripcion: "Presentación sobre los últimos avances en investigación oceanográfica y su impacto en el cambio climático global. Se abordarán temas como corrientes marinas, acidificación oceánica y biodiversidad marina.",
    equipoRequerido: ["Proyector 4K", "Micrófono inalámbrico", "Sistema de videoconferencia", "Pizarrón interactivo"],
    serviciosExtra: ["Transmisión en vivo", "Grabación", "Café de bienvenida", "Material impreso"]
  },
  {
    id: "2",
    numeroReservacion: "CONF-2025002",
    titulo: "Tecnologías Emergentes en Investigación",
    fechaInicio: "2025-06-18T14:00:00",
    fechaFin: "2025-06-18T16:00:00",
    color: "bg-green-500",
    salaId: "sala2",
    nombreSala: "Sala de Conferencias B",
    solicitante: {
      nombre: "Dr. Carlos Vega",
      email: "carlos.vega@cicese.mx",
      departamento: "Ciencias de la Computación"
    },
    ubicacion: {
      sala: "Sala de Conferencias B",
      edificio: "Edificio Principal",
      piso: "Piso 2",
      capacidadMaxima: 50
    },
    participantes: 45,
    estado: "aprobada",
    fechaCreacion: "2025-06-03T14:15:00",
    enlaceVideoconferencia: "https://teams.microsoft.com/l/meetup-join/19%3a...",
    descripcion: "Exploración de tecnologías emergentes como inteligencia artificial, machine learning y computación cuántica aplicadas a la investigación científica.",
    equipoRequerido: ["Proyector", "Computadora con GPU", "Sistema de audio"],
    serviciosExtra: ["Demostración interactiva", "Acceso a laboratorio", "Networking"]
  },
  {
    id: "3",
    numeroReservacion: "CONF-2025003",
    titulo: "Ecosistemas Marinos del Pacífico",
    fechaInicio: "2025-06-22T09:00:00",
    fechaFin: "2025-06-22T11:30:00",
    color: "bg-purple-500",
    salaId: "sala1",
    nombreSala: "Auditorio Principal",
    solicitante: {
      nombre: "Dr. Juan Méndez",
      email: "juan.mendez@cicese.mx",
      departamento: "Biología Marina"
    },
    ubicacion: {
      sala: "Auditorio Principal",
      edificio: "Centro de Investigación",
      piso: "Planta Baja",
      capacidadMaxima: 120
    },
    participantes: 110,
    estado: "aprobada",
    fechaCreacion: "2025-06-05T11:45:00",
    enlaceVideoconferencia: "https://meet.google.com/abc-defg-hij",
    descripcion: "Estudio detallado de ecosistemas marinos y biodiversidad en la costa del Pacífico mexicano. Incluye análisis de especies endémicas y estrategias de conservación.",
    equipoRequerido: ["Proyector", "Sistema de audio profesional", "Micrófono de solapa"],
    serviciosExtra: ["Transmisión en vivo", "Traducción simultánea", "Material científico", "Refrigerio"]
  },
  {
    id: "4",
    numeroReservacion: "CONF-2025004",
    titulo: "Modelado Climático y Predicciones",
    fechaInicio: "2025-06-25T13:00:00",
    fechaFin: "2025-06-25T15:00:00",
    color: "bg-yellow-500",
    salaId: "sala3",
    nombreSala: "Sala Multimedia",
    solicitante: {
      nombre: "Dra. Ana López",
      email: "ana.lopez@cicese.mx",
      departamento: "Geofísica"
    },
    ubicacion: {
      sala: "Sala Multimedia",
      edificio: "Edificio Principal",
      piso: "Piso 1",
      capacidadMaxima: 80
    },
    participantes: 65,
    estado: "pendiente",
    fechaCreacion: "2025-06-08T16:20:00",
    enlaceVideoconferencia: "https://zoom.us/j/987654321",
    descripcion: "Análisis de modelos climáticos avanzados y previsiones para las próximas décadas, con enfoque en el impacto del cambio climático en regiones costeras.",
    equipoRequerido: ["Sistema audiovisual completo", "Computadora de alto rendimiento", "Pantalla de alta resolución"],
    serviciosExtra: ["Simulaciones en tiempo real", "Acceso a supercomputadora", "Documentación técnica"]
  },
  {
    id: "5",
    numeroReservacion: "CONF-2025005",
    titulo: "IA Aplicada a Ciencias Marinas",
    fechaInicio: "2025-06-28T16:00:00",
    fechaFin: "2025-06-28T18:00:00",
    color: "bg-red-500",
    salaId: "sala2",
    nombreSala: "Sala de Conferencias B",
    solicitante: {
      nombre: "Dr. Roberto García",
      email: "roberto.garcia@cicese.mx",
      departamento: "Oceanografía Física"
    },
    ubicacion: {
      sala: "Sala de Conferencias B",
      edificio: "Edificio Principal",
      piso: "Piso 2",
      capacidadMaxima: 50
    },
    participantes: 48,
    estado: "completada",
    fechaCreacion: "2025-06-10T13:30:00",
    enlaceVideoconferencia: "https://teams.microsoft.com/l/meetup-join/confidencial",
    descripcion: "Aplicaciones innovadoras de la inteligencia artificial en la investigación de ciencias marinas, incluyendo análisis de datos oceanográficos y predicción de patrones climáticos.",
    equipoRequerido: ["Computadora con GPU", "Proyector 4K", "Sistema de audio", "Conexión de alta velocidad"],
    serviciosExtra: ["Demostración práctica", "Código fuente disponible", "Workshop hands-on", "Certificado de participación"]
  }
];

export default function ConferenciaDetalle({ params }: { params: { id: string } }) {
  const [conferencia, setConferencia] = useState<Conferencia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga de datos (en un proyecto real esto sería una llamada a la API)
    const fetchConferencia = async () => {
      try {
        // Simular tiempo de carga
        setTimeout(() => {
          const encontrada = conferenciasData.find(conf => conf.id === params.id);
          if (encontrada) {
            setConferencia(encontrada);
          }
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error al cargar la conferencia:", error);
        setLoading(false);
      }
    };

    fetchConferencia();
  }, [params.id]);

  // Mostrar pantalla de carga mientras se obtienen los datos
  if (loading) {
    return (
      <div className="ml-64 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando conferencia...</p>
        </div>
      </div>
    );
  }

  // Si no se encuentra la conferencia, mostrar 404
  if (!conferencia) {
    notFound();
  }

  const fechaInicio = parseISO(conferencia.fechaInicio);
  const fechaFin = parseISO(conferencia.fechaFin);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobada':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'rechazada':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'completada':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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

  return (
    <div className="ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <Link 
          href="/dashboard/calendario" 
          className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Volver al calendario
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Encabezado de la conferencia */}
          <div className={`${conferencia.color} px-6 py-4 text-white`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold">{conferencia.titulo}</h1>
                <p className="mt-1 text-white/90">ID: {conferencia.numeroReservacion}</p>
                <div className="mt-2 flex items-center flex-wrap gap-4">
                  <span>
                    {format(fechaInicio, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                  <span className="bg-white/20 px-2 py-1 rounded text-sm">
                    {format(fechaInicio, "HH:mm")} - {format(fechaFin, "HH:mm")}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(conferencia.estado)}`}>
                {getEstadoTexto(conferencia.estado)}
              </span>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Columna 1: Información básica */}
              <div className="col-span-2">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Descripción</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {conferencia.descripcion}
                </p>

                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Solicitante</h2>
                <div className="flex items-center mb-6">
                  <div className="bg-blue-600 h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                    {conferencia.solicitante.nombre.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900 dark:text-white">{conferencia.solicitante.nombre}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{conferencia.solicitante.email}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{conferencia.solicitante.departamento}</p>
                  </div>
                </div>

                {conferencia.equipoRequerido && conferencia.equipoRequerido.length > 0 && (
                  <>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Equipo Requerido</h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {conferencia.equipoRequerido.map((equipo, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md"
                        >
                          {equipo}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {conferencia.serviciosExtra && conferencia.serviciosExtra.length > 0 && (
                  <>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Servicios Extra</h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {conferencia.serviciosExtra.map((servicio, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-md"
                        >
                          {servicio}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {conferencia.enlaceVideoconferencia && (
                  <>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Videoconferencia</h2>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                      <a
                        href={conferencia.enlaceVideoconferencia}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 break-all"
                      >
                        {conferencia.enlaceVideoconferencia}
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* Columna 2: Detalles y Acciones */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Detalles del Evento</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">Ubicación</h3>
                    <p className="font-medium text-gray-900 dark:text-white">{conferencia.ubicacion.sala}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {conferencia.ubicacion.edificio}, {conferencia.ubicacion.piso}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">Capacidad Máxima</h3>
                    <p className="font-medium text-gray-900 dark:text-white">{conferencia.ubicacion.capacidadMaxima} personas</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">Participantes Registrados</h3>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {conferencia.participantes} / {conferencia.ubicacion.capacidadMaxima}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(conferencia.participantes / conferencia.ubicacion.capacidadMaxima) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</h3>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(parseISO(conferencia.fechaCreacion), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 space-y-3">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                    Registrar Asistencia
                  </button>
                  
                  <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded dark:bg-gray-600 dark:border-gray-500 dark:hover:bg-gray-500 dark:text-white transition-colors">
                    Reportar Problema
                  </button>
                  
                  <Link
                    href={`/dashboard/modificar-reservacion/${conferencia.id}`}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors text-center block"
                  >
                    Modificar Reservación
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}