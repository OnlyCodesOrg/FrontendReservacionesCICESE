"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

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
  // Datos del Solicitante
  nombreCompleto: string;
  correo: string;
  departamento: string;
  
  // Detalles del Evento
  nombreEvento: string;
  tipoEvento: string;
  fechaEvento: string;
  esRecurrente: boolean;
  horaInicio: string;
  horaFinalizacion: string;
  numeroParticipantes: string;
  
  // Recursos Necesarios
  equipoRequerido: EquipoRequerido;
  serviciosRequeridos: ServiciosRequeridos;
  
  // Participantes adicionales
  participantes: Participante[];
}

function SolicitudReservacionContent() {
  const searchParams = useSearchParams();
  const fecha = searchParams.get("fecha");
  
  const [formData, setFormData] = useState<FormData>({
    // Datos del Solicitante
    nombreCompleto: "",
    correo: "",
    departamento: "",
    
    // Detalles del Evento
    nombreEvento: "",
    tipoEvento: "",
    fechaEvento: fecha || "",
    esRecurrente: false,
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
      wifi: false
    },
    serviciosRequeridos: {
      cafe: false,
      agua: false,
      tableta: false,
      proyector: false,
      microfono: false,
      wifi: false
    },
    
    // Participantes adicionales
    participantes: [{ nombre: "", correo: "" }]
  });

  const [savedSections, setSavedSections] = useState<{[key: number]: boolean}>({
    1: false,
    2: false,
    3: false,
    4: false
  });

  // Estado para almacenar el ID de la reservación creada
  const [reservacionId, setReservacionId] = useState<number | null>(null);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (category: 'equipoRequerido' | 'serviciosRequeridos', item: string) => {
    setFormData(prev => {
      if (category === 'equipoRequerido') {
        return {
          ...prev,
          equipoRequerido: {
            ...prev.equipoRequerido,
            [item]: !prev.equipoRequerido[item as keyof EquipoRequerido]
          }
        };
      } else {
        return {
          ...prev,
          serviciosRequeridos: {
            ...prev.serviciosRequeridos,
            [item]: !prev.serviciosRequeridos[item as keyof ServiciosRequeridos]
          }
        };
      }
    });
  };

  const selectAllEquipo = () => {
    setFormData(prev => ({
      ...prev,
      equipoRequerido: {
        proyector: true,
        camara: true,
        tableta: true,
        proyectorPortatil: true,
        microfono: true,
        wifi: true
      }
    }));
  };

  const selectAllServicios = () => {
    setFormData(prev => ({
      ...prev,
      serviciosRequeridos: {
        cafe: true,
        agua: true,
        tableta: true,
        proyector: true,
        microfono: true,
        wifi: true
      }
    }));
  };

  const addParticipante = () => {
    setFormData(prev => ({
      ...prev,
      participantes: [...prev.participantes, { nombre: "", correo: "" }]
    }));
  };

  const removeParticipante = (index: number) => {
    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.filter((_, i) => i !== index)
    }));
  };

  const updateParticipante = (index: number, field: keyof Participante, value: string) => {
    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  // Funciones para guardar cada sección
  const saveSection = async (sectionNumber: number) => {
    try {
      if (sectionNumber === 1) {
        // TODO: Implementar endpoint para datos del solicitante cuando esté disponible
        /*
        const endpoint = '/api/solicitud/datos-solicitante';
        const data = {
          nombreCompleto: formData.nombreCompleto,
          correo: formData.correo,
          departamento: formData.departamento
        };
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Error al guardar datos del solicitante');
        }
        */
        
        // Simulación temporal
        setSavedSections(prev => ({ ...prev, [sectionNumber]: true }));
        console.log('Sección 1 guardada (simulado):', {
          nombreCompleto: formData.nombreCompleto,
          correo: formData.correo,
          departamento: formData.departamento
        });

      } else if (sectionNumber === 2) {
        // Crear la reservación usando el endpoint real
        const endpoint = 'https://reservaciones-cicese-app.ambitioussea-007d0918.westus3.azurecontainerapps.io/reservaciones/crear';
        
        // Preparar el equipo seleccionado
        const equipoSeleccionado = Object.entries(formData.equipoRequerido)
          .filter(([_, selected]) => selected)
          .map(([item, _]) => {
            // Mapear nombres del frontend a nombres del backend
            const equipoMap: { [key: string]: string } = {
              'proyector': 'Proyector',
              'camara': 'Webcam',
              'tableta': 'Tableta',
              'proyectorPortatil': 'Proyector Portátil',
              'microfono': 'Microfonos',
              'wifi': 'WiFi'
            };
            return equipoMap[item] || item;
          });

        // Preparar observaciones con servicios seleccionados
        const serviciosSeleccionados = Object.entries(formData.serviciosRequeridos)
          .filter(([_, selected]) => selected)
          .map(([item, _]) => item)
          .join(', ');
        
        const observaciones = serviciosSeleccionados ? `Servicios requeridos: ${serviciosSeleccionados}` : '';

        const reservacionData = {
          sala: "Por asignar", // TODO: Implementar selección de sala
          tipoEvento: formData.tipoEvento,
          fechaEvento: formData.fechaEvento,
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFinalizacion,
          asistentes: parseInt(formData.numeroParticipantes.split('-')[0]) || 0, // Tomar el primer número del rango
          equipo: equipoSeleccionado,
          observaciones: observaciones
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reservacionData),
        });

        if (!response.ok) {
          throw new Error(`Error al crear reservación: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Guardar el ID de la reservación para usar en participantes
        if (result.id) {
          setReservacionId(result.id);
        }
        
        setSavedSections(prev => ({ ...prev, [sectionNumber]: true }));
        console.log('Reservación creada exitosamente:', result);

      } else if (sectionNumber === 3) {
        // Los recursos ya se envían en la sección 2, solo marcar como guardado
        setSavedSections(prev => ({ ...prev, [sectionNumber]: true }));
        console.log('Sección 3 marcada como guardada (recursos incluidos en reservación)');

      } else if (sectionNumber === 4) {
        // Endpoint real para participantes
        const endpoint = 'https://reservaciones-cicese-app.ambitioussea-007d0918.westus3.azurecontainerapps.io/participantes-ad/agregarParticipante';
        
        // Filtrar participantes que tengan nombre
        const participantesValidos = formData.participantes.filter(p => p.nombre.trim() !== '');
        
        if (participantesValidos.length === 0) {
          console.log('No hay participantes válidos para guardar');
          setSavedSections(prev => ({ ...prev, [sectionNumber]: true }));
          return;
        }

        // Usar el ID de la reservación creada o uno temporal
        const idReservacion = reservacionId || 32; // Fallback temporal

        // Enviar cada participante por separado
        const promises = participantesValidos.map(async (participante) => {
          const participanteData = {
            reservacionId: idReservacion,
            nombre: participante.nombre,
            email: participante.correo
          };

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(participanteData),
          });

          if (!response.ok) {
            throw new Error(`Error al guardar participante ${participante.nombre}: ${response.statusText}`);
          }

          return response.json();
        });

        // Esperar a que todos los participantes se guarden
        await Promise.all(promises);
        
        setSavedSections(prev => ({ ...prev, [sectionNumber]: true }));
        console.log(`Participantes guardados exitosamente: ${participantesValidos.length} participantes`);
      }
    } catch (error) {
      console.error(`Error guardando sección ${sectionNumber}:`, error);
      // Mostrar error al usuario
      alert(`Error al guardar la sección ${sectionNumber}. Por favor, inténtalo de nuevo.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario Principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Datos del Solicitante */}
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
                    onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
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
                    onChange={(e) => handleInputChange('correo', e.target.value)}
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
                    onChange={(e) => handleInputChange('departamento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="sistemas">Sistemas</option>
                    <option value="administracion">Administración</option>
                    <option value="investigacion">Investigación</option>
                    <option value="docencia">Docencia</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => saveSection(1)}
                  className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>

            {/* 2. Detalles del Evento */}
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
                    onChange={(e) => handleInputChange('nombreEvento', e.target.value)}
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
                    onChange={(e) => handleInputChange('tipoEvento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Conferencia">Conferencia</option>
                    <option value="Reunion">Reunión</option>
                    <option value="Seminario">Seminario</option>
                    <option value="Taller">Taller</option>
                    <option value="Junta rutinaria">Junta rutinaria</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.fechaEvento}
                    onChange={(e) => handleInputChange('fechaEvento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recurrente"
                    checked={formData.esRecurrente}
                    onChange={(e) => handleInputChange('esRecurrente', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="recurrente" className="text-sm text-gray-700 dark:text-gray-300">
                    Es Recurrente?
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={formData.horaInicio}
                      onChange={(e) => handleInputChange('horaInicio', e.target.value)}
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
                      onChange={(e) => handleInputChange('horaFinalizacion', e.target.value)}
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
                    onChange={(e) => handleInputChange('numeroParticipantes', e.target.value)}
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
              
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => saveSection(2)}
                  className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
                >
                  Crear Reservación
                </button>
              </div>
            </div>

            {/* 3. Recursos Necesarios */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-blue-900 dark:text-blue-100">
                3. Recursos Necesarios
              </h2>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p>💡 Los recursos se incluyen automáticamente al crear la reservación en la sección anterior.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium mb-4 text-gray-700 dark:text-gray-300">Equipo</h3>
                  <div className="space-y-2">
                    {Object.keys(formData.equipoRequerido).map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`equipo-${item}`}
                          checked={formData.equipoRequerido[item as keyof EquipoRequerido]}
                          onChange={() => handleCheckboxChange('equipoRequerido', item)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`equipo-${item}`} className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {item === 'proyectorPortatil' ? 'Proyector Portátil' : 
                           item === 'microfono' ? 'Micrófono' : 
                           item === 'camara' ? 'Cámara' : item}
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
                  <h3 className="font-medium mb-4 text-gray-700 dark:text-gray-300">Servicios</h3>
                  <div className="space-y-2">
                    {Object.keys(formData.serviciosRequeridos).map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`servicio-${item}`}
                          checked={formData.serviciosRequeridos[item as keyof ServiciosRequeridos]}
                          onChange={() => handleCheckboxChange('serviciosRequeridos', item)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`servicio-${item}`} className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {item === 'microfono' ? 'Micrófono' : 
                           item === 'cafe' ? 'Café' : item}
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
              
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => saveSection(3)}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={!savedSections[2]}
                >
                  Confirmar Recursos
                </button>
              </div>
            </div>

            {/* 4. Participantes adicionales */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-blue-900 dark:text-blue-100">
                4. Participantes adicionales (opcional)
              </h2>
              
              <div className="space-y-4">
                {formData.participantes.map((participante, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
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
                          onChange={(e) => updateParticipante(index, 'nombre', e.target.value)}
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
                          onChange={(e) => updateParticipante(index, 'correo', e.target.value)}
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
                  
                  <button 
                    onClick={() => saveSection(4)}
                    className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Lateral - Detalles de la Reservación */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
                Detalles de la Reservación
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400">📅</span>
                  </div>
                  <div>
                    <p className="font-medium">Sala por Asignar</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ubicación pendiente</p>
                  </div>
                </div>
                
                {savedSections[1] && (
                  <div className="text-sm border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Datos del Solicitante</p>
                    <p className="text-gray-700 dark:text-gray-300">{formData.nombreCompleto || 'Sin especificar'}</p>
                    <p className="text-gray-700 dark:text-gray-300">{formData.correo || 'Sin especificar'}</p>
                    <p className="text-gray-700 dark:text-gray-300">Dpto: {formData.departamento || 'Sin especificar'}</p>
                  </div>
                )}
                
                {savedSections[2] && (
                  <div className="text-sm border-l-4 border-green-500 pl-4">
                    <p className="font-semibold mb-2 text-green-900 dark:text-green-100">Detalles del Evento</p>
                    <p className="text-gray-700 dark:text-gray-300">{formData.nombreEvento || 'Sin especificar'}</p>
                    <p className="text-gray-700 dark:text-gray-300">Tipo: {formData.tipoEvento || 'Sin especificar'}</p>
                    <p className="text-gray-700 dark:text-gray-300">Fecha: {formData.fechaEvento || 'Sin especificar'}</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Hora: {formData.horaInicio || '--:--'} - {formData.horaFinalizacion || '--:--'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">Participantes: {formData.numeroParticipantes || 'Sin especificar'}</p>
                  </div>
                )}
                
                {savedSections[3] && (
                  <div className="text-sm border-l-4 border-purple-500 pl-4">
                    <p className="font-semibold mb-2 text-purple-900 dark:text-purple-100">Recursos Necesarios</p>
                    <div className="space-y-1">
                      <p className="font-medium">Equipo:</p>
                      {Object.entries(formData.equipoRequerido).filter(([_, selected]) => selected).map(([item, _]) => (
                        <p key={item} className="text-gray-700 dark:text-gray-300 text-xs">• {item}</p>
                      ))}
                      <p className="font-medium pt-2">Servicios:</p>
                      {Object.entries(formData.serviciosRequeridos).filter(([_, selected]) => selected).map(([item, _]) => (
                        <p key={item} className="text-gray-700 dark:text-gray-300 text-xs">• {item}</p>
                      ))}
                    </div>
                  </div>
                )}
                
                {savedSections[4] && formData.participantes.some(p => p.nombre) && (
                  <div className="text-sm border-l-4 border-orange-500 pl-4">
                    <p className="font-semibold mb-2 text-orange-900 dark:text-orange-100">Participantes Adicionales</p>
                    {formData.participantes.filter(p => p.nombre).map((participante, index) => (
                      <p key={index} className="text-gray-700 dark:text-gray-300 text-xs">• {participante.nombre}</p>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="w-full mt-6 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors">
                Enviar Solicitud Completa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SolicitudReservacionPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Cargando...</div>}>
      <SolicitudReservacionContent />
    </Suspense>
  );
}