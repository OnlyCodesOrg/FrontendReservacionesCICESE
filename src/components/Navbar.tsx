"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  id_rol: number;
  nombre: string;
  apellidos: string;
};

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          localStorage.removeItem("access_token");
          setUser(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUser(data.user);
        
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API_URL]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="https://sic.cultura.gob.mx/images/62215"
            alt="Logo CICESE"
            width={40}
            height={40}
            className="dark:invert"
          />
          <span className="text-xl font-semibold">CICESE Conferencias</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
            Dashboard
          </Link>
          <Link href="/salas" className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
            Salas
          </Link>
          <Link href="/reservas" className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
            Reservas
          </Link>
          <Link href="/reportes" className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
            Reportes
          </Link>
          <Link href="/calendario" className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
            Calendario
          </Link>
          <Link href="/test" className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
            Pokemon
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="text-sm text-gray-500">…</div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Hola, <strong>{user.nombre}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
