"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { crearReservacion, CrearReservacionRequest } from "@/app/api/reservaciones/reservacionesService";

// Reutiliza las mismas interfaces
interface Asistente {
  nombre: string;
  correo: string;
}

interface EquipoRequerido {
  proyector: boolean;
  camara: boolean;
  tableta: boolean;
  proyectorPortatil: boolean;
  microfono: boolean;
  wifi: boolean;
}

interface ServiciosRequeridos {
  cafe: boolean;
  agua: boolean;
  tableta: boolean;
  proyector: boolean;
  microfono: boolean;
  wifi: boolean;
}

interface FormData {
  nombreCompleto: string;
  correo: string;
  departamento: string;
  nombreEvento: string;
  tipoEvento: string;
  fechaEvento: string;
  horaInicio: string;
  horaFinalizacion: string;
  numeroParticipantes: string;
  equipoRequerido: EquipoRequerido;
  serviciosRequeridos: ServiciosRequeridos;
  asistentes: Asistente[];
  idTecnicoAsignado: number;
}

interface SalaSeleccionada {
  id: number;
  nombreSala: string;
  ubicacion?: string;
  capacidadMax: number;
  disponible: boolean;
  equipamiento?: string[];
}

export default function ConfirmarSolicitudPage() {
  const router = useRouter();
  const { getUserId } = useAuth();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [salaSeleccionada, setSalaSeleccionada] =
    useState<SalaSeleccionada | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Recuperar los datos del localStorage
    const savedData = localStorage.getItem("solicitudReservacion");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const {
        formData: savedFormData,
        salaSeleccionada: savedSala,
      } = parsedData;

      setFormData(savedFormData);

      if (savedSala) {
        setSalaSeleccionada(savedSala);
      } else {
        setSalaSeleccionada({
          id: 1,
          nombreSala: "Sala Principal",
          ubicacion: "Edificio A - Primer Piso",
          capacidadMax: 50,
          disponible: true,
          equipamiento: ["Proyector", "WiFi", "Sistema de Audio"],
        });
      }
    } else {
      // Si no hay datos, redirigir de vuelta al formulario
      router.push("/dashboard/solicitud-reservacion");
    }
  }, [router]);

  const handleConfirmar = async () => {
    const userId = getUserId();
    if (!userId) {
      alert("Error: No hay usuario logueado");
      return;
    }

    if (!formData || !salaSeleccionada) {
      alert("Error: No se encontraron los datos de la solicitud");
      return;
    }

    setSubmitting(true);

    try {
      // Obtener el token de autenticación
      const token = Cookies.get('access_token');
      if (!token) {
        router.push('/auth/login');
        throw new Error('No hay sesión activa');
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      // Verificar disponibilidad de la sala
      const checkDisponibilidadResponse = await fetch(`${API_URL}/salas/validar-disponibilidad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idSala: salaSeleccionada.id,
          fechaEvento: formData.fechaEvento,
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFinalizacion
        })
      });

      if (!checkDisponibilidadResponse.ok) {
        const errorData = await checkDisponibilidadResponse.json();
        throw new Error(errorData.message || 'La sala no está disponible para el horario seleccionado');
      }

      // Generar número de reservación
      const fecha = new Date(formData.fechaEvento);
      const numeroReservacion = `RES-${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;

      // Preparar los servicios y equipo requeridos para las observaciones
      const equipoSeleccionado = Object.entries(formData.equipoRequerido)
        .filter(([_, selected]) => selected)
        .map(([item]) => {
          const nombres: { [key: string]: string } = {
            proyectorPortatil: "Proyector Portátil",
            microfono: "Micrófono",
            camara: "Cámara",
            proyector: "Proyector",
            tableta: "Tableta",
            wifi: "WiFi"
          };
          return nombres[item] || item;
        });

      const serviciosSeleccionados = Object.entries(formData.serviciosRequeridos)
        .filter(([_, selected]) => selected)
        .map(([item]) => {
          const nombres: { [key: string]: string } = {
            microfono: "Micrófono",
            cafe: "Café",
            agua: "Agua",
            tableta: "Tableta",
            proyector: "Proyector",
            wifi: "WiFi"
          };
          return nombres[item] || item;
        });

      // Crear la observación con los recursos requeridos
      const observaciones = [
        equipoSeleccionado.length > 0 ? `Equipo requerido: ${equipoSeleccionado.join(", ")}` : null,
        serviciosSeleccionados.length > 0 ? `Servicios requeridos: ${serviciosSeleccionados.join(", ")}` : null,
        formData.asistentes.length > 0 ? `Asistentes adicionales: ${formData.asistentes.map(a => a.nombre).join(", ")}` : null
      ].filter(Boolean).join(". ");

      // Preparar payload según la estructura requerida con técnico asignado obligatorio
      const reservacionData: CrearReservacionRequest = {
        numeroReservacion,
        idUsuario: userId,
        idSala: salaSeleccionada.id,
        nombreEvento: formData.nombreEvento,
        tipoEvento: formData.tipoEvento,
        fechaEvento: formData.fechaEvento,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFinalizacion,
        asistentes: parseInt(formData.numeroParticipantes.split("-")[0]) || 0,
        observaciones: observaciones || "Sin observaciones adicionales",
        idTecnicoResponsable: formData.idTecnicoAsignado || 1 // Fallback garantizado
      };

      // Crear la reservación usando el servicio que asegura el idTecnicoResponsable
      const resultado = await crearReservacion(reservacionData);

      if (!resultado.success) {
        throw new Error(resultado.message || 'Error al crear la reservación');
      }

      const reservacionCreada = resultado.data;

      // Limpiar localStorage y mostrar mensaje de éxito
      localStorage.removeItem('solicitudReservacion');

      // Redirigir a la página de reservaciones
      router.push('/dashboard/solicitudes');

    } catch (error) {

      setSubmitting(false);
      router.push('/auth/login');
    }
  };

  const handleCambiarSala = () => {
    // Guardar los datos actuales y redirigir a selección de sala
    localStorage.setItem(
      "solicitudReservacion",
      JSON.stringify({
        formData,
        salaSeleccionada, // ← Preservar la sala actual
      })
    );
    router.push("/dashboard/seleccionar-sala");
  };

  const getDepartamentoNombre = (id: string) => {
    const departamentos: { [key: string]: string } = {
      "1": "Sistemas",
      "2": "Administración",
      "3": "Investigación",
      "4": "Docencia",
    };
    return departamentos[id] || "Sin especificar";
  };

  const formatEquipamiento = (equipo: EquipoRequerido) => {
    return Object.entries(equipo)
      .filter(([_, selected]) => selected)
      .map(([item]) => {
        const nombres: { [key: string]: string } = {
          proyectorPortatil: "Proyector Portátil",
          microfono: "Micrófono",
          camara: "Cámara",
          proyector: "Proyector",
          tableta: "Tableta",
          wifi: "WiFi",
        };
        return nombres[item] || item;
      });
  };

  const formatServicios = (servicios: ServiciosRequeridos) => {
    return Object.entries(servicios)
      .filter(([_, selected]) => selected)
      .map(([item]) => {
        const nombres: { [key: string]: string } = {
          microfono: "Micrófono",
          cafe: "Café",
          agua: "Agua",
          tableta: "Tableta",
          proyector: "Proyector",
          wifi: "WiFi",
        };
        return nombres[item] || item;
      });
  };

  if (!formData || !salaSeleccionada) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando datos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header simplificado */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-blue-100">
              Confirmación de Solicitud
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Revisa los datos de tu solicitud antes de confirmar
            </p>
          </div>

          {/* Contenido principal */}
          <div className="border bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {/* Header con título y botón de confirmar */}
            <div className="p-6 border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Detalles de tu Reservación
              </h2>
              <button
                onClick={handleConfirmar}
                disabled={submitting}
                className="px-8 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Confirmando..." : "Reservar"}
              </button>
            </div>

            <div className="px-6 pb-6 space-y-6">
              {/* Sala seleccionada (preparada para datos dinámicos) */}
              <div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 overflow-hidden w-48">
                    <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <svg
                          className="h-12 w-12 text-white opacity-70"
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
                      {/* Badge de disponibilidad */}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {salaSeleccionada.disponible
                            ? "Disponible"
                            : "No disponible"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {salaSeleccionada.nombreSala}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ubicación:
                      </span>{" "}
                      {salaSeleccionada.ubicacion || "Ubicación no especificada"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Capacidad:
                      </span>{" "}
                      {salaSeleccionada.capacidadMax} personas
                    </p>

                    <button
                      onClick={handleCambiarSala}
                      className="px-4 py-1 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm"
                    >
                      Cambiar Sala
                    </button>
                  </div>
                  <div className="flex-1">
                    {/* Equipamiento de la sala */}
                    {salaSeleccionada.equipamiento &&
                      salaSeleccionada.equipamiento.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Equipamiento disponible:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {salaSeleccionada.equipamiento.map((item, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Grid de dos columnas para los detalles */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna izquierda */}
                <div className="space-y-6">
                  {/* Datos del Solicitante */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Datos del Solicitante
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Nombre:
                        </span>
                        <p className="text-gray-900 dark:text-gray-100">
                          {formData.nombreCompleto}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Correo:
                        </span>
                        <p className="text-gray-900 dark:text-gray-100">
                          {formData.correo}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Departamento:
                        </span>
                        <p className="text-gray-900 dark:text-gray-100">
                          {getDepartamentoNombre(formData.departamento)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recursos Necesarios */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Recursos Necesarios
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Equipamiento:
                        </span>
                        <div className="mt-2">
                          {formatEquipamiento(formData.equipoRequerido).length >
                            0 ? (
                            <ul className="list-disc list-inside text-sm text-gray-900 dark:text-gray-100">
                              {formatEquipamiento(formData.equipoRequerido).map(
                                (item, index) => (
                                  <li key={index}>{item}</li>
                                )
                              )}
                            </ul>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              Ninguno seleccionado
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Servicios:
                        </span>
                        <div className="mt-2">
                          {formatServicios(formData.serviciosRequeridos).length >
                            0 ? (
                            <ul className="list-disc list-inside text-sm text-gray-900 dark:text-gray-100">
                              {formatServicios(formData.serviciosRequeridos).map(
                                (item, index) => (
                                  <li key={index}>{item}</li>
                                )
                              )}
                            </ul>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              Ninguno seleccionado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-6">
                  {/* Detalles del Evento */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Detalles del Evento
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Nombre del Evento:
                        </span>
                        <p className="text-gray-900 dark:text-gray-100">
                          {formData.nombreEvento}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Tipo:
                        </span>
                        <p className="text-gray-900 dark:text-gray-100">
                          {formData.tipoEvento}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Fecha:
                        </span>
                        <p className="text-gray-900 dark:text-gray-100">
                          {new Date(formData.fechaEvento).toLocaleDateString(
                            "es-ES",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Horario:
                        </span>
                        <p className="text-gray-900 dark:text-gray-100">
                          {formData.horaInicio} - {formData.horaFinalizacion}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Participantes:
                        </span>
                        <p className="text-gray-900 dark:text-gray-100">
                          {formData.numeroParticipantes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>

  );
}
