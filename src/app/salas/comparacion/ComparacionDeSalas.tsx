import React from "react";

const roomsTemp = [
    { name: "Sala A Conferencias", capacity: 30, bookings: [{ label: "Ocupado", start: 10, end: 12, color: "bg-red-300" }] },
    { name: "Sala E Computacion", capacity: 30, bookings: [{ label: "Ocupado", start: 10, end: 12, color: "bg-red-300" }] },
    { name: "Sala C Ciencias", capacity: 30, bookings: [{ label: "Ocupado", start: 4, end: 20, color: "bg-red-300" }] },
    { name: "Sala D Redes", capacity: 30, bookings: [{ label: "Mantenimiento", start: 8, end: 10, color: "bg-yellow-200" }] },
];

const hours = Array.from({ length: 24 }, (_, i) => i); // 8:00 - 17:00
type Props = {
    rooms: string[]
}

/**
 * 
 * @param rooms Lista de salas
 * @returns 
 */
export function ComparacionDeSalas({ rooms }: Props) {

    return (
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
                        {roomsTemp.map((current, index) => {
                            if (index != roomsTemp.length - 1) {
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

                    {roomsTemp.map((room, index) => (
                        <React.Fragment key={index}>
                            <div className=" p-2 text-sm">
                                <div>{room.name}</div>
                                <div className="text-gray-500 text-xs">👥 {room.capacity}</div>
                            </div>
                            {hours.map((hour) => {
                                const booking = room.bookings.find(
                                    (b) => hour >= b.start && hour < b.end
                                );
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

