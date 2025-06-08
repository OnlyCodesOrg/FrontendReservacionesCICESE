import { BackendRoute } from "@/types/api/route"

export async function useGetSalas() {
    try {
        const fetchData = await fetch(`http://localhost:3000/salas/consultar-disponibilidad`);
        if (!fetchData.ok) throw new Error("Problemas con el fetch");
        const data = await fetchData.json();
        return data;
    } catch (e) {
        console.error(e);
        return null
    }
}

export async function useGetSalasOcupadasDisponibles(diaDelEvento: string, salasSeleccionadas: number[]) {
    try {
        const fetchData = await fetch(`${BackendRoute}/salas/listar`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ fecha: diaDelEvento, salasSeleccionadas: salasSeleccionadas })
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