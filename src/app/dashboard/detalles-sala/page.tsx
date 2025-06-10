"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Interfaces para los datos
interface Sala {
  id: number;
  nombreSala: string;
  ubicacion: string;
  capacidadMax: number;
  descripcion?: string;
  notas?: string;
}

interface Equipo {
  equipo: {
    id: number;
    cantidad: number;
    estado: string;
  };
  detalles: {
    id: number;
    nombre: string;
  };
}

// Interfaces removidas - ahora usamos íconos simples

function DetallesSalaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Parámetros de la URL
  const salaId = searchParams.get("salaId");
  const salaNombre = searchParams.get("salaNombre");
  const salaUbicacion = searchParams.get("salaUbicacion");
  const salaCapacidad = searchParams.get("salaCapacidad");

  // Estados
  const [sala, setSala] = useState<Sala | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lista de equipos y servicios posibles
  const equiposDisponibles = [
    { nombre: "Cámara", icono: "camera" },
    { nombre: "Proyector", icono: "projector" },
    { nombre: "Laptop", icono: "laptop" },
    { nombre: "Equipo", icono: "equipment" },
  ];

  const serviciosDisponibles = [
    { nombre: "Cámara", icono: "camera" },
    { nombre: "Proyector", icono: "projector" },
    { nombre: "Laptop", icono: "laptop" },
    { nombre: "Tableta", icono: "tablet" },
    { nombre: "Monitores", icono: "monitor" },
    { nombre: "WiFi", icono: "wifi" },
  ];

  useEffect(() => {
    if (!salaId) {
      setError("ID de sala no válido");
      setLoading(false);
      return;
    }

    const fetchSalaDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener detalles de la sala
        const salaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salas/obtener/${salaId}`);
        if (!salaResponse.ok) {
          throw new Error('Error al obtener información de la sala');
        }
        const salaData = await salaResponse.json();
        
        if (salaData.message === 'ok' && salaData.data) {
          setSala(salaData.data);
        }

        // Obtener equipos de la sala
        const equipoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salas/equipo/${salaId}`);
        if (equipoResponse.ok) {
          const equipoData = await equipoResponse.json();
          if (equipoData.message === 'ok' && equipoData.data) {
            setEquipos(equipoData.data);
          }
        }

      } catch (error) {
        console.error("Error al cargar detalles de la sala:", error);
        setError(error instanceof Error ? error.message : 'Error al cargar la sala');
      } finally {
        setLoading(false);
      }
    };

    fetchSalaDetails();
  }, [salaId]);

  // Los equipos ahora solo muestran íconos sin lógica de disponibilidad

  // Función para renderizar íconos de equipos y servicios
  const renderIconoServicio = (tipoIcono: string) => {
    const iconClass = "w-6 h-6 text-blue-600 dark:text-blue-400";
    
    switch (tipoIcono) {
      case "camera":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "projector":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case "laptop":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 2z" />
          </svg>
        );
      case "tablet":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
          </svg>
        );
      case "monitor":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
             case "wifi":
         return (
           <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
           </svg>
         );
       case "equipment":
         return (
           <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
           </svg>
         );
       default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando información de la sala...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Link 
            href="/dashboard/salas"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-block"
          >
            Volver a salas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navegación */}
        <Link 
          href="/dashboard/salas"
          className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Volver a salas
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Imagen de la sala */}
          <div className="relative h-64 md:h-80">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwqG5mC2Hr4E3JOGN43xjtxFqFEc7a9jIdMg&s"
              alt={sala?.nombreSala || salaNombre || "Sala"}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                Disponible
              </span>
            </div>
          </div>

          {/* Información principal */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {sala?.nombreSala || salaNombre || "Sala de Conferencias"}
                </h1>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{sala?.ubicacion || salaUbicacion}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span>{sala?.capacidadMax || salaCapacidad} personas</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/dashboard/calendario?salaId=${salaId}`}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  Ver Calendario
                </Link>
                <Link
                  href={`/dashboard/solicitud-reservacion?salaId=${salaId}&salaNombre=${encodeURIComponent(sala?.nombreSala || salaNombre || '')}&salaUbicacion=${encodeURIComponent(sala?.ubicacion || salaUbicacion || '')}&salaCapacidad=${sala?.capacidadMax || salaCapacidad}`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Reservar Sala
                </Link>
              </div>
            </div>

            {/* Equipos y Servicios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                             {/* Equipo Disponible */}
               <div>
                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                   Equipo Disponible
                 </h2>
                 <div className="grid grid-cols-2 gap-3">
                   {equiposDisponibles.map((equipo, index) => (
                     <div key={index} className="flex items-center space-x-3">
                       <div className="flex-shrink-0">
                         {renderIconoServicio(equipo.icono)}
                       </div>
                       <span className="text-sm text-gray-900 dark:text-white">
                         {equipo.nombre}
                       </span>
                     </div>
                   ))}
                 </div>
               </div>

                             {/* Servicios Disponibles */}
               <div>
                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                   Servicios Disponibles
                 </h2>
                 <div className="grid grid-cols-2 gap-3">
                   {serviciosDisponibles.map((servicio, index) => (
                     <div key={index} className="flex items-center space-x-3">
                       <div className="flex-shrink-0">
                         {renderIconoServicio(servicio.icono)}
                       </div>
                       <span className="text-sm text-gray-900 dark:text-white">
                         {servicio.nombre}
                       </span>
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            {/* Observaciones */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Observaciones
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {sala?.notas || sala?.notas || "La sala cuenta con buen acceso y área conveniente de funcionamiento con equipo que les pueden ser necesario para cualquier cita"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Última actualización: {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetallesSalaPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <DetallesSalaContent />
    </Suspense>
  );
}
