import { BackendRoute } from "@/types/api/route"
export async function useGetSalas(inicio: Date, fin: Date, salasSeleccionadas: number[]) {
    try {
        const fetchData = await fetch(`${BackendRoute}/salas/listar`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ inicio: inicio, fin: fin, salasSeleccionadas: salasSeleccionadas })
        });
        if (!fetchData.ok) throw new Error("Problemas con el fetch. " + fetchData.status);

        const respuesta = await fetchData.json();
        if (!respuesta.data) throw new Error(respuesta.message);
        return respuesta.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}