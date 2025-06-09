"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendario";
import { Conferencia } from "@/types/components";

export default function CalendarioPage() {
  const [conferencias, setConferencias] = useState<Conferencia[]>([]);
  
  useEffect(() => {
    // Conferencias enriquecidas con más datos
    const conferenciasSimuladas: Conferencia[] = [
      {
        id: "1",
        numeroReservacion: "0212",
        titulo: "Taller de Escritura Académica",
        fechaInicio: "2025-06-15T10:00:00",
        fechaFin: "2025-06-15T12:00:00",
        color: "bg-blue-500",
        salaId: "sala1",
        nombreSala: "Sala de Conferencias A",
        solicitante: {
          nombre: "Martín Ortiz",
          email: "ortiz.martin96@cicese.mx",
          departamento: "Software"
        },
        ubicacion: {
          sala: "Sala de Conferencias A",
          edificio: "Edificio Principal",
          piso: "Piso 2",
          capacidadMaxima: 25
        },
        participantes: 20,
        estado: "aprobada",
        fechaCreacion: "2025-06-01T09:00:00",
        enlaceVideoconferencia: "https://zoom.us/j/232.14363627254",
        descripcion: "Taller intensivo sobre técnicas de escritura académica para estudiantes de posgrado. Se cubrirán temas como estructura de papers, citación académica y revisión por pares.",
        equipoRequerido: ["Proyector", "Audio", "Micrófono inalámbrico"],
        serviciosExtra: ["Café", "Material impreso", "Certificado de participación"]
      },
      {
        id: "2",
        numeroReservacion: "0213",
        titulo: "Seminario de Biotecnología Marina",
        fechaInicio: "2025-06-05T14:00:00",
        fechaFin: "2025-06-05T16:00:00",
        color: "bg-green-500",
        salaId: "sala2",
        nombreSala: "Auditorio Principal",
        solicitante: {
          nombre: "Dra. Ana Rodríguez",
          email: "ana.rodriguez@cicese.mx",
          departamento: "Biología Marina"
        },
        ubicacion: {
          sala: "Auditorio Principal",
          edificio: "Centro de Investigación",
          piso: "Planta Baja",
          capacidadMaxima: 100
        },
        participantes: 85,
        estado: "aprobada",
        fechaCreacion: "2025-05-28T14:30:00",
        enlaceVideoconferencia: "https://teams.microsoft.com/l/meetup-join/19%3a...",
        descripcion: "Presentación de los últimos avances en biotecnología marina aplicada a la acuicultura sustentable. Incluye casos de estudio de proyectos internacionales.",
        equipoRequerido: ["Proyector 4K", "Sistema de audio completo", "Cámara para streaming"],
        serviciosExtra: ["Transmisión en vivo", "Traducción simultánea", "Refrigerio"]
      },
      {
        id: "3",
        numeroReservacion: "0214",
        titulo: "Workshop de Inteligencia Artificial",
        fechaInicio: "2025-06-12T09:00:00",
        fechaFin: "2025-06-12T17:00:00",
        color: "bg-purple-500",
        salaId: "sala3",
        nombreSala: "Lab de Computación",
        solicitante: {
          nombre: "Dr. Carlos Méndez",
          email: "carlos.mendez@cicese.mx",
          departamento: "Ciencias de la Computación"
        },
        ubicacion: {
          sala: "Lab de Computación",
          edificio: "Edificio de Tecnología",
          piso: "Piso 3",
          capacidadMaxima: 30
        },
        participantes: 28,
        estado: "pendiente",
        fechaCreacion: "2025-06-02T11:15:00",
        enlaceVideoconferencia: "https://meet.google.com/abc-defg-hij",
        descripcion: "Workshop práctico de día completo sobre machine learning y deep learning aplicado a la investigación oceanográfica. Incluye sesiones hands-on con datasets reales.",
        equipoRequerido: ["Computadoras con GPU", "Red de alta velocidad", "Pantallas múltiples"],
        serviciosExtra: ["Almuerzo incluido", "Material digital", "Acceso a cluster de cómputo"]
      },
      {
        id: "4",
        numeroReservacion: "0215",
        titulo: "Conferencia Cambio Climático",
        fechaInicio: "2025-06-20T13:00:00",
        fechaFin: "2025-06-20T15:00:00",
        color: "bg-yellow-500",
        salaId: "sala4",
        nombreSala: "Sala Multimedia",
        solicitante: {
          nombre: "Dra. Patricia Hernández",
          email: "patricia.hernandez@cicese.mx",
          departamento: "Geofísica"
        },
        ubicacion: {
          sala: "Sala Multimedia",
          edificio: "Edificio Principal",
          piso: "Piso 1",
          capacidadMaxima: 50
        },
        participantes: 45,
        estado: "aprobada",
        fechaCreacion: "2025-06-05T16:00:00",
        descripcion: "Presentación de resultados del proyecto CONACYT sobre impactos del cambio climático en ecosistemas costeros del Pacífico mexicano.",
        equipoRequerido: ["Proyector", "Sistema de audio", "Equipo de videoconferencia"],
        serviciosExtra: ["Grabación", "Transmisión remota"]
      },
      {
        id: "5",
        numeroReservacion: "0216",
        titulo: "Defensa de Tesis Doctoral",
        fechaInicio: "2025-06-28T16:00:00",
        fechaFin: "2025-06-28T18:00:00",
        color: "bg-red-500",
        salaId: "sala5",
        nombreSala: "Sala de Juntas",
        solicitante: {
          nombre: "Ing. Roberto Silva",
          email: "roberto.silva@estudiante.cicese.mx",
          departamento: "Oceanografía Física"
        },
        ubicacion: {
          sala: "Sala de Juntas",
          edificio: "Edificio de Posgrado",
          piso: "Piso 2",
          capacidadMaxima: 15
        },
        participantes: 12,
        estado: "aprobada",
        fechaCreacion: "2025-06-10T09:30:00",
        enlaceVideoconferencia: "https://zoom.us/j/123456789",
        descripcion: "Defensa de tesis doctoral: 'Modelado numérico de corrientes oceánicas en el Golfo de California: Impactos en la distribución de nutrientes'",
        equipoRequerido: ["Proyector", "Pizarrón", "Sistema de videoconferencia"],
        serviciosExtra: ["Grabación oficial", "Conexión para sinodales remotos"]
      }
    ];

    setConferencias(conferenciasSimuladas);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Calendar conferencias={conferencias} />
    </div>
  );
}