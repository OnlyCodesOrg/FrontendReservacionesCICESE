"use client"
import React, { useEffect, useState } from "react";
import './page.css'
import { useGetSalas } from "../api/salas/useGetSalas";
import { createSecureContext } from "tls";
// Voy a suponer siempre inicia desde el dia actual
export default function page() {
    const [fecha, setFecha] = useState({ inicio: new Date("2024-06-01T00:00:00Z"), fin: new Date("2026-06-01T00:00:00Z") });
    const [capacidad, setCapacidad] = useState(0);
    const [equipo, setEquipo] = useState<Array<string>>([]);
    const [salas, setSalas] = useState<Array<any>>([]);

    useEffect(() => {
        const funcion = async () => {
            const backRes = await useGetSalas(fecha.inicio, fecha.fin, []);
            if (backRes) {
                setSalas(backRes);
                console.log(backRes)
            }
        }
        funcion()
    }, [])

    const handleFechaChange = (e: any) => {
        const dateStr = e.target.value;
        const nuevaInicio = new Date(`${dateStr}T${fecha.inicio.toTimeString().slice(0, 5)}`);
        const nuevaFin = new Date(`${dateStr}T${fecha.fin.toTimeString().slice(0, 5)}`);
        setFecha({ inicio: nuevaInicio, fin: nuevaFin });
    };

    const handleHoraInicioChange = (e: any) => {
        const [hours, minutes] = e.target.value.split(':');
        const nuevaInicio = new Date(fecha.inicio);
        nuevaInicio.setHours(+hours);
        nuevaInicio.setMinutes(+minutes);
        setFecha(prev => ({ ...prev, inicio: nuevaInicio }));
    };

    const handleHoraFinChange = (e: any) => {
        const [hours, minutes] = e.target.value.split(':');
        const nuevaFin = new Date(fecha.fin);
        nuevaFin.setHours(+hours);
        nuevaFin.setMinutes(+minutes);
        setFecha(prev => ({ ...prev, fin: nuevaFin }));
    };

    const handleGenericInputs = (e: any) => {
        const { name, value } = e.target;
        switch (name) {
            case 'capacidad':
                setCapacidad(value);
                break;
            case 'equipo':
                setEquipo(value);
                break;
        }
    }

    
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-[2.5rem] mb-4 font-semibold">Nueva</h1>
            <section className="sd-info">
                <article>
                    <p className="text-[.8rem]">Fecha</p>
                    <input
                        type="date"
                        value={fecha.inicio.toISOString().split('T')[0]}
                        onChange={handleFechaChange}
                        className="border p-1 rounded"
                    />
                </article>

                <article>
                    <p className="text-[.8rem]">Horario (24 hrs)</p>
                    <div className="flex gap-2 items-center">
                        <input
                            type="time"
                            value={fecha.inicio.toTimeString().slice(0, 5)}
                            onChange={handleHoraInicioChange}
                            className="border p-1 rounded"
                        />
                        <span>-</span>
                        <input
                            type="time"
                            value={fecha.fin.toTimeString().slice(0, 5)}
                            onChange={handleHoraFinChange}
                            className="border p-1 rounded"
                        />
                    </div>
                </article>
                <article>
                    <p>Capacidad</p>
                    {capacidad === 0 ? (
                        <input
                            placeholder="No especificado"
                            type="number"
                            onChange={handleGenericInputs}
                            className="border-2 p-1 rounded" />
                    ) : (
                        <input
                            type="number"
                            value={capacidad}
                            onChange={handleGenericInputs}
                            className="border-2 p-1 rounded"
                        />
                    )}
                </article>
                <article>
                    <p>Equipo</p>
                    {capacidad === 0 ? (
                        <input
                            placeholder="No especificado"
                            type="text"
                            onChange={handleGenericInputs}
                            className="border-2 p-1 rounded" />
                    ) : (
                        <input
                            type="number"
                            value={equipo}
                            onChange={handleGenericInputs}
                            className="border-2 p-1 rounded"
                        />
                    )}
                </article>
            </section>
            <section className="sd-salas">
                {salas ? (
                    <>{salas.map((current, index) => (
                        <article key={index}>
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwqG5mC2Hr4E3JOGN43xjtxFqFEc7a9jIdMg&s" />
                            <div className="flex flex-col h-full px-5 pb-5 mt-2">
                                <h5 className="font-semibold text-[1.5rem]">{current.nombreSala}</h5>
                                <p className="">{current.ubicacion}</p>
                                <p className="">Capacidad de {current.capacidadMin} hasta {current.capacidadMax} personas</p>
                                <div className="flex mt-auto justify-between">
                                    <button className="px-4 py-2 border-2 rounded-lg">Detalles</button>
                                    <button className="px-4 py-2 border-2 rounded-lg bg-blue-600 text-white">Reservar</button>
                                </div>
                            </div>
                        </article>
                    ))}
                    </>
                ) : (
                    <h3 className="text-[1.5rem] font-semibold my-3">No se encontraron salas disponibles</h3>
                )}
            </section>
        </div>
    );
};

