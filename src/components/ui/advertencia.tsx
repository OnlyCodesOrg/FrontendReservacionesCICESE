import { AlertTriangleIcon } from "lucide-react";

export default function advertencia() {
  return (
    <div className="bg-[#eab96b] text-white rounded-lg p-6 max-w-3xl mx-auto mt-8 shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <AlertTriangleIcon className="w-7 h-7" />
        <span className="text-xl font-semibold">
          No se pudo asignar técnico
        </span>
      </div>
      <div className="text-base font-medium mb-2">
        Por cuestiones de problemas de horarios, en este momento<br />
        no se te pudo asignar un técnico responsable
      </div>
      <div className="text-base">
        Favor de revisar otro día para ver la información de tu técnico asignado
      </div>
    </div>
  );
}