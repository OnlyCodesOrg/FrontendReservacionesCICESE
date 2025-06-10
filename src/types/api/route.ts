// Recomiendo usar esta variable en todas las peticiones que hagan al backend, para evitar tener que reescribir las rutas si hosteamos la pagina
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const BackendRoute = API_URL;