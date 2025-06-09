
"use client";
// skrl
import Advertencia from "@/components/ui/advertencia"
import NotificacionTecnico from "@/components/ui/notificacion-tecnico";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  VideoIcon,
  WifiIcon,
  TabletIcon,
  TextIcon,
  UsersIcon,
  MapPinIcon,
  ProjectorIcon,
  MonitorIcon,
  ZoomInIcon,
  ClipboardIcon,
  Mic2Icon,
  ArmchairIcon,
  PresentationIcon,
  EraserIcon,
  TableIcon,
} from "lucide-react";

// Tipos para el endpoint real
interface InventarioItem {
  nombre: string;
  detalles: {
    Operativo: number;
    Dañado: number;
    NoOperativo: number;
    EnMantenimiento: number;
  };
}

interface SalaInventarioResponse {
  success: boolean;
  message: string;
  sala: {
    id: number;
    nombreSala: string;
    ubicacion: string;
    capacidadMax?: number;
    urlImagen?: string | null;
  };
  inventario: InventarioItem[];
}

// --- DATOS SIMULADOS ---
const salaSimulada = {
  id: 1,
  nombreSala: "Sala de Videoconferencias A",
  ubicacion: "Edificio Principal, Piso 1",
  capacidadMax: 36,
  urlImagen: null,
};

const inventarioSimulado: InventarioItem[] = [
  { nombre: "Cámara", detalles: { Operativo: 6, Dañado: 0, NoOperativo: 0, EnMantenimiento: 0 } },
  { nombre: "Micrófono", detalles: { Operativo: 1, Dañado: 0, NoOperativo: 0, EnMantenimiento: 0 } },
  { nombre: "Pantalla", detalles: { Operativo: 1, Dañado: 0, NoOperativo: 0, EnMantenimiento: 0 } },
  { nombre: "Proyector", detalles: { Operativo: 0, Dañado: 1, NoOperativo: 0, EnMantenimiento: 0 } },
  { nombre: "Silla", detalles: { Operativo: 10, Dañado: 0, NoOperativo: 0, EnMantenimiento: 0 } },
  { nombre: "Mesa", detalles: { Operativo: 0, Dañado: 0, NoOperativo: 0, EnMantenimiento: 0 } },
  { nombre: "Pizarrón", detalles: { Operativo: 0, Dañado: 0, NoOperativo: 0, EnMantenimiento: 0 } },
  { nombre: "Plumón", detalles: { Operativo: 0, Dañado: 0, NoOperativo: 0, EnMantenimiento: 0 } },
  { nombre: "Borrador", detalles: { Operativo: 0, Dañado: 0, NoOperativo: 0, EnMantenimiento: 0 } },
];

export default function SalaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const idSala = Array.isArray(params.id) ? params.id[0] : params.id;

  const [sala, setSala] = useState<SalaInventarioResponse["sala"] | null>(null);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mapeo de nombre de equipo a icono
  const equipoIconos: Record<string, JSX.Element> = {
    "Cámara": <VideoIcon className="w-5 h-5" />,
    "Micrófono": <Mic2Icon className="w-5 h-5" />,
    "Pantalla": <MonitorIcon className="w-5 h-5" />,
    "Proyector": <ProjectorIcon className="w-5 h-5" />,
    "Silla": <ArmchairIcon className="w-5 h-5" />,
    "Mesa": <TableIcon className="w-5 h-5" />,
    "Pizarrón": <PresentationIcon className="w-5 h-5" />,
    "Plumón": <ClipboardIcon className="w-5 h-5" />,
    "Borrador": <EraserIcon className="w-5 h-5" />,
  };

  // Servicios estáticos
  const serviciosStaticos = [
    { nombre: "Camara", icono: <VideoIcon className="w-4 h-4" /> },
    { nombre: "Projector", icono: <ProjectorIcon className="w-4 h-4" /> },
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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  
  useEffect(() => {
    setLoading(true);
    setError(null);

    // --- PRIORIDAD: DATOS SIMULADOS ---
    if (idSala === "1") {
      setSala(salaSimulada);
      setInventario(inventarioSimulado);
      setLoading(false);
      return;
    }

    // --- Si no hay simulados, usa el endpoint real ---
    fetch(`${API_BASE_URL}/salas/inventario/${idSala}`)
      .then(res => res.json())
      .then((data: SalaInventarioResponse) => {
        if (data.success) {
          setSala(data.sala);
          setInventario(data.inventario);
        } else {
          setError(data.message || "No se pudo obtener la información");
        }
      })
      .catch(() => setError("Error al obtener la información"))
      .finally(() => setLoading(false));
  }, [idSala, API_BASE_URL]);

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

  return (
    <div className="container mx-auto px-4 py-8">
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
              {sala.capacidadMax !== undefined && (
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  {sala.capacidadMax} personas
                </div>
              )}
            </div>
          </div>
{/*           
          <Advertencia /> */}
          <div className="flex gap-2">
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
              {inventario
                .filter(item =>
                  (item.detalles.Operativo ?? 0) > 0 ||
                  (item.detalles.Dañado ?? 0) > 0 ||
                  (item.detalles.NoOperativo ?? 0) > 0 ||
                  (item.detalles.EnMantenimiento ?? 0) > 0
                )
                .map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    {equipoIconos[item.nombre] || <TextIcon className="w-5 h-5" />}
                    {item.nombre}
                  </div>
                ))}
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

        {/* <div>
          <NotificacionTecnico
            sala={sala.nombreSala}
            fecha="7 Jun 2025"
            horario="11:00 - 13:00"
            fechaAsignacion="15 mayo 2025"
            onVerDetalles={() => router.push(`/dashboard/room/${idSala}/details`)}
          />
        </div> */}
      </div>
    </div>
  );
}