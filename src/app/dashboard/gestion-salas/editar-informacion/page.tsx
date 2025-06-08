"use client";

import {
  ArrowLeftIcon,
  Trash2Icon,
  PlusCircleIcon,
  SaveIcon,
} from "lucide-react";

// skrl
export default function EditarSalaPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded hover:bg-gray-200">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Editar Sala</h1>
                <p className="text-gray-500 text-sm">
                  Sala A Conferencias - Edificio, Piso 1
                </p>
              </div>
            </div>
            <button className="bg-blue-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-800">
              <SaveIcon className="w-5 h-5" />
              Guardar Cambios
            </button>
          </div>

          {/* Información de la Sala */}
          <section className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="font-semibold mb-4">Información de la Sala</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input className="w-full border rounded px-3 py-2" placeholder="Nombre de la Sala" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <input className="w-full border rounded px-3 py-2" placeholder="Ubicación" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacidad</label>
                <input className="w-full border rounded px-3 py-2" placeholder="50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm">Disponible</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsable</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Martín Ortiz</option>
                </select>
              </div>
            </div>
          </section>

          {/* Equipamiento */}
          <section className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Equipamiento</h2>
              <button className="bg-blue-900 text-white px-3 py-1 rounded flex items-center gap-2 hover:bg-blue-800 text-sm">
                <PlusCircleIcon className="w-5 h-5" />
                Agregar Equipo
              </button>
            </div>
            <div className="space-y-4">
              {/* Ejemplo de equipo */}
              <div className="grid grid-cols-1 md:grid-cols-[3.5fr_0.5fr_2fr] gap-3 items-center pb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="Cámara" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="1" type="number" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <div className="flex items-center gap-2">
                    {/* Estado Operativo */}
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    <select className="border rounded px-2 py-1 text-sm">
                      <option>Operativo</option>
                      <option>En Mantenimiento</option>
                    </select>
                    <button className="text-red-500 hover:bg-red-100 rounded p-2 ml-2">
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Otro equipo con estado en mantenimiento */}
              <div className="grid grid-cols-1 md:grid-cols-[3.5fr_0.5fr_2fr] gap-3 items-center pb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="Cámara" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="1" type="number" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <div className="flex items-center gap-2">
                    {/* Estado En Mantenimiento */}
                    <span className="inline-block w-3 h-3 rounded-full bg-orange-400"></span>
                    <select className="border rounded px-2 py-1 text-sm">
                      <option>Operativo</option>
                      <option>En Mantenimiento</option>
                    </select>
                    <button className="text-red-500 hover:bg-red-100 rounded p-2 ml-2">
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Servicios */}
          <section className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Servicios</h2>
              <button className="bg-blue-900 text-white px-3 py-1 rounded flex items-center gap-2 hover:bg-blue-800 text-sm">
                <PlusCircleIcon className="w-5 h-5" />
                Agregar Servicio
              </button>
            </div>
            <div className="space-y-4">
              {/* Ejemplo de servicio */}
              <div className="grid grid-cols-1 md:grid-cols-[3.5fr_0.5fr_2fr] gap-3 items-center pb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="Zoom" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="1" type="number" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <div className="flex items-center gap-2">
                    {/* Estado Operativo */}
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    <select className="border rounded px-2 py-1 text-sm">
                      <option>Operativo</option>
                      <option>En Mantenimiento</option>
                    </select>
                    <button className="text-red-500 hover:bg-red-100 rounded p-2 ml-2">
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Otro servicio con estado en mantenimiento */}
              <div className="grid grid-cols-1 md:grid-cols-[3.5fr_0.5fr_2fr] gap-3 items-center pb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="Wifi" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad</label>
                  <input className="w-full border rounded px-3 py-2" placeholder="1" type="number" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <div className="flex items-center gap-2">
                    {/* Estado En Mantenimiento */}
                    <span className="inline-block w-3 h-3 rounded-full bg-orange-400"></span>
                    <select className="border rounded px-2 py-1 text-sm">
                      <option>Operativo</option>
                      <option>En Mantenimiento</option>
                    </select>
                    <button className="text-red-500 hover:bg-red-100 rounded p-2 ml-2">
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}