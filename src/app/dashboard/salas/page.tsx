"use client"
import React, { useEffect, useState } from "react";
import './page.css';
import { getSalas } from "../../api/salas/useGetSalas";
import Link from "next/link";

export default function Page() {
    const [salas, setSalas] = useState<Array<any>>([]);
    const [filteredSalas, setFilteredSalas] = useState<Array<any>>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("todos");

    useEffect(() => {
        const fetchSalas = async () => {
            const backRes = await getSalas();
            if (backRes) {
                setSalas(backRes);
                setFilteredSalas(backRes);
                console.log("Actualizado:", backRes);
            }
        };
        fetchSalas();

        // Llama cada minuto
        const intervalId = setInterval(fetchSalas, 60000);

        return () => clearInterval(intervalId);
    }, []);

    // Filtrar salas cuando cambie el término de búsqueda o el filtro de estado
    useEffect(() => {
        let filtered = salas;

        // Filtrar por nombre
        if (searchTerm) {
            filtered = filtered.filter(sala =>
                sala.nombreSala.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por estado
        if (estadoFiltro !== "todos") {
            const disponible = estadoFiltro === "disponible";
            filtered = filtered.filter(sala => sala.estaDisponible === disponible);
        }

        setFilteredSalas(filtered);
    }, [salas, searchTerm, estadoFiltro]);

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                Gestión de Salas
                            </h1>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                Comparar Horarios
                            </button>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nombre de la Sala"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="sm:w-48">
                            <select
                                value={estadoFiltro}
                                onChange={(e) => setEstadoFiltro(e.target.value)}
                                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="todos">Estado</option>
                                <option value="disponible">Disponible</option>
                                <option value="ocupado">No disponible</option>
                            </select>
                        </div>
                    </div>

                    {/* Grid de Salas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSalas.length > 0 ? (
                            filteredSalas.map((sala, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    {/* Imagen de la sala */}
                                    <div className="relative">
                                        <img
                                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwqG5mC2Hr4E3JOGN43xjtxFqFEc7a9jIdMg&s"
                                            alt={sala.nombreSala}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${sala.estaDisponible
                                                    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                                    : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                                }`}>
                                                {sala.estaDisponible ? "Disponible" : "No disponible"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contenido de la tarjeta */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {sala.nombreSala}
                                        </h3>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-sm">{sala.ubicacion}</span>
                                            </div>

                                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                                <span className="text-sm">Capacidad: {sala.capacidadMax || 36} personas</span>
                                            </div>
                                        </div>

                                        {/* Botones */}
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/dashboard/detalles-sala?salaId=${sala.id}&salaNombre=${encodeURIComponent(sala.nombreSala)}&salaUbicacion=${encodeURIComponent(sala.ubicacion)}&salaCapacidad=${sala.capacidadMax || 36}`}
                                                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                                            >
                                                Detalles
                                            </Link>
                                            {sala.estaDisponible ? (
                                                <Link
                                                    href={`/dashboard/solicitud-reservacion?salaId=${sala.id}&salaNombre=${encodeURIComponent(sala.nombreSala)}&salaUbicacion=${encodeURIComponent(sala.ubicacion)}&salaCapacidad=${sala.capacidadMax || 36}`}
                                                    className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-center"
                                                >
                                                    Reservar
                                                </Link>
                                            ) : (
                                                <button
                                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400 rounded-lg"
                                                    disabled
                                                >
                                                    No disponible
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No se encontraron salas
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Intenta ajustar tus filtros de búsqueda
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
