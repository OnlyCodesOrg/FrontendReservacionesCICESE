"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  MapPinIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  WrenchIcon,
  HistoryIcon,
  EditIcon,
} from "lucide-react";

// Interfaz basada en el modelo Sala del backend
interface Sala {
  id: number;
  nombreSala: string;
  ubicacion: string;
  capacidadMax: number;
  disponible: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface ElementoInventario {
  nombre: string;
  detalles: {
    Operativo: number;
    Dañado: number;
    NoOperativo: number;
    EnMantenimiento: number;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Sala | null;
}

interface InventarioResponse {
  success: boolean;
  message: string;
  sala: {
    id: number;
    nombreSala: string;
    ubicacion?: string;
  };
  inventario: ElementoInventario[];
}

export default function DetalleSalaPage() {
  const params = useParams();
  const router = useRouter();
  const [sala, setSala] = useState<Sala | null>(null);
  const [inventario, setInventario] = useState<ElementoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingInventario, setLoadingInventario] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const salaId = params.id;

  useEffect(() => {
    if (salaId) {
      obtenerDetalleSala();
    }
  }, [salaId]);

  const obtenerDetalleSala = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/salas/${salaId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setSala(data.data);
        // Cargar inventario después de obtener los datos de la sala
        await obtenerInventario();
      } else {
        setError(data.message || "Sala no encontrada");
      }
    } catch (err) {
      console.error("Error al obtener detalles de la sala:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar los detalles"
      );
    } finally {
      setLoading(false);
    }
  };

  const obtenerInventario = async () => {
    try {
      setLoadingInventario(true);

      const response = await fetch(
        `${API_BASE_URL}/salas/inventario/${salaId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data: InventarioResponse = await response.json();
        if (data.success) {
          setInventario(data.inventario);
        }
      }
    } catch (err) {
      console.warn("No se pudo cargar el inventario:", err);
      // No es un error crítico, continuamos sin inventario
    } finally {
      setLoadingInventario(false);
    }
  };

  const formatearFecha = (fechaISO: string) => {
    return new Date(fechaISO).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerEquipamientoDisponible = () => {
    return inventario
      .filter((item) => item.detalles.Operativo > 0)
      .map((item) => `${item.nombre} (${item.detalles.Operativo})`);
  };

  const obtenerTotalElementos = (elemento: ElementoInventario) => {
    return Object.values(elemento.detalles).reduce(
      (total, cantidad) => total + cantidad,
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando detalles de la sala...
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
            <svg
              className="h-12 w-12 text-red-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Error al cargar los detalles
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <div className="space-x-2">
              <button
                onClick={obtenerDetalleSala}
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

  if (!sala) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Sala no encontrada
          </h3>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header con botón de volver */}
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
                Información de la Sala
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {sala.nombreSala} -{" "}
                {sala.ubicacion || "Ubicación no especificada"}
              </p>
            </div>
          </div>

          {/* Botones de acción en el header */}
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/salas/historial/${sala.id}`)}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <HistoryIcon className="h-4 w-4 mr-2" />
              Ver Historial
            </button>
            <button
              onClick={() => router.push(`/salas/${sala.id}/editar`)}
              className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
            >
              <EditIcon className="h-4 w-4 mr-2" />
              Editar Información
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* Información principal */}
          <div className="space-y-6">
            {/* Card principal */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Imagen de la sala */}
              <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <svg
                    className="h-24 w-24 text-white opacity-70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="flex items-center justify-start mb-4 gap-4">
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-gray-100">
                    {sala.nombreSala}
                  </h2>
                  {/* Etiqueta de estado al lado del nombre */}
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      sala.disponible
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    }`}
                  >
                    {sala.disponible ? "Disponible" : "No disponible"}
                  </span>
                </div>

                {/* Información básica */}
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Ubicación
                      </p>
                      <p>{sala.ubicacion || "No especificada"}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <UsersIcon className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Capacidad
                      </p>
                      <p>{sala.capacidadMax} personas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ESTADO DE EQUIPAMIENTO AQUI ADAN */}
          </div>
        </div>
      </div>
    </div>
  );
}
