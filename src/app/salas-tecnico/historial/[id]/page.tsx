"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  UserIcon,
  AlertCircleIcon,
  WrenchIcon,
  FileTextIcon,
  DownloadIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
} from "lucide-react";

// Importar el hook del generador de PDF
import { usePDFGenerator } from "../../../../components/pdf-reporte-eventos";

// Interfaces
interface HistorialUsoSala {
  id: number;
  numeroReservacion: string;
  nombreEvento: string;
  tipoEvento: string;
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
  numeroAsistentesReal: number | null;
  responsableSala: {
    id: number;
    nombre: string;
    email: string;
  };
  fallasRegistradas: string | null;
  equiposUsados: {
    nombre: string;
    cantidad: number;
    estado: string;
  }[];
}

interface HistorialResponse {
  success: boolean;
  message: string;
  data: HistorialUsoSala[];
}

interface Sala {
  id: number;
  nombreSala: string;
  ubicacion: string;
}

export default function HistorialSalaPage() {
  const params = useParams();
  const router = useRouter();
  const [historial, setHistorial] = useState<HistorialUsoSala[]>([]);
  const [historialFiltrado, setHistorialFiltrado] = useState<
    HistorialUsoSala[]
  >([]);
  const [sala, setSala] = useState<Sala | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limite, setLimite] = useState(50);
  const [offset, setOffset] = useState(0);

  // Estados para filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const salaId = params.id;

  useEffect(() => {
    if (salaId) {
      obtenerHistorial();
      obtenerDatosSala();
    }
  }, [salaId, limite, offset]);

  useEffect(() => {
    aplicarFiltros();
  }, [historial, busqueda, filtroEstado, fechaInicio, fechaFin]);

  const obtenerHistorial = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Obteniendo historial para sala ID:", salaId);
      console.log(
        "🌐 URL completa:",
        `${API_BASE_URL}/salas/historial/${salaId}?limite=${limite}&offset=${offset}`
      );

      const response = await fetch(
        `${API_BASE_URL}/salas/historial/${salaId}?limite=${limite}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "📡 Respuesta del servidor:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response body:", errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: HistorialResponse = await response.json();
      console.log("📊 Datos recibidos del backend:", data);

      if (data.success) {
        console.log(
          "✅ Historial obtenido exitosamente:",
          data.data.length,
          "eventos"
        );
        setHistorial(data.data);
      } else {
        console.error("❌ Backend respondió con error:", data.message);
        setError(data.message || "Error al obtener el historial");
      }
    } catch (err) {
      console.error("💥 Error al obtener historial:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar el historial"
      );
    } finally {
      setLoading(false);
    }
  };

  const obtenerDatosSala = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/salas/${salaId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSala(data.data);
        }
      }
    } catch (error) {
      console.warn("No se pudieron obtener los datos de la sala");
    }
  };

  const aplicarFiltros = () => {
    let eventosFiltrados = [...historial];

    // Filtro de búsqueda
    if (busqueda) {
      eventosFiltrados = eventosFiltrados.filter(
        (evento) =>
          evento.nombreEvento.toLowerCase().includes(busqueda.toLowerCase()) ||
          evento.tipoEvento.toLowerCase().includes(busqueda.toLowerCase()) ||
          evento.numeroReservacion
            .toLowerCase()
            .includes(busqueda.toLowerCase()) ||
          evento.responsableSala.nombre
            .toLowerCase()
            .includes(busqueda.toLowerCase())
      );
    }

    // Filtro de estado
    if (filtroEstado !== "todos") {
      if (filtroEstado === "con-fallas") {
        eventosFiltrados = eventosFiltrados.filter(
          (evento) => evento.fallasRegistradas
        );
      } else if (filtroEstado === "sin-fallas") {
        eventosFiltrados = eventosFiltrados.filter(
          (evento) => !evento.fallasRegistradas
        );
      }
    }

    // Filtro de fechas
    if (fechaInicio) {
      eventosFiltrados = eventosFiltrados.filter(
        (evento) => new Date(evento.fechaEvento) >= new Date(fechaInicio)
      );
    }
    if (fechaFin) {
      eventosFiltrados = eventosFiltrados.filter(
        (evento) => new Date(evento.fechaEvento) <= new Date(fechaFin)
      );
    }

    setHistorialFiltrado(eventosFiltrados);
  };

  const convertirHoraAMinutos = (hora: any): number => {
    try {
      if (hora instanceof Date) {
        return hora.getHours() * 60 + hora.getMinutes();
      }
      
      if (typeof hora === 'string') {
        if (hora.includes('T')) {
          const date = new Date(hora);
          return date.getHours() * 60 + date.getMinutes();
        }
        
        if (hora.includes(':')) {
          const [horas, minutos] = hora.split(':').map(Number);
          return horas * 60 + (minutos || 0);
        }
      }
      
      throw new Error('Formato de hora no reconocido');
    } catch (error) {
      console.warn('Error convirtiendo hora a minutos:', hora, error);
      return 0;
    }
  };

  // Cálculos de estadísticas
  const calcularEstadisticas = () => {
    const totalEventos = historial.length;

    const horasDeUso = historial.reduce((total, evento) => {
      const minutosInicio = convertirHoraAMinutos(evento.horaInicio);
      const minutosFin = convertirHoraAMinutos(evento.horaFin);
      
      const diferencia = (minutosFin - minutosInicio) / 60;
      return total + Math.max(0, diferencia);
    }, 0);

    const fallasRegistradas = historial.filter(
      (evento) => evento.fallasRegistradas
    ).length;

    return {
      totalEventos,
      horasDeUso: Math.round(horasDeUso * 10) / 10,
      fallasRegistradas,
    };
  };

  // Hook para el generador de PDF
  const { generarReporte } = usePDFGenerator(sala, historial);

  // Reemplazar la función exportarReporte existente
  const exportarReporte = () => {
    generarReporte();
  };

  const formatearFecha = (fechaISO: string) => {
    return new Date(fechaISO).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearHora = (horaISO: string) => {
    return new Date(horaISO).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerColorTipoEvento = (tipo: string) => {
    const colores = {
      Conferencia:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Reunión:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Capacitación:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Seminario:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Taller: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      Evento:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };
    return (
      colores[tipo as keyof typeof colores] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
  };

  // Función para obtener el rango de asistentes
  const obtenerRangoAsistentes = (numeroAsistentes: number | null): string => {
    if (!numeroAsistentes) return "No registrado";

    if (numeroAsistentes <= 9) return "1-9";
    if (numeroAsistentes <= 19) return "10-19";
    if (numeroAsistentes <= 29) return "20-29";
    if (numeroAsistentes <= 49) return "30-49";
    if (numeroAsistentes <= 99) return "50-99";
    return "100+";
  };

  // Función para determinar si el evento fue completado (basado en la fecha)
  const esEventoCompletado = (fechaEvento: string): boolean => {
    return new Date(fechaEvento) < new Date();
  };

  const verDetallesEvento = (eventoId: number) => {
    console.log("Ver detalles del evento:", eventoId);
    // Aquí puedes implementar la navegación a la página de detalles
    // router.push(`/eventos/${eventoId}/detalles`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando historial de la sala...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <AlertCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Error al cargar el historial
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <div className="space-x-2">
              <button
                onClick={obtenerHistorial}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const estadisticas = calcularEstadisticas();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-400 dark:text-blue-400 hover:text-gray-700 dark:hover:text-blue-300 transition-colors mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-blue-100">
                Historial de Eventos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {sala
                  ? `${sala.nombreSala} - ${sala.ubicacion}`
                  : "Cargando información..."}
              </p>
            </div>
          </div>

          {/* Botón de exportar - ahora usa el componente PDF */}
          <button
            onClick={exportarReporte}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Exportar Reporte
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {estadisticas.totalEventos}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total de Eventos
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {estadisticas.horasDeUso}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Horas de Uso
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {estadisticas.fallasRegistradas}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Fallas Registradas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          {/* Buscador */}
          <div className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre del evento, tipo, reservación o responsable..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros en fila */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <div className="relative">
                <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos los eventos</option>
                  <option value="con-fallas">Con fallas</option>
                  <option value="sin-fallas">Sin fallas</option>
                </select>
              </div>
            </div>

            {/* Fecha inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha inicio
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Fecha fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha fin
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Mostrar resultados */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {historialFiltrado.length} de {historial.length} eventos
            </p>
            {(busqueda ||
              filtroEstado !== "todos" ||
              fechaInicio ||
              fechaFin) && (
              <button
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado("todos");
                  setFechaInicio("");
                  setFechaFin("");
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Contenido principal - Eventos */}
        <div className="space-y-4">
          {historialFiltrado.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <FileTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {historial.length === 0
                  ? "No hay eventos registrados"
                  : "No se encontraron eventos"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {historial.length === 0
                  ? "Esta sala no tiene eventos en su historial."
                  : "Intenta ajustar los filtros de búsqueda."}
              </p>
            </div>
          ) : (
            historialFiltrado.map((evento) => (
              <div
                key={evento.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow relative"
              >
                <div className="p-6">
                  {/* Etiquetas en esquina superior derecha */}
                  <div className="absolute top-4 right-4 space-y-2">
                    {/* Etiqueta de fallas */}
                    <span
                      className={`mr-2 px-2 py-1 text-xs font-medium rounded-full ${
                        evento.fallasRegistradas
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {evento.fallasRegistradas ? "Con Fallas" : "Sin Fallas"}
                    </span>
                    {/* Etiqueta de estado del evento */}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        esEventoCompletado(evento.fechaEvento)
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {esEventoCompletado(evento.fechaEvento)
                        ? "Completado"
                        : "Programado"}
                    </span>
                  </div>

                  {/* Header del evento */}
                  <div className="flex items-start justify-between mb-4 pr-32">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {evento.nombreEvento}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${obtenerColorTipoEvento(
                            evento.tipoEvento
                          )}`}
                        >
                          {evento.tipoEvento}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información del evento - Primera fila */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          Fecha
                        </p>
                        <p className="text-sm">
                          {formatearFecha(evento.fechaEvento)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          Horario
                        </p>
                        <p className="text-sm">
                          {formatearHora(evento.horaInicio)} -{" "}
                          {formatearHora(evento.horaFin)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <UsersIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          Asistentes
                        </p>
                        <p className="text-sm">
                          {obtenerRangoAsistentes(evento.numeroAsistentesReal)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información del evento - Segunda fila */}
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <UserIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          Organizador
                        </p>
                        <p className="text-sm">
                          {evento.responsableSala.nombre}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Equipos utilizados */}
                  {evento.equiposUsados.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <WrenchIcon className="h-4 w-4 mr-2 text-blue-500" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Equipos utilizados
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {evento.equiposUsados.map((equipo, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded"
                          >
                            {equipo.nombre} ({equipo.cantidad})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallas registradas */}
                  {evento.fallasRegistradas && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                      <div className="flex items-start">
                        <AlertCircleIcon className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                            Fallas registradas
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {evento.fallasRegistradas}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botón de ver detalles en esquina inferior derecha */}
                  <div className="flex justify-end -mt-10">
                    <button
                      onClick={() => verDetallesEvento(evento.id)}
                      className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Paginación */}
          {historial.length === limite && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setOffset(offset + limite)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Cargar más eventos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
