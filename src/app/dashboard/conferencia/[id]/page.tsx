"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import Cookies from 'js-cookie';

// Tipos para la respuesta de la API
interface APIResponse {
  id: number;
  numeroReservacion: string;
  nombreEvento: string;
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
  estadoSolicitud: 'pendiente' | 'aprobada' | 'rechazada' | 'completada';
  numeroAsistentesEstimado: number;
  fechaCreacionSolicitud: string;
  linkReunionOnline: string | null;
  observaciones: string | null;
  equipoRequerido: string | null;
  serviciosExtra: string | null;
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

// Tipos para el componente
interface Conferencia {
  id: string;
  numeroReservacion: string;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  color: string;
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
  descripcion: string;
  equipoRequerido: string[];
  serviciosExtra: string[];
}

export default function ConferenciaDetalle({ params }: { params: { id: string } }) {
  const [conferencia, setConferencia] = useState<Conferencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading, fetchWithAuth, getUserId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchConferencia = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verificar que tengamos acceso a fetchWithAuth
        if (!fetchWithAuth) {
          router.push('/auth/login');
          return;
        }
        
        
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/reservaciones/reservacion/${params.id}`, {
          credentials: 'include',
        });

        if (!response.ok) {

          if (response.status === 404) {
            notFound();
          }
        }

        const data: APIResponse = await response.json();
        // Transformar los datos al formato esperado por el componente
        const reservacion: Conferencia = {
          id: data.id.toString(),
          numeroReservacion: data.numeroReservacion,
          titulo: data.nombreEvento,
          fechaInicio: `${data.fechaEvento}T${data.horaInicio}`,
          fechaFin: `${data.fechaEvento}T${data.horaFin}`,
          color: getColorByEstado(data.estadoSolicitud),
          solicitante: {
            nombre: `${data.usuario.nombre} ${data.usuario.apellido}`,
            email: data.usuario.email,
            departamento: data.usuario.departamento || 'No especificado'
          },
          ubicacion: {
            sala: data.sala.nombreSala,
            edificio: data.sala.ubicacion,
            piso: data.sala.piso || 'No especificado',
            capacidadMaxima: data.sala.capacidad
          },
          participantes: data.numeroAsistentesEstimado,
          estado: data.estadoSolicitud,
          fechaCreacion: data.fechaCreacionSolicitud,
          ...(data.linkReunionOnline && { enlaceVideoconferencia: data.linkReunionOnline }),
          descripcion: data.observaciones || 'Sin descripción',
          equipoRequerido: data.equipoRequerido ? data.equipoRequerido.split(',').map((item: string) => item.trim()) : [],
          serviciosExtra: data.serviciosExtra ? data.serviciosExtra.split(',').map((item: string) => item.trim()) : []
        };

        setConferencia(reservacion);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al cargar la conferencia');
        toast.error('Error al cargar los datos de la reservación');
      } finally {
        setLoading(false);
      }
    };

    fetchConferencia();
  }, [params.id, user, authLoading, router]);

  const getColorByEstado = (estado: 'pendiente' | 'aprobada' | 'rechazada' | 'completada'): string => {
    switch (estado) {
      case 'aprobada':
        return 'bg-green-600';
      case 'pendiente':
        return 'bg-yellow-600';
      case 'rechazada':
        return 'bg-red-600';
      case 'completada':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

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

  if (authLoading || loading) {
    return (
      <div className="ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {authLoading ? 'Verificando autenticación...' : 'Cargando reservación...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Link 
            href="/dashboard/solicitudes"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-block"
          >
            Volver a mis reservaciones
          </Link>
        </div>
      </div>
    );
  }

  if (!conferencia) {
    notFound();
  }

  const fechaInicio = parseISO(conferencia.fechaInicio);
  const fechaFin = parseISO(conferencia.fechaFin);

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href={user?.rol.nombre === 'Técnico' ? '/dashboard/solicitudes-tecnico' : '/dashboard/solicitudes'}
            className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Volver a mis reservaciones
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Encabezado de la conferencia */}
            <div className={`${conferencia.color} px-6 py-6 text-white`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold">{conferencia.titulo}</h1>
                  <p className="mt-1 text-white/90">ID: {conferencia.numeroReservacion}</p>
                  <div className="mt-3 flex items-center flex-wrap gap-4">
                    <span className="text-sm sm:text-base">
                      {format(fechaInicio, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded text-sm">
                      {format(fechaInicio, "HH:mm")} - {format(fechaFin, "HH:mm")}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(conferencia.estado)} self-start sm:self-center`}>
                  {getEstadoTexto(conferencia.estado)}
                </span>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="p-6 sm:p-8">
              <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Columna 1: Información básica */}
                <div className="lg:col-span-2">
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
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg h-fit">
                  <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Detalles del Evento</h2>
                  
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
                          style={{ width: `${Math.min((conferencia.participantes / conferencia.ubicacion.capacidadMaxima) * 100, 100)}%` }}
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
                    {conferencia.estado === 'aprobada' && (
                      <button 
                        onClick={() => toast.success('Asistencia registrada')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                      >
                        Registrar Asistencia
                      </button>
                    )}
                    
                    <button 
                      onClick={() => toast('Reporte enviado al administrador')}
                      className="w-full bg-white border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded dark:bg-gray-600 dark:border-gray-500 dark:hover:bg-gray-500 dark:text-white transition-colors"
                    >
                      Reportar Problema
                    </button>
                    
                    {conferencia.estado === 'pendiente' && user?.email === conferencia.solicitante.email && (
                      <Link
                        href={`/dashboard/modificar-reservacion/${conferencia.id}`}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors text-center block"
                      >
                        Modificar Reservación
                      </Link>
                    )}

                    {conferencia.estado === 'pendiente' && user?.email === conferencia.solicitante.email && (
                      <button
                        onClick={() => toast.error('Función no implementada')}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                      >
                        Cancelar Reservación
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}