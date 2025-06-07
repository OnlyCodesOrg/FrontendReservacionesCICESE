import { BackendRoute } from "@/types/api/route";

export async function ObtenerEquipoDeSala(idSala: number) {
    try {
        const fetchData = await fetch(`${BackendRoute}/salas/equipo/${idSala}`);
        if (!fetchData.ok) throw new Error("Error con el fetch. " + fetchData.status);
        const data = await fetchData.json();
        if (!data.data) throw new Error(data.message);
        return data.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}