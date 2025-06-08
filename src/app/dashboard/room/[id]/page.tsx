"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  VideoIcon,
  WifiIcon,
  TabletIcon,
  TextIcon,
  CalendarIcon,
  UsersIcon,
  MapPinIcon,
  ProjectorIcon,
  MonitorIcon,
  ZoomInIcon,
  ArrowLeftIcon,
} from "lucide-react";

// Solo los campos que aparecen en la imagen de contexto
interface SalaApi {
  id: number;
  nombreSala: string;
  ubicacion: string;
  capacidadMax: number;
  urlImagen?: string | null;
}

interface ApiResponse {
  message: string;
  data: SalaApi | null;
}

interface EquipoSala {
  equipo: {
    id: number;
    idSala: number;
    idTipoEquipo: number;
    cantidad: number;
    estado: string;
    numeroSerie: string | null;
    fechaAdquisicion: string | null;
    ultimaRevision: string | null;
    notas: string | null;
  };
  detalles: {
    id: number;
    nombre: string;
    descripcion: string;
    marca: string | null;
    modelo: string | null;
    año: number | null;
  };
}

// Mapeo para mostrar el nombre del tipo de equipo
const tipoEquipoNombre: Record<number, string> = {
  1: "Cámara",
  2: "Proyector",
  3: "Micrófono",
  4: "Pantalla",
  5: "Silla",
};

// Simulación de equipos por sala, datos más limpios y directos
const equiposSimuladosPorSala: Record<string, { message: string; data: EquipoSala[] }> = {
  "1": {
    message: "ok",
    data: [
      {
        equipo: {
          id: 2,
          idSala: 1,
          idTipoEquipo: 1,
          cantidad: 6,
          estado: "Operativo",
          numeroSerie: "CAM-001",
          fechaAdquisicion: "2025-02-01T00:00:00.000Z",
          ultimaRevision: "2025-05-20T00:00:00.000Z",
          notas: null,
        },
        detalles: {
          id: 1,
          nombre: "Cámara Web",
          descripcion: "",
          marca: "Logitech",
          modelo: "C920",
          año: 2023,
        },
      },
      {
        equipo: {
          id: 3,
          idSala: 1,
          idTipoEquipo: 3,
          cantidad: 1,
          estado: "Operativo",
          numeroSerie: null,
          fechaAdquisicion: null,
          ultimaRevision: null,
          notas: null,
        },
        detalles: {
          id: 3,
          nombre: "Micrófono",
          descripcion: "",
          marca: null,
          modelo: null,
          año: null,
        },
      },
      {
        equipo: {
          id: 4,
          idSala: 1,
          idTipoEquipo: 4,
          cantidad: 1,
          estado: "Operativo",
          numeroSerie: null,
          fechaAdquisicion: null,
          ultimaRevision: null,
          notas: null,
        },
        detalles: {
          id: 4,
          nombre: "Pantalla",
          descripcion: "",
          marca: null,
          modelo: null,
          año: null,
        },
      },
      {
        equipo: {
          id: 5,
          idSala: 1,
          idTipoEquipo: 5,
          cantidad: 10,
          estado: "Operativo",
          numeroSerie: null,
          fechaAdquisicion: null,
          ultimaRevision: null,
          notas: null,
        },
        detalles: {
          id: 5,
          nombre: "Silla",
          descripcion: "",
          marca: null,
          modelo: null,
          año: null,
        },
      },
      {
        equipo: {
          id: 1,
          idSala: 1,
          idTipoEquipo: 2,
          cantidad: 1,
          estado: "Dañado",
          numeroSerie: "PRJ-001",
          fechaAdquisicion: "2025-01-15T00:00:00.000Z",
          ultimaRevision: "2025-05-15T00:00:00.000Z",
          notas: null,
        },
        detalles: {
          id: 2,
          nombre: "Proyector",
          descripcion: "",
          marca: "Epson",
          modelo: "PowerLite 2250U",
          año: 2023,
        },
      },
    ],
  },
  "2": {
    message: "ok",
    data: [
      {
        equipo: {
          id: 6,
          idSala: 2,
          idTipoEquipo: 1,
          cantidad: 2,
          estado: "Operativo",
          numeroSerie: "CAM-002",
          fechaAdquisicion: "2024-01-01T00:00:00.000Z",
          ultimaRevision: "2025-05-10T00:00:00.000Z",
          notas: null,
        },
        detalles: {
          id: 1,
          nombre: "Cámara Web",
          descripcion: "",
          marca: "Logitech",
          modelo: "C920",
          año: 2023,
        },
      },
      {
        equipo: {
          id: 7,
          idSala: 2,
          idTipoEquipo: 2,
          cantidad: 1,
          estado: "Operativo",
          numeroSerie: "PRJ-002",
          fechaAdquisicion: "2023-12-01T00:00:00.000Z",
          ultimaRevision: "2025-05-01T00:00:00.000Z",
          notas: null,
        },
        detalles: {
          id: 2,
          nombre: "Proyector",
          descripcion: "",
          marca: "BenQ",
          modelo: "MW535A",
          año: 2022,
        },
      },
    ],
  },
  "3": {
    message: "ok",
    data: [
      {
        equipo: {
          id: 8,
          idSala: 3,
          idTipoEquipo: 4,
          cantidad: 2,
          estado: "Operativo",
          numeroSerie: null,
          fechaAdquisicion: null,
          ultimaRevision: null,
          notas: null,
        },
        detalles: {
          id: 4,
          nombre: "Pantalla",
          descripcion: "",
          marca: "Samsung",
          modelo: "QLED 85",
          año: 2024,
        },
      },
    ],
  },
  "4": {
    message: "ok",
    data: [],
  },
};

export default function SalaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const idSala = Array.isArray(params.id) ? params.id[0] : params.id;

  const [sala, setSala] = useState<SalaApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [equipos, setEquipos] = useState<EquipoSala[]>([]);
  const [loadingEquipos, setLoadingEquipos] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!idSala) {
      setError("No se encontró el ID de la sala.");
      setLoading(false);
      return;
    }

    // Simulación de varias salas
    const salasSimuladas: SalaApi[] = [
      {
        id: 1,
        nombreSala: "Sala de Conferencias A",
        ubicacion: "Edificio Principal, Planta Baja",
        capacidadMax: 30,
        urlImagen: null,
      },
      {
        id: 2,
        nombreSala: "Sala de Juntas",
        ubicacion: "Edificio B, Segundo Piso",
        capacidadMax: 15,
        urlImagen: null,
      },
      {
        id: 3,
        nombreSala: "Auditorio Principal",
        ubicacion: "Edificio C, Planta Alta",
        capacidadMax: 120,
        urlImagen: null,
      },
      {
        id: 4,
        nombreSala: "Sala Multimedia",
        ubicacion: "Edificio D, Planta Baja",
        capacidadMax: 50,
        urlImagen: null,
      },
    ];

    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      const encontrada = salasSimuladas.find(
        (s) => String(s.id) === String(idSala)
      );
      if (encontrada) {
        setSala(encontrada);
      } else {
        setError("Sala no encontrada");
      }
      setLoading(false);
    }, 600);

    // Deja la llamada real comentada para después
    /*
    const fetchSala = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/salas/obtener/${idSala}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data: ApiResponse = await response.json();
        if (data.data) {
          setSala(data.data);
        } else {
          setError(data.message || "Sala no encontrada");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error desconocido al cargar los detalles"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSala();
    */

    return () => clearTimeout(timer);
  }, [idSala, API_BASE_URL]);

  useEffect(() => {
    if (!idSala) {
      setEquipos([]);
      setLoadingEquipos(false);
      return;
    }
    setLoadingEquipos(true);
    const timer = setTimeout(() => {
      const respuesta = equiposSimuladosPorSala[String(idSala)] || { message: "ok", data: [] };
      setEquipos(respuesta.data);
      setLoadingEquipos(false);
    }, 500);

    // Deja la llamada real comentada para después
    /*
    fetch(`${API_BASE_URL}/salas/equipo/${idSala}`)
      .then(res => res.json())
      .then(data => setEquipos(data.data))
      .finally(() => setLoadingEquipos(false));
    */

    return () => clearTimeout(timer);
  }, [idSala, API_BASE_URL]);

  // Equipos, servicios y observaciones estáticos
  const serviciosStaticos = [
    { nombre: "Camara", icono: <VideoIcon className="w-4 h-4" /> },
    { nombre: "Projector", icono: <ProjectorIcon className="w-4 h-4" /> },
    { nombre: "Lorem", icono: <TextIcon className="w-4 h-4" /> },
    { nombre: "Wifi", icono: <WifiIcon className="w-4 h-4" /> },
    { nombre: "Zoom", icono: <ZoomInIcon className="w-4 h-4" /> },
    { nombre: "Tableta", icono: <TabletIcon className="w-4 h-4" /> },
    { nombre: "Monitores", icono: <MonitorIcon className="w-4 h-4" /> },
  ];
  const observaciones = [
    {
      fecha: "15 de mayo 2025",
      texto:
        "La sala venía sucia, y los proyectores no funcionaban no creo que en futuro volvería a reservar esta sala",
    },
  ];

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error
  if (error || !sala) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error al cargar los detalles
          </h3>
          <p className="text-red-600 mb-4">{error || "No se encontró la sala"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }
  // Mapea el tipo de equipo a su icono
  const equipoIconos: Record<number, JSX.Element> = {
    1: <VideoIcon className="w-5 h-5" />,
    2: <ProjectorIcon className="w-5 h-5" />,
    3: <TextIcon className="w-5 h-5" />, // Usa el icono que prefieras para micrófono
    4: <MonitorIcon className="w-5 h-5" />,
    5: <UsersIcon className="w-5 h-5" />, // O el que prefieras para silla
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botón volver */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Volver
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Imagen principal */}
        <div className="px-6 pt-6">
          <div className="rounded-2xl overflow-hidden mb-6 border-4 border-white shadow">
            <Image
              src={sala.urlImagen || "/sala.jpg"}
              alt={sala.nombreSala}
              width={1200}
              height={400}
              className="object-cover w-full h-72"
            />
          </div>
        </div>

        {/* Info principal y botones */}
        <div className="px-6 flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-1">{sala.nombreSala}</h2>
            <div className="flex flex-col gap-1 text-gray-500 text-base font-medium mb-2">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                {sala.ubicacion || "Sin ubicación"}
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                {sala.capacidadMax} personas
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-gray-300 rounded px-4 py-2 text-sm font-medium hover:bg-gray-100 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Ver Calendario
            </button>
            <button className="bg-blue-900 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-800">
              Reservar Sala
            </button>
          </div>
        </div>

        {/* Equipos y servicios */}
        <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Equipo Disponible */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Equipo Disponible</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
              {loadingEquipos ? (
                <div className="text-gray-500">Cargando equipos...</div>
              ) : equipos.length > 0 ? (
                equipos.map((eq, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    {equipoIconos[eq.equipo.idTipoEquipo] || <TextIcon className="w-5 h-5" />}
                    {tipoEquipoNombre[eq.equipo.idTipoEquipo] || eq.detalles.nombre}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No hay equipos registrados para esta sala.</div>
              )}
            </div>
            <button className="border border-gray-300 rounded px-4 py-1 text-sm hover:bg-gray-100">
              Ver más
            </button>
          </div>
          {/* Servicios Disponibles */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Servicios Disponibles</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
              {serviciosStaticos.map((srv, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700">
                  {srv.icono}
                  {srv.nombre}
                </div>
              ))}
            </div>
            <button className="border border-gray-300 rounded px-4 py-1 text-sm hover:bg-gray-100">
              Ver más
            </button>
          </div>
        </div>

        {/* Observaciones */}
        <div className="px-6 pb-8">
          <h3 className="font-semibold text-gray-800 mb-3">Observaciones</h3>
          {observaciones.length > 0 ? (
            observaciones.map((obs, idx) => (
              <div key={idx} className="bg-gray-100 rounded-lg p-4 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-700 font-semibold text-sm">{obs.fecha}</span>
                </div>
                <div className="text-gray-700 text-sm">{obs.texto}</div>
              </div>
            ))
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 text-gray-500 text-sm">
              No hay observaciones registradas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}