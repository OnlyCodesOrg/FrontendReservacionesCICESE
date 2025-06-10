"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";

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

interface Asistente {
  nombre: string;
  correo: string;
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
}

interface FormErrors {
  nombreCompleto?: string;
  correo?: string;
  nombreEvento?: string;
  tipoEvento?: string;
  fechaEvento?: string;
  horaInicio?: string;
  horaFinalizacion?: string;
  numeroParticipantes?: string;
}

function SolicitudReservacionForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fecha = searchParams.get("fecha") || "";
  
  // Parámetros de la sala seleccionada
  const salaId = searchParams.get("salaId");
  const salaNombre = searchParams.get("salaNombre");
  const salaUbicacion = searchParams.get("salaUbicacion");
  const salaCapacidad = searchParams.get("salaCapacidad");
  
  const { user, getUserId } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    nombreCompleto: "",
    correo: "",
    departamento: "",
    nombreEvento: "",
    tipoEvento: "",
    fechaEvento: fecha,
    horaInicio: "",
    horaFinalizacion: "",
    numeroParticipantes: "",
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
    asistentes: [{ nombre: "", correo: "" }],
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (user) {
      const nombreCompleto = [user.nombre, user.apellidos]
        .filter((x: string) => x)
        .join(" ");
      const departamentoId = user.departamento?.id.toString() || "";
      setFormData((prev) => ({
        ...prev,
        nombreCompleto,
        correo: user.email,
        departamento: departamentoId,
      }));
    }
  }, [user]);

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
      asistentes: [...prev.asistentes, { nombre: "", correo: "" }],
    }));
  };

  const removeParticipante = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      asistentes: prev.asistentes.filter((_, i) => i !== index),
    }));
  };

  const updateParticipante = (
    index: number,
    field: keyof Asistente,
    value: string
  ) => {
    setFormData((prev) => {
      const newAsistentes = [...prev.asistentes];
      newAsistentes[index] = {
        ...newAsistentes[index],
        [field]: value,
      };
      return {
        ...prev,
        asistentes: newAsistentes,
      };
    });
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.nombreCompleto.trim()) {
      errors.nombreCompleto = "El nombre completo es requerido";
      isValid = false;
    }

    if (!formData.correo.trim()) {
      errors.correo = "El correo es requerido";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.correo = "Por favor ingresa un correo válido";
      isValid = false;
    }

    if (!formData.nombreEvento.trim()) {
      errors.nombreEvento = "El nombre del evento es requerido";
      isValid = false;
    }

    if (!formData.tipoEvento) {
      errors.tipoEvento = "El tipo de evento es requerido";
      isValid = false;
    }

    if (!formData.fechaEvento) {
      errors.fechaEvento = "La fecha del evento es requerida";
      isValid = false;
    }

    if (!formData.horaInicio) {
      errors.horaInicio = "La hora de inicio es requerida";
      isValid = false;
    }

    if (!formData.horaFinalizacion) {
      errors.horaFinalizacion = "La hora de finalización es requerida";
      isValid = false;
    }

    if (!formData.numeroParticipantes) {
      errors.numeroParticipantes = "El número de participantes es requerido";
      isValid = false;
    } else if (salaCapacidad && parseInt(formData.numeroParticipantes) > parseInt(salaCapacidad)) {
      errors.numeroParticipantes = `El número de participantes no puede exceder la capacidad de la sala (${salaCapacidad} personas)`;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSiguiente = () => {
    if (validateForm()) {
      // Usar datos de la sala seleccionada o datos por defecto
      const salaSeleccionada = salaId ? {
        id: parseInt(salaId),
        nombreSala: salaNombre || "Sala Principal",
        ubicacion: salaUbicacion || "Edificio A - Primer Piso",
        capacidadMax: parseInt(salaCapacidad || "50"),
        disponible: true,
        equipamiento: ["Proyector", "WiFi", "Sistema de Audio"]
      } : {
        id: 1,
        nombreSala: "Sala Principal",
        ubicacion: "Edificio A - Primer Piso",
        capacidadMax: 50,
        disponible: true,
        equipamiento: ["Proyector", "WiFi", "Sistema de Audio"]
      };

      const currentUserId = getUserId();
      if (!currentUserId) {
        alert("Error: No hay usuario logueado");
        return;
      }

      localStorage.setItem('solicitudReservacion', JSON.stringify({
        formData,
        userId: currentUserId,
        salaSeleccionada
      }));
      router.push('/dashboard/confirmar-solicitud');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {salaId && (
          <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  <span className="font-medium">Sala preseleccionada:</span> {salaNombre} - {salaUbicacion}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
                    onChange={(e) => {
                      handleInputChange("nombreCompleto", e.target.value);
                      if (formErrors.nombreCompleto) {
                        setFormErrors(prev => ({ ...prev, nombreCompleto: undefined }));
                      }
                    }}
                    placeholder="Nombre del Solicitante"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.nombreCompleto 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.nombreCompleto && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nombreCompleto}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => {
                      handleInputChange("correo", e.target.value);
                      if (formErrors.correo) {
                        setFormErrors(prev => ({ ...prev, correo: undefined }));
                      }
                    }}
                    placeholder="Correo del Solicitante"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.correo 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.correo && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.correo}</p>
                  )}
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
                    onChange={(e) => {
                      handleInputChange("nombreEvento", e.target.value);
                      if (formErrors.nombreEvento) {
                        setFormErrors(prev => ({ ...prev, nombreEvento: undefined }));
                      }
                    }}
                    placeholder="Nombre del Evento"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.nombreEvento 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.nombreEvento && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nombreEvento}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Evento
                  </label>
                  <select
                    value={formData.tipoEvento}
                    onChange={(e) => {
                      handleInputChange("tipoEvento", e.target.value);
                      if (formErrors.tipoEvento) {
                        setFormErrors(prev => ({ ...prev, tipoEvento: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.tipoEvento 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Reunion">Reunión</option>
                    <option value="Videoconferencia">Videoconferencia</option>
                    <option value="Presentacion">Presentación</option>
                    <option value="Capacitacion">Capacitación</option>
                    <option value="Conferencia">Conferencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {formErrors.tipoEvento && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.tipoEvento}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.fechaEvento}
                    onChange={(e) => {
                      handleInputChange("fechaEvento", e.target.value);
                      if (formErrors.fechaEvento) {
                        setFormErrors(prev => ({ ...prev, fechaEvento: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.fechaEvento 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.fechaEvento && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.fechaEvento}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={formData.horaInicio}
                      onChange={(e) => {
                        handleInputChange("horaInicio", e.target.value);
                        if (formErrors.horaInicio) {
                          setFormErrors(prev => ({ ...prev, horaInicio: undefined }));
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                        formErrors.horaInicio 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {formErrors.horaInicio && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.horaInicio}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hora de Finalización
                    </label>
                    <input
                      type="time"
                      value={formData.horaFinalizacion}
                      onChange={(e) => {
                        handleInputChange("horaFinalizacion", e.target.value);
                        if (formErrors.horaFinalizacion) {
                          setFormErrors(prev => ({ ...prev, horaFinalizacion: undefined }));
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                        formErrors.horaFinalizacion 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {formErrors.horaFinalizacion && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.horaFinalizacion}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de Participantes
                  </label>
                  <select
                    value={formData.numeroParticipantes}
                    onChange={(e) => {
                      handleInputChange("numeroParticipantes", e.target.value);
                      if (formErrors.numeroParticipantes) {
                        setFormErrors(prev => ({ ...prev, numeroParticipantes: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.numeroParticipantes 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="1-10">1-10</option>
                    <option value="11-20">11-20</option>
                    <option value="21-25">21-25</option>
                    <option value="26-50">26-50</option>
                    <option value="50+">50+</option>
                  </select>
                  {formErrors.numeroParticipantes && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.numeroParticipantes}</p>
                  )}
                </div>
              </div>
            </div>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-blue-900 dark:text-blue-100">
                4. Participantes adicionales (opcional)
              </h2>

              <div className="space-y-4">
                {formData.asistentes.map((asistente: Asistente, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg relative"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Participante {index + 1}
                      </h4>
                      {formData.asistentes.length > 1 && (
                        <button
                          onClick={() => removeParticipante(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <span className="sr-only">Eliminar participante</span>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={asistente.nombre}
                          onChange={(e) =>
                            updateParticipante(index, "nombre", e.target.value)
                          }
                          placeholder="Nombre del participante"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Correo
                        </label>
                        <input
                          type="email"
                          value={asistente.correo}
                          onChange={(e) =>
                            updateParticipante(index, "correo", e.target.value)
                          }
                          placeholder="Correo del participante"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addParticipante}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  + Agregar otro participante
                </button>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Participantes Adicionales
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.asistentes.filter((a: Asistente) => a.nombre).length > 0 ? (
                    formData.asistentes
                      .filter((a: Asistente) => a.nombre)
                      .map((asistente: Asistente, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
                        >
                          {asistente.nombre}
                        </span>
                      ))
                  ) : (
                    "No hay participantes adicionales"
                  )}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSiguiente}
                className="px-8 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
                Resumen de la Reservación
              </h3>

              <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
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
                {salaId && (
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <p className="font-semibold mb-1 text-indigo-900 dark:text-indigo-100">
                      Sala Seleccionada
                    </p>
                    <p className="font-medium">{salaNombre}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{salaUbicacion}</p>
                    <p className="text-xs">Capacidad: {salaCapacidad} personas</p>
                    <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      ✓ Sala preseleccionada
                    </div>
                  </div>
                )}
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
                <div className="border-l-4 border-orange-500 pl-4">
                  <p className="font-semibold mb-1 text-orange-900 dark:text-orange-100">
                    Participantes Adicionales
                  </p>
                  {formData.asistentes.filter((p: Asistente) => p.nombre).length > 0 ? (
                    formData.asistentes
                      .filter((p: Asistente) => p.nombre)
                      .map((participante: Asistente, index: number) => (
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
        </div>
      </div>
    </div>
  );
}

export default function SolicitudReservacionPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <SolicitudReservacionForm />
    </Suspense>
  );
}
