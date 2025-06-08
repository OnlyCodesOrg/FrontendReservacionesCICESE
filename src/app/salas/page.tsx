"use client"
import React, { useEffect, useState } from "react";
import './page.css';
import { useGetSalas } from "../api/salas/useGetSalas";
import Navbar from "@/components/Navbar";

export default function Page() {
    const [salas, setSalas] = useState<Array<any>>([]);

    useEffect(() => {
        const fetchSalas = async () => {
            const backRes = await useGetSalas();
            if (backRes) {
                setSalas(backRes);
                console.log("Actualizado:", backRes);
            }
        };
        fetchSalas();

        // Llama cada minuto
        const intervalId = setInterval(fetchSalas, 60000); 

        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-[2.5rem] mb-4 font-semibold">Salas del día de hoy</h1>

                <section className="sd-salas">
                    {salas.length > 0 ? (
                        salas.map((current, index) => (
                            <article key={index}>
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwqG5mC2Hr4E3JOGN43xjtxFqFEc7a9jIdMg&s" />
                                <div className="flex flex-col h-full px-5 pb-5 mt-2">
                                    <h5 className="font-semibold text-[1.5rem]">{current.nombreSala}</h5>
                                    <p>{current.ubicacion}</p>
                                    <p className={`font-semibold ${current.estaDisponible ? "text-green-600" : "text-red-600"}`}>
                                        {current.estaDisponible ? "Disponible" : "No disponible"}
                                    </p>
                                    <div className="flex mt-auto justify-between">
                                        <button className="px-4 py-2 border-2 rounded-lg">Detalles</button>
                                        <button className="px-4 py-2 border-2 rounded-lg bg-blue-600 text-white">Reservar</button>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <h3 className="text-[1.5rem] font-semibold my-3">No se encontraron salas disponibles</h3>
                    )}
                </section>
            </div>
        </>
    );
}
