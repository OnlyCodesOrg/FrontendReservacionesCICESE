"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Clock, MapPin, Users, Eye, Filter, CheckCircle, XCircle, Computer } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import Cookies from "js-cookie";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { Reservacion } from "@/types/reservacion";

interface SolicitudPendiente {
    id: number;
    participantes: number;
    estadoSolicitud: string;
    numeroReservacion: string;
    nombreEvento: string;
    tipoEvento: string;
    fechaEvento: string;
    horaInicio: string;
    horaFin: string;
    solicitante: {
        nombre: string;
        email: string;
        departamento: string;
    };
    sala: {
        nombre: string;
        ubicacion: string;
    };
    tecnicoResponsable: {
        id: number;
        nombre: string;
        especialidad?: string;
    };
    observaciones?: string;
}

function SolicitudesTecnicoContent() {
    const router = useRouter();
    const { user, getUserId, fetchWithAuth } = useAuth();
    const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([]);
    const [filteredSolicitudes, setFilteredSolicitudes] = useState<SolicitudPendiente[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [participantsFilter, setParticipantsFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSolicitudesPendientes = async () => {
        try {
            setLoading(true);
            setError(null);

            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const userId = getUserId();

            if (!userId) {
                throw new Error('No hay sesión activa');
            }

            const response = await fetchWithAuth(`${API_URL}/reservaciones/solicitudes-pendientes/${userId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener las solicitudes pendientes');
            }

            const data = await response.json();

            // Debug: ver el formato de fecha que viene del backend
            console.log('Primera solicitud del backend:', {
                fechaEvento: data[0]?.fechaEvento,
                formatoInput: dateFilter
            });

            // Los datos ya vienen con toda la información necesaria del backend
            setSolicitudes(data);
            setFilteredSolicitudes(data);
        } catch (err) {
            console.error('Error al obtener las solicitudes:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar las solicitudes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSolicitudesPendientes();
        } else {
            setSolicitudes([]);
            setFilteredSolicitudes([]);
        }
    }, [user]);

    // Filtrar solicitudes
    useEffect(() => {
        let filtered = solicitudes;

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(solicitud =>
                solicitud.numeroReservacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                solicitud.nombreEvento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                solicitud.solicitante.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por fecha
        if (dateFilter) {
            console.log('Fecha seleccionada en el filtro:', dateFilter);

            filtered = filtered.filter(solicitud => {
                try {
                    // Convertir ambas fechas a objetos Date usando solo la parte YYYY-MM-DD
                    const fechaEventoStr = solicitud.fechaEvento.split('T')[0];
                    const fechaEvento = new Date(fechaEventoStr);
                    const fechaFiltro = new Date(dateFilter);

                    // Comparar los componentes de la fecha por separado para evitar problemas de zona horaria
                    const coinciden =
                        fechaEvento.getUTCFullYear() === fechaFiltro.getUTCFullYear() &&
                        fechaEvento.getUTCMonth() === fechaFiltro.getUTCMonth() &&
                        fechaEvento.getUTCDate() === fechaFiltro.getUTCDate();

                    console.log('Comparando fechas:', {
                        fechaEvento: fechaEventoStr,
                        fechaFiltro: dateFilter,
                        coinciden: coinciden
                    });

                    return coinciden;
                } catch (error) {
                    console.error('Error al filtrar por fecha:', error, {
                        fechaEvento: solicitud.fechaEvento,
                        dateFilter
                    });
                    return false;
                }
            });
        }

        // Filtrar por participantes
        if (participantsFilter !== "all") {
            const range = participantsFilter.split("-");
            const min = parseInt(range[0]);
            const max = range[1] === "+" ? Infinity : parseInt(range[1]);

            filtered = filtered.filter(solicitud => {
                const participantes = solicitud.participantes || 0;
                return participantes >= min && participantes <= max;
            });
        }

        // Filtrar por estado de solicitud
        if (statusFilter !== "all") {
            filtered = filtered.filter(solicitud =>
                solicitud.estadoSolicitud.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        setFilteredSolicitudes(filtered);
    }, [searchTerm, dateFilter, participantsFilter, statusFilter, solicitudes]);

    const handleAprobarSolicitud = async (id: number) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const solicitud = solicitudes.find(s => s.id === id);
            
            if (!solicitud) {
                return;
            }

            const userId = getUserId();
            console.log('Aprobando solicitud:', {
                id,
                numeroReservacion: solicitud.numeroReservacion,
                idTecnico: userId,
                URL: `${API_URL}/reservaciones/procesar-aprobacion`
            });

            if (!userId) {
                throw new Error('No se pudo obtener el ID del usuario');
            }

            const tecnicoId = solicitud.tecnicoResponsable?.id;
            
            if (!tecnicoId) {
                throw new Error('No se pudo obtener el ID del técnico responsable');
            }

            console.log('IDs identificados:', {
                userId: userId,
                tecnicoId: tecnicoId
            });

            const requestBody = {
                numeroReservacion: solicitud.numeroReservacion,
                accion: 'aprobar',
                motivo: 'Aprobada por técnico',
                idTecnicoAprobador: tecnicoId  // Usar ID del técnico, no del usuario
            };


            const response = await fetchWithAuth(`${API_URL}/reservaciones/procesar-aprobacion`, {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Solicitud aprobada exitosamente:', result);
                
                
                // Recargar las solicitudes para mostrar el cambio de estado
                await fetchSolicitudesPendientes();
            } else {
                const errorData = await response.text();
                throw new Error(`Error del servidor (${response.status}): ${errorData}`);
            }
        } catch (error) {
            console.error('Error completo:', error);
        }
    };

    const formatFechaSafe = (fechaString: string) => {
        if (!fechaString) return 'Fecha no disponible';

        try {
            const fecha = parseISO(fechaString);
            if (!isValid(fecha)) return 'Fecha inválida';
            return format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es });
        } catch (error) {
            return 'Error en fecha';
        }
    };

    const formatFechaCorta = (fechaString: string) => {
        if (!fechaString) return '';

        try {
            const fecha = parseISO(fechaString);
            if (!isValid(fecha)) return '';
            return format(fecha, "dd MMM", { locale: es });
        } catch (error) {
            return '';
        }
    };

    const formatHoraSafe = (horaString: string) => {
        if (!horaString) return '--:--';

        // Debug temporal - remover después
        console.log('Formateando hora:', horaString);

        try {
            // Si viene en formato TIME de SQL (HH:MM:SS) o ya es HH:MM
            if (horaString.includes(':')) {
                const timeParts = horaString.split(':');
                const hours = parseInt(timeParts[0]);

                // Validar que tenemos al menos 2 partes y que hours es un número válido
                if (timeParts.length < 2 || isNaN(hours) || hours < 0 || hours > 23) {
                    return '--:--';
                }

                const minutes = timeParts[1].padStart(2, '0'); // Asegurar que siempre tenga 2 dígitos

                // Convertir a formato 12 horas con am/pm
                if (hours === 0) {
                    return `12:${minutes} am`;
                } else if (hours < 12) {
                    return `${hours}:${minutes} am`;
                } else if (hours === 12) {
                    return `12:${minutes} pm`;
                } else {
                    return `${hours - 12}:${minutes} pm`;
                }
            }

            // Si viene como fecha completa, intentar parsear como ISO
            if (horaString.includes('T') || horaString.includes('-')) {
                const hora = parseISO(horaString);
                if (!isValid(hora)) return '--:--';
                return format(hora, "h:mm a", { locale: es });
            }

            // Si no coincide con ningún formato conocido
            return '--:--';
        } catch (error) {
            console.error('Error al formatear hora:', error, 'Hora original:', horaString);
            return '--:--';
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'aprobada':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
            case 'rechazada':
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
            case 'completada':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
        }
    };

    const getEstadoTexto = (estado: string) => {
        switch (estado.toLowerCase()) {
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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 dark:text-red-400 text-xl mb-4">⚠️</div>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    <button
                        onClick={fetchSolicitudesPendientes}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando solicitudes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Solicitudes</h1>
                </div>
            </div>

            {/* Filters */}
            <div className="relative flex-1 ">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por número de registro o nombre del evento"
                    className="block min-w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
            </div>
            <div className="grid gap-4 md:flex md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Fecha
                        </label>
                        <input
                            type="date"
                            id="dateFilter"
                            value={dateFilter}
                            onChange={(e) => {
                                console.log('Fecha seleccionada:', e.target.value);
                                setDateFilter(e.target.value);
                            }}
                            className="block w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                        />
                    </div>
                    {/* Filtro de participantes*/}
                    <div>
                        <label htmlFor="participantsFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Participantes
                        </label>
                        <select
                            id="participantsFilter"
                            value={participantsFilter}
                            onChange={(e) => setParticipantsFilter(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 transition-colors"
                        >
                            <option value="all">Todos</option>
                            <option value="1-10">1-10 participantes</option>
                            <option value="11-20">11-20 participantes</option>
                            <option value="21-30">21-30 participantes</option>
                            <option value="31-+">30+ participantes</option>
                        </select>
                    </div>
                    {/* Filtro de estado*/}
                    <div>
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Estado
                        </label>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 transition-colors"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="aprobada">Aprobada</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            {filteredSolicitudes.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No se encontraron solicitudes</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSolicitudes.map((solicitud) => (
                        <div key={solicitud.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
                            <div className="flex">
                                {/* Calendar Section */}
                                <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 p-4 flex flex-col items-center justify-center min-w-[100px] border-r border-gray-200 dark:border-gray-700">
                                    <div className="text-center">
                                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">
                                            {format(new Date(solicitud.fechaEvento.split('T')[0] + 'T12:00:00'), "MMM", { locale: es })}
                                        </div>
                                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                            {solicitud.fechaEvento.split('T')[0].split('-')[2]}
                                        </div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                                            {format(new Date(solicitud.fechaEvento.split('T')[0] + 'T12:00:00'), "EEE", { locale: es })}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                {solicitud.nombreEvento}
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    #{solicitud.numeroReservacion}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(solicitud.estadoSolicitud)}`}>
                                                    {getEstadoTexto(solicitud.estadoSolicitud)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{formatHoraSafe(solicitud.horaInicio)} - {formatHoraSafe(solicitud.horaFin)}</span>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{solicitud.sala.nombre} ({solicitud.sala.ubicacion})</span>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <Users className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{solicitud.participantes} Participantes</span>
                                        </div>

                                        <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                                            <Computer className="h-4 w-4 mr-2 text-gray-400" />
                                            <span>{solicitud.observaciones || 'No se solicitó equipo.'}</span>
                                        </div>
                                    </div>


                                    {/* Actions */}
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => router.push(`/dashboard/conferencia/${solicitud.id}`)}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                                        >
                                            Ver Detalles
                                        </button>
                                        <button
                                            onClick={() => handleAprobarSolicitud(solicitud.id)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                        >
                                            Aceptar Solicitud
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SolicitudesTecnicoPage() {
    return (
        <AuthGuard>
            <SolicitudesTecnicoContent />
        </AuthGuard>
    );
}
