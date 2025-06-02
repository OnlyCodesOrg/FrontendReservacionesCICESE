// app/(public)/login/page.tsx   ← Ajusta la ruta según tu estructura de carpetas
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // Estados de formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Error message para mostrar al usuario
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Loading para deshabilitar botón mientras se envía
  const [loading, setLoading] = useState(false);

  // URL base de tu API (usa variable de entorno)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validación mínima en el frontend
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          contraseña: password,
        }),
      });

      if (!res.ok) {
        // Si el backend devuelve 401 o 400, extraigo el mensaje
        const data = await res.json();
        // data.message contendrá "Correo no encontrado." o "La contraseña es incorrecta." según tu AuthService
        setErrorMessage(data.message || "Ocurrió un error inesperado.");
        setLoading(false);
        return;
      }

      const { access_token } = await res.json();

      // Guardar token (aquí localStorage, considera cookies httpOnly si quieres más seguridad)
      localStorage.setItem("access_token", access_token);

      // Decidir a dónde redirigir; por simplicidad, a /dashboard
      // Si deseas redirigir según rol, debes decodificar el JWT y leer idRol
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al hacer login:", error);
      setErrorMessage("No se pudo conectar con el servidor. Intenta más tarde.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Panel izquierdo */}
      <div className="w-full md:w-1/2 bg-gradient-to-b from-blue-900 to-blue-700 flex flex-col justify-center items-center text-white p-8 md:p-16">
        <img
          src="https://www.cicese.edu.mx/recorrido-virtual/img/cicese/logo-cicese.png"
          alt="CICESE"
          className="mb-8 w-24"
        />
        <h1 className="text-2xl font-bold mb-6 text-left">Bienvenido a RED-CICESE</h1>
        <p className="text-lg w-80 text-left">
          Plataforma interna para el acceso a las herramientas y recursos del CICESE. <br />
          Inicie sesión con su cuenta institucional para continuar.
        </p>
      </div>

      {/* Panel derecho */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6 md:p-10">
          <h2 className="text-2xl font-bold text-center mb-2">Iniciar Sesión</h2>
          <p className="text-gray-500 text-center mb-6">
            Ingresa tus credenciales para ingresar
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Campo correo */}
            <label htmlFor="email" className="block mb-2 font-medium">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="usuario@cicese.mx"
              className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-700"
              required
            />

            {/* Campo contraseña */}
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="font-medium">
                Contraseña
              </label>
              <a href="#" className="text-blue-700 text-sm hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="relative mb-6">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-700"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-500"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.822-.64 1.607-1.09 2.336M15.54 15.54A9.956 9.956 0 0112 17c-4.477 0-8.268-2.943-9.542-7 .274-.822.64-1.607 1.09-2.336"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Error message */}
            {errorMessage && (
              <p className="text-red-600 text-sm mb-4 text-center">{errorMessage}</p>
            )}

            <button
              type="submit"
              className={`w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 rounded transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
