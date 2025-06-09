interface NotificacionTecnicoProps {
  sala: string;
  fecha: string;
  horario: string;
  fechaAsignacion: string;
  onVerDetalles?: () => void;
}

export default function NotificacionTecnico({
  sala = "Sala de Conferencias A",
  fecha = "7 Jun 2025",
  horario = "11:00 - 13:00",
  fechaAsignacion = "15 mayo 2025",
  onVerDetalles,
}: NotificacionTecnicoProps) {
  return (
    <div className="border rounded-xl bg-white p-6 flex items-center gap-6 shadow-sm max-w-full">
      {/* Icono de radio */}
      <div className="flex items-center justify-center">
        <span className="inline-block w-7 h-7 rounded-full border-2 border-gray-300 bg-gray-100 relative">
          <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-gray-200 border border-gray-300"></span>
        </span>
      </div>
      {/* Contenido principal */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-lg font-medium text-gray-900 mb-1">Se te asignó un nuevo evento!</div>
            <div className="text-xl font-bold text-black mb-2">{sala}</div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-full px-3 py-1">
                Fecha: {fecha}
              </span>
              <span className="bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-full px-3 py-1">
                Horario: {horario}
              </span>
            </div>
          </div>
          <div className="text-right min-w-[120px]">
            <div className="text-base font-semibold text-gray-400">{fechaAsignacion}</div>
            <button
              className="mt-4 sm:mt-8 border border-gray-300 rounded-lg px-6 py-2 font-medium text-black hover:bg-gray-100 transition"
              onClick={onVerDetalles}
            >
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}