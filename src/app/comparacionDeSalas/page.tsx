'use client'
import React, { useEffect, useState } from "react";
import { useGetSalasOcupadasDisponibles } from "../api/salas/useGetSalas";
import { useParams } from "next/navigation";
import { Currency } from "lucide-react";

const hours = Array.from({ length: 24 }, (_, i) => i); // 0:00 - 23:00

export default function Page() {
    // UNA VEZ SE TENGA LAS PANTALLAS PREVIAS A ESA, HAY QUE CAMBIAR LA FECHA
    // const { fecha } = useParams();
    const fecha = "2025-06-20"
    const salasSeleccionadas = [1, 2];

    const [salas, setSalas] = useState<Array<any>>([]);

    useEffect(() => {
        const cargarDatos = async () => {
            const data = await useGetSalasOcupadasDisponibles("2025-06-20", []);
            const todasLasSalas = [...data.salasDisponibles, ...data.salasOcupadas];
            console.log(todasLasSalas)
            setSalas(todasLasSalas);
        };
        cargarDatos();
    }, []);

    

    return salas.length === 0 ? (
        <div className="flex w-screen h-screen items-center justify-center">
            <p>Cargando...</p>
        </div>
    ) : (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h2 className="text-xl font-semibold">Comparación de Salas</h2>
                <p className="text-sm text-gray-500">Selecciona las salas y compara horarios</p>
            </div>

            <div className="max-w-[300px] min-h-[80px] flex border-2 mb-2 rounded-md">
                <div className="flex flex-col justify-center w-1/2 border-r mx-2">
                    <span className="text-[.8rem]">Fecha</span>
                    <p className="font-semibold">{fecha}</p>
                </div>
                <div className="flex flex-col justify-center w-1/2 mx-2">
                    <span className="text-[.8rem]">Salas</span>
                    <p className="font-semibold">{salasSeleccionadas.map((current: any) => `${current} ` )}</p>
                </div>
            </div>


            <div className="border rounded p-4 overflow-x-auto ">
                <div className="min-w-[1000px] grid grid-cols-[200px_repeat(24,150px)] gap-y-px">
                    {/* Encabezado de horas */}
                    <div className="font-semibold">Sala / Hora</div>
                    {hours.map((hour) => (
                        <div key={hour} className="text-center text-sm font-medium">
                            {hour}:00 - {hour + 1}:00
                        </div>
                    ))}

                    {/* Filas por sala */}
                    {salas.map((room, index) => (
                        <React.Fragment key={index}>
                            <div className="p-2 text-sm bg-gray-100">
                                <div className="font-semibold">{room.nombreSala}</div>
                                <div className="text-gray-500 text-xs">Capacidad maxima: {room.capacidadMax}</div>
                            </div>

                            {hours.map((hour) => {
                                const reserva = room.reservas?.find(
                                    (r: any) => hour >= r.start && hour < r.end
                                );

                                const isInicio = reserva?.start === hour;
                                const isFin = reserva?.end === hour + 1;

                                return (
                                    <div key={hour}
                                        className={`h-16 flex items-center justify-center text-xs
                                            ${reserva ? "bg-red-400 rounded-sm border-2 border-red-300" : "border-x"}
                                            `}>
                                        {isInicio && (
                                            <div className="text-center">
                                                <div>{reserva.label || "Reservado"}</div>
                                                <div className="text-[10px]">
                                                    {reserva.start}:00 - {reserva.end}:00
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
