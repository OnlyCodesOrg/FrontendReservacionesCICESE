import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900 dark:text-blue-100">
                Sistema de Gestión de Salas y Videoconferencias
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Reserva salas, organiza conferencias y gestiona recursos de
                forma eficiente en tiempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard/solicitud-reservacion"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md shadow-sm transition-colors"
                >
                  Nueva Reserva
                </Link>
                <Link
                  href="/dashboard/calendario"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Ver Calendario
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://cicese.edu.mx/recorrido-virtual/img/cicese/social-hero.jpg"
                alt="Ilustración de gestión de salas"
                width={500}
                height={400}
                className="rounded-lg object-cover shadow-xl dark:opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900 dark:text-blue-100">
            Funcionalidades Principales
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Gestión de Salas",
                desc: "Visualiza la disponibilidad de salas en tiempo real y reserva con anticipación.",
                icon: "🏢",
              },
              {
                title: "Calendario Integrado",
                desc: "Filtros avanzados para visualizar reservas por sala, edificio o estado.",
                icon: "📅",
              },
              {
                title: "Reportes Técnicos",
                desc: "Notifica problemas con equipos y sigue el estado de las reparaciones.",
                icon: "🔧",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} CICESE Conferencias | Sistema de Gestión de Salas
      </footer>
    </div>
  );
}