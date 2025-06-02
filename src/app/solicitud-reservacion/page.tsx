"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Tipos TypeScript
interface Participante {
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
  // Datos del Solicitante (solo para mostrar en el formulario)
  nombreCompleto: string;
  correo: string;
  departamento: string; // valor entre "1" y "4"

  // Detalles del Evento
  nombreEvento: string;
  tipoEvento: string;
  fechaEvento: string;
  horaInicio: string;
  horaFinalizacion: string;
  numeroParticipantes: string;

  // Recursos Necesarios
  equipoRequerido: EquipoRequerido;
  serviciosRequeridos: ServiciosRequeridos;

  // Participantes adicionales
  participantes: Participante[];
}

export default function SolicitudReservacionPage() {
  const searchParams = useSearchParams();
  const fecha = searchParams.get("fecha") || "";

  // ---------------------------------------------------
  // Estado general del formulario
  // ---------------------------------------------------
  const [formData, setFormData] = useState<FormData>({
    // Datos del Solicitante
    nombreCompleto: "",
    correo: "",
    departamento: "",

    // Detalles del Evento
    nombreEvento: "",
    tipoEvento: "",
    fechaEvento: fecha,
    horaInicio: "",
    horaFinalizacion: "",
    numeroParticipantes: "",

    // Recursos Necesarios
    equipoRequerido: {
      proyector: false,
      camara: false,
      tableta: false,
      proyectorPortatil: false,
      microfono: false,
      wifi: false,
    },
    serviciosRequeridos: {
      cafe: false,
      agua: false,
      tableta: false,
      proyector: false,
      microfono: false,
      wifi: false,
    },

    // Participantes adicionales
    participantes: [{ nombre: "", correo: "" }],
  });

  // ---------------------------------------------------
  // ID de usuario (lo obtenemos del endpoint /auth/profile)
  // ---------------------------------------------------
  const [userId, setUserId] = useState<number | null>(null);

  // ---------------------------------------------------
  // Estado de “submitting” para deshabilitar botón
  // ---------------------------------------------------
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ---------------------------------------------------
  // useEffect para prellenar datos del solicitante, incluyendo departamento e idUsuario
  // ---------------------------------------------------
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          console.warn("Perfil no válido, forzando logout");
          localStorage.removeItem("access_token");
          return;
        }
        const data = await res.json();
        const user = data.user; // { id, email, id_rol, nombre, apellidos, id_departamento }

        // Guardamos idUsuario para enviarlo al back
        setUserId(user.userId);

        // Construimos nombre completo para mostrar en el formulario
        const nombreCompleto = [user.nombre, user.apellidos]
          .filter((x: string) => x)
          .join(" ");

        // Convertimos id_departamento a string ("1" a "4"), si existe
        const departamentoId = user.id_departamento?.toString() || "";

        setFormData((prev) => ({
          ...prev,
          nombreCompleto,
          correo: user.email,
          departamento: departamentoId,
        }));
      })
      .catch((err) => {
        console.error("Error fetch /auth/profile:", err);
        localStorage.removeItem("access_token");
      });
  }, []);

  // ---------------------------------------------------
  // Funciones para manejar cambios en cada input
  // ---------------------------------------------------
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (
    category: "equipoRequerido" | "serviciosRequeridos",
    item: string
  ) => {
    setFormData((prev) => {
      if (category === "equipoRequerido") {
        return {
          ...prev,
          equipoRequerido: {
            ...prev.equipoRequerido,
            [item]: !prev.equipoRequerido[item as keyof EquipoRequerido],
          },
        };
      } else {
        return {
          ...prev,
          serviciosRequeridos: {
            ...prev.serviciosRequeridos,
            [item]: !prev.serviciosRequeridos[item as keyof ServiciosRequeridos],
          },
        };
      }
    });
  };

  const selectAllEquipo = () => {
    setFormData((prev) => ({
      ...prev,
      equipoRequerido: {
        proyector: true,
        camara: true,
        tableta: true,
        proyectorPortatil: true,
        microfono: true,
        wifi: true,
      },
    }));
  };

  const selectAllServicios = () => {
    setFormData((prev) => ({
      ...prev,
      serviciosRequeridos: {
        cafe: true,
        agua: true,
        tableta: true,
        proyector: true,
        microfono: true,
        wifi: true,
      },
    }));
  };

  const addParticipante = () => {
    setFormData((prev) => ({
      ...prev,
      participantes: [...prev.participantes, { nombre: "", correo: "" }],
    }));
  };

  const removeParticipante = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      participantes: prev.participantes.filter((_, i) => i !== index),
    }));
  };

  const updateParticipante = (
    index: number,
    field: keyof Participante,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      participantes: prev.participantes.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  // ---------------------------------------------------
  // Función principal para enviar la solicitud de reservación
  // ---------------------------------------------------
  const handleSubmit = async () => {
    // Si no tenemos userId, no intentamos enviar
    if (userId === null) {
      alert("Debes iniciar sesión para enviar la solicitud.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Generar un número de reservación simple
      const numeroReservacion = `RES-${Date.now()}`;

      // 2. Parsear el número estimado de asistentes (tomamos el primer valor del rango)
      const asistentesEstimado =
        parseInt(formData.numeroParticipantes.split("-")[0]) || 0;

      // 3. Preparar observaciones a partir de los servicios seleccionados
      const serviciosSeleccionados = Object.entries(
        formData.serviciosRequeridos
      )
        .filter(([_, selected]) => selected)
        .map(([item]) => item)
        .join(", ");
      const observacionesTexto = serviciosSeleccionados
        ? `Servicios requeridos: ${serviciosSeleccionados}`
        : "";

      // 4. Construir payload EXACTO para CreateReservacioneDto
      const payload = {
        numeroReservacion: numeroReservacion,
        idUsuario: userId,
        idSala: 1, // <---- usa “1” por defecto; cámbialo cuando la selección de sala esté lista
        nombreEvento: formData.nombreEvento,
        tipoEvento: formData.tipoEvento,        // Debe coincidir con el enum del backend
        fechaEvento: formData.fechaEvento,      // e.g. "2025-06-15"
        horaInicio: formData.horaInicio,        // e.g. "09:00"
        horaFin: formData.horaFinalizacion,     // e.g. "11:00"
        asistentes: asistentesEstimado,
        observaciones: observacionesTexto,
      };

      // **Muestra en consola el JSON que se va a enviar**
      console.log("Payload a enviar:", payload);

      // 5. Enviar al endpoint remoto (o local)
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || window.location.origin;
      const endpointReservacion = `${API_URL}/reservaciones/crear`;

      const response = await fetch(endpointReservacion, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error al crear reservación: ${response.statusText} - ${errorText}`
        );
      }

      const created = await response.json();
      console.log("Reservación creada (respuesta del back):", created);
      alert("Reservación enviada con éxito.");

      // Opcional: limpiar formulario o redirigir
      // setFormData({ ...valoresPorDefecto });
      // router.push("/mis-reservaciones");
    } catch (error: any) {
      console.error("Error al enviar la solicitud:", error);
      alert(
        "Hubo un error al enviar la solicitud. Por favor revisa la consola y vuelve a intentarlo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Cargando...
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ----------------------------------------------
                  FORMULARIO PRINCIPAL (col-span-2)
                ---------------------------------------------- */}
            <div className="lg:col-span-2 space-y-8">
              {/* ---------------------  
                    1. Datos del Solicitante  
                  --------------------- */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6 text-blue-900 dark:text-blue-100">
                  1. Datos del Solicitante
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={formData.nombreCompleto}
                      onChange={(e) =>
                        handleInputChange("nombreCompleto", e.target.value)
                      }
                      placeholder="Nombre del Solicitante"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Correo
                    </label>
                    <input
                      type="email"
                      value={formData.correo}
                      onChange={(e) =>
                        handleInputChange("correo", e.target.value)
                      }
                      placeholder="Correo del Solicitante"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Departamento
                    </label>
                    <select
                      value={formData.departamento}
                      onChange={(e) =>
                        handleInputChange("departamento", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="1">Sistemas</option>
                      <option value="2">Administración</option>
                      <option value="3">Investigación</option>
                      <option value="4">Docencia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ----------------------
                    2. Detalles del Evento  
                  ---------------------- */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6 text-blue-900 dark:text-blue-100">
                  2. Detalles del Evento
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.nombreEvento}
                      onChange={(e) =>
                        handleInputChange("nombreEvento", e.target.value)
                      }
                      placeholder="Nombre del Evento"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Evento
                    </label>
                    <select
                      value={formData.tipoEvento}
                      onChange={(e) =>
                        handleInputChange("tipoEvento", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Reunion">Reunión</option>
                      <option value="Videoconferencia">Videoconferencia</option>
                      <option value="Presentacion">Presentación</option>
                      <option value="Capacitacion">Capacitación</option>
                      <option value="Conferencia">Conferencia</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={formData.fechaEvento}
                      onChange={(e) =>
                        handleInputChange("fechaEvento", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hora de Inicio
                      </label>
                      <input
                        type="time"
                        value={formData.horaInicio}
                        onChange={(e) =>
                          handleInputChange("horaInicio", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hora de Finalización
                      </label>
                      <input
                        type="time"
                        value={formData.horaFinalizacion}
                        onChange={(e) =>
                          handleInputChange("horaFinalizacion", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número de Participantes
                    </label>
                    <select
                      value={formData.numeroParticipantes}
                      onChange={(e) =>
                        handleInputChange("numeroParticipantes", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="1-10">1-10</option>
                      <option value="11-20">11-20</option>
                      <option value="21-25">21-25</option>
                      <option value="26-50">26-50</option>
                      <option value="50+">50+</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* --------------------------
                    3. Recursos Necesarios
                  -------------------------- */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6 text-blue-900 dark:text-blue-100">
                  3. Recursos Necesarios
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium mb-4 text-gray-700 dark:text-gray-300">
                      Equipo
                    </h3>
                    <div className="space-y-2">
                      {Object.keys(formData.equipoRequerido).map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`equipo-${item}`}
                            checked={
                              formData.equipoRequerido[
                                item as keyof EquipoRequerido
                              ]
                            }
                            onChange={() =>
                              handleCheckboxChange("equipoRequerido", item)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`equipo-${item}`}
                            className="text-sm text-gray-700 dark:text-gray-300 capitalize"
                          >
                            {item === "proyectorPortatil"
                              ? "Proyector Portátil"
                              : item === "microfono"
                              ? "Micrófono"
                              : item === "camara"
                              ? "Cámara"
                              : item}
                          </label>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={selectAllEquipo}
                      className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                    >
                      Seleccionar Todo Equipo
                    </button>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4 text-gray-700 dark:text-gray-300">
                      Servicios
                    </h3>
                    <div className="space-y-2">
                      {Object.keys(formData.serviciosRequeridos).map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`servicio-${item}`}
                            checked={
                              formData.serviciosRequeridos[
                                item as keyof ServiciosRequeridos
                              ]
                            }
                            onChange={() =>
                              handleCheckboxChange("serviciosRequeridos", item)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`servicio-${item}`}
                            className="text-sm text-gray-700 dark:text-gray-300 capitalize"
                          >
                            {item === "microfono"
                              ? "Micrófono"
                              : item === "cafe"
                              ? "Café"
                              : item}
                          </label>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={selectAllServicios}
                      className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                    >
                      Seleccionar Todos Servicios
                    </button>
                  </div>
                </div>
              </div>

              {/* ------------------------------
                    4. Participantes adicionales
                  ------------------------------ */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6 text-blue-900 dark:text-blue-100">
                  4. Participantes adicionales (opcional)
                </h2>

                <div className="space-y-4">
                  {formData.participantes.map((participante, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">
                          Participante {index + 1}
                        </h4>
                        {formData.participantes.length > 1 && (
                          <button
                            onClick={() => removeParticipante(index)}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm flex items-center space-x-1"
                          >
                            <span>🗑️</span>
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre del Participante
                          </label>
                          <input
                            type="text"
                            value={participante.nombre}
                            onChange={(e) =>
                              updateParticipante(index, "nombre", e.target.value)
                            }
                            placeholder="Nombre del Participante"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Correo de Participante
                          </label>
                          <input
                            type="email"
                            value={participante.correo}
                            onChange={(e) =>
                              updateParticipante(index, "correo", e.target.value)
                            }
                            placeholder="correo@ejemplo.com"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={addParticipante}
                      className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm"
                    >
                      + Agregar Otro Participante
                    </button>
                  </div>
                </div>
              </div>

              {/* -------------------------
                    Botón único para enviar
                  ------------------------- */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Enviar Solicitud"}
                </button>
              </div>
            </div>

            {/* -----------------------------------
                  PANEL LATERAL: Resumen Dinámico
                ----------------------------------- */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
                  Resumen de la Reservación
                </h3>

                <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                  {/* ------------------
                        Datos del Solicitante
                      ------------------ */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold mb-1 text-blue-900 dark:text-blue-100">
                      Datos del Solicitante
                    </p>
                    <p>{formData.nombreCompleto || "Sin especificar"}</p>
                    <p>{formData.correo || "Sin especificar"}</p>
                    <p>
                      Dpto:{" "}
                      {formData.departamento === "1"
                        ? "Sistemas"
                        : formData.departamento === "2"
                        ? "Administración"
                        : formData.departamento === "3"
                        ? "Investigación"
                        : formData.departamento === "4"
                        ? "Docencia"
                        : "Sin especificar"}
                    </p>
                  </div>

                  {/* ----------------------
                        Detalles del Evento
                      ---------------------- */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-semibold mb-1 text-green-900 dark:text-green-100">
                      Detalles del Evento
                    </p>
                    <p>{formData.nombreEvento || "Sin especificar"}</p>
                    <p>Tipo: {formData.tipoEvento || "Sin especificar"}</p>
                    <p>Fecha: {formData.fechaEvento || "Sin especificar"}</p>
                    <p>
                      Hora: {formData.horaInicio ? formData.horaInicio : "--:--"}{" "}
                      -{" "}
                      {formData.horaFinalizacion
                        ? formData.horaFinalizacion
                        : "--:--"}
                    </p>
                    <p>
                      Participantes:{" "}
                      {formData.numeroParticipantes || "Sin especificar"}
                    </p>
                  </div>

                  {/* -------------------------
                        Recursos Necesarios
                      ------------------------- */}
                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="font-semibold mb-1 text-purple-900 dark:text-purple-100">
                      Recursos Necesarios
                    </p>
                    <div>
                      <p className="font-medium">Equipo:</p>
                      {Object.entries(formData.equipoRequerido)
                        .filter(([_, selected]) => selected)
                        .map(([item]) => (
                          <p key={item} className="text-xs">
                            •{" "}
                            {item === "proyectorPortatil"
                              ? "Proyector Portátil"
                              : item === "microfono"
                              ? "Micrófono"
                              : item === "camara"
                              ? "Cámara"
                              : item}
                          </p>
                        ))}
                      {Object.values(formData.equipoRequerido).every((v) => !v) && (
                        <p className="text-xs">• Ninguno</p>
                      )}
                    </div>
                    <div className="pt-2">
                      <p className="font-medium">Servicios:</p>
                      {Object.entries(formData.serviciosRequeridos)
                        .filter(([_, selected]) => selected)
                        .map(([item]) => (
                          <p key={item} className="text-xs">
                            •{" "}
                            {item === "microfono"
                              ? "Micrófono"
                              : item === "cafe"
                              ? "Café"
                              : item}
                          </p>
                        ))}
                      {Object.values(formData.serviciosRequeridos).every(
                        (v) => !v
                      ) && <p className="text-xs">• Ninguno</p>}
                    </div>
                  </div>

                  {/* ----------------------------
                        Participantes Adicionales
                      ---------------------------- */}
                  <div className="border-l-4 border-orange-500 pl-4">
                    <p className="font-semibold mb-1 text-orange-900 dark:text-orange-100">
                      Participantes Adicionales
                    </p>
                    {formData.participantes.filter((p) => p.nombre).length > 0 ? (
                      formData.participantes
                        .filter((p) => p.nombre)
                        .map((participante, index) => (
                          <p key={index} className="text-xs">
                            • {participante.nombre}
                          </p>
                        ))
                    ) : (
                      <p className="text-xs">• Ninguno</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Fin panel lateral */}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
