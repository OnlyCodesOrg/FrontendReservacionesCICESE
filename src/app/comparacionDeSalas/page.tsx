'use client'
import React, { useEffect, useState } from "react";
import { useGetSalasDisponibles } from "../api/salas/useGetSalas";

const hours = Array.from({ length: 24 }, (_, i) => i); // 8:00 - 17:00

// Necesito que envien la fecha
export default function page() {
    const [salas, setSalas] = useState<Array<any>>([]);
    useEffect(() => {
        const cargarDatas = async () => {
            const salasFetch = await useGetSalasDisponibles("2025-06-20", "10:00", "11:00", [1, 2]);
            console.log(salasFetch);
            setSalas(salasFetch);
        }
        cargarDatas();
    }, [])
    return !salas ? (
        <div>
            Cargando..
        </div>
    ) : (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h2 className="text-xl font-semibold">Comparación de Salas</h2>
                <p className="text-sm text-gray-500">Selecciona las salas y compara horarios</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 w-fit">
                <div className="border p-4 rounded shadow-sm">
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">12 de Mayo 2025</p>
                </div>
                <div className="border p-4 rounded shadow-sm max-w-[600px]">
                    <p className="text-sm text-gray-500">Salas</p>
                    <div className="flex overflow-auto">
                        {salas.map((current, index) => {
                            if (index != salas.length - 1) {
                                return (
                                    <div className="flex flex-col mr-2">
                                        <p className="font-medium">{current.name} -</p>
                                    </div>
                                )
                            } else {
                                return (
                                    <div className="flex flex-col mr-2">
                                        <p className="font-medium">{current.name}</p>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            </div>

            <div className="border rounded p-4 overflow-auto">
                <div className="grid grid-cols-[200px_repeat(24,1fr)] gap-y-px">
                    <div className="font-semibold">Salas</div>
                    {hours.map((hour) => (
                        <div key={hour} className="text-center text-sm font-medium">
                            {hour}:00
                        </div>
                    ))}

                    {salas.map((room, index) => (
                        <React.Fragment key={index}>
                            <div className=" p-2 text-sm">
                                <div>{room.name}</div>
                                <div className="text-gray-500 text-xs">{room.capacity}</div>
                            </div>
                            {hours.map((hour) => {
                                const booking = room.horaInicio
                                return (
                                    <div
                                        key={hour}
                                        className={`h-16 flex items-center justify-center text-xs ${booking ? booking.color + " text-black font-medium" : ""
                                            } ${booking && hour === booking.start ? "rounded-l" : ""
                                            } ${booking && hour === booking.end - 1 ? "rounded-r" : ""
                                            }`}
                                    >
                                        {booking && hour === booking.start ? (
                                            <div className="text-center">
                                                <div>{booking.label}</div>
                                                <div className="text-[10px]">
                                                    {booking.start}:00 - {booking.end}:00
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

