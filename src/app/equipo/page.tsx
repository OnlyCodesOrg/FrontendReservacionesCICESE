'use client'
import React, { useEffect, useState } from 'react'
import { ObtenerEquipoDeSala } from './useGetEquipo';
import { getSala } from './useGetSala';

export default function Page() {
    const [sala, setSala] = useState<any>({})
    const [equipo, setEquipo] = useState<Array<any>>([]);
    const [tabSeleccionado, setTabSeleccionado] = useState("Operativo");

    useEffect(() => {
        const funcion = async () => {
            const sala = await getSala(1);
            const equipo = await ObtenerEquipoDeSala(1);
            if (sala && equipo) {
                setSala(sala)
                setEquipo(equipo);
                console.log(sala);
                console.log(equipo);
            }
        };
        funcion();
    }, []);

    const equipoFiltrado = equipo.filter(item => item.equipo.estado === tabSeleccionado);

    return !sala ? (
        <div className='flex w-full h-full items-center justify-center'>
            <p>Cargando ...</p>
        </div>
    ) : (
        <div className='container mx-auto py-2'>
            <div className='flex'>
                <div className='flex flex-col w-[10%] mx-auto'>
                    <button className='border px-3 py-2 shadow-sm w-fit h-fit mx-auto rounded-md border-1'>{"<"}</button >
                </div >
                <main className='flex flex-col w-[100%]'>
                    <div className='flex justify-between mb-5 items-center'>
                        <div>
                            <h1 className='font-semibold text-[2.5rem]'>Información de la sala</h1>
                            {sala.nombreSala} - {sala.ubicacion}
                        </div>
                        <div>
                            <button className='border shadow-sm p-3 rounded-md h-fit my-auto'>Ver Historial</button>
                            <button className='bg-purple-900 p-3 rounded-md ml-2 h-fit my-auto text-white'>Editar Informacion</button>
                        </div>
                    </div>

                    <div className='w-full h-[300px] overflow-hidden rounded-xl'>
                        <img className='object-cover w-full h-full' src='https://medicina.tij.uabc.mx/wp-content/uploads/2021/08/Facultad-Nosotros-Nuestra-Historia.jpg' />
                    </div>

                    <div className='flex mt-4 items-center'>
                        <h2 className='text-[2rem] font-semibold mr-5'>{sala.nombreSala}</h2>
                        <span className="h-fit text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                            {sala.disponible}
                        </span>
                    </div>

                    <span className='mb-2'>{sala.ubicacion}</span>
                    <span className='mb-2'>Capacidad maxima : {sala.capacidadMax}</span>

                    <section className='p-5 rounded-xl border shadow-sm mt-5'>
                        <h4 className='font-semibold text-[1.5rem]'>
                            Estado de Equipamiento ({equipoFiltrado.length})
                        </h4>

                        <div className='flex justify-between my-4 bg-[#e3e3e3] p-1 rounded-xl'>
                            {["Operativo", "No Operativo", "No Mantenimiento"].map((estado, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setTabSeleccionado(estado)}
                                    className={`rounded-xl py-2 px-2 w-full mx-1 transition-all
                                        ${tabSeleccionado === estado ? 'bg-white font-semibold shadow' : 'bg-transparent text-gray-700'}
                                    `}
                                >
                                    {estado}
                                </button>
                            ))}
                        </div>

                        {equipoFiltrado.length > 0 ? (
                            equipoFiltrado.map((current, index) => (
                                <div key={index} className="flex flex-col border rounded-lg p-4 mb-3 shadow-sm bg-white">
                                    <div className='flex justify-between mb-5'>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{current.detalles.nombre}</h3>
                                            <p className="text-sm text-gray-500">Cantidad: {current.equipo.cantidad}</p>
                                        </div>
                                        <span className={`h-fit text-sm font-medium px-3 py-1 rounded-full
                                            ${current.equipo.estado === "Operativo" ? "bg-green-100 text-green-700" :
                                                current.equipo.estado === "No Operativo" ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"}
                                        `}>
                                            {current.equipo.estado}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-1 border border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-md text-sm font-medium">
                                                Enviar a Mantenimiento
                                            </button>
                                            <button className="flex items-center gap-1 border border-red-300 text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm font-medium">
                                                Reportar Daño
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">No hay equipos con este estado.</p>
                        )}
                    </section>
                </main>
            </div >
        </div >
    );
}
