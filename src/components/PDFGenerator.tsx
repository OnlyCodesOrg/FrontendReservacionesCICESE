"use client";

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Configurar las fuentes
(pdfMake as any).vfs = (pdfFonts as any).vfs;

// Interfaces
interface HistorialEvento {
  id: number;
  numeroReservacion: string;
  nombreEvento: string;
  tipoEvento: string;
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
  numeroAsistentesReal: number | null;
  responsableSala: {
    id: number;
    nombre: string;
    email: string;
  };
  fallasRegistradas: string | null;
  equiposUsados: {
    nombre: string;
    cantidad: number;
    estado: string;
  }[];
}

interface SalaInfo {
  id: number;
  nombreSala: string;
  ubicacion: string;
  capacidadMax?: number;
  disponible?: boolean;
}

interface PDFGeneratorProps {
  sala: SalaInfo | null;
  historial: HistorialEvento[];
}

class PDFGenerator {
  private sala: SalaInfo | null;
  private historial: HistorialEvento[];

  constructor(sala: SalaInfo | null, historial: HistorialEvento[]) {
    this.sala = sala;
    this.historial = historial;
  }

  // Función auxiliar para convertir hora a minutos
  private convertirHoraAMinutos(hora: any): number {
    try {
      if (hora instanceof Date) {
        return hora.getHours() * 60 + hora.getMinutes();
      }
      
      if (typeof hora === 'string') {
        if (hora.includes('T')) {
          const date = new Date(hora);
          return date.getHours() * 60 + date.getMinutes();
        }
        
        if (hora.includes(':')) {
          const [horas, minutos] = hora.split(':').map(Number);
          return horas * 60 + (minutos || 0);
        }
      }
      
      throw new Error('Formato de hora no reconocido');
    } catch (error) {
      console.warn('Error convirtiendo hora a minutos:', hora, error);
      return 0;
    }
  }

  // Calcular estadísticas
  private calcularEstadisticas() {
    const totalEventos = this.historial.length;

    const horasDeUso = this.historial.reduce((total, evento) => {
      const minutosInicio = this.convertirHoraAMinutos(evento.horaInicio);
      const minutosFin = this.convertirHoraAMinutos(evento.horaFin);
      
      const diferencia = (minutosFin - minutosInicio) / 60;
      return total + Math.max(0, diferencia);
    }, 0);

    const fallasRegistradas = this.historial.filter(
      (evento) => evento.fallasRegistradas
    ).length;

    const totalAsistentes = this.historial.reduce((total, evento) => {
      return total + (evento.numeroAsistentesReal || 0);
    }, 0);

    return {
      totalEventos,
      horasDeUso: Math.round(horasDeUso * 10) / 10,
      fallasRegistradas,
      totalAsistentes,
    };
  }

  // Formatear fecha
  private formatearFecha(fechaISO: string): string {
    return new Date(fechaISO).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Formatear hora para el PDF
  private formatearHora(horaISO: string): string {
    try {
      // Si la hora viene como string de tiempo (HH:MM:SS o HH:MM)
      if (typeof horaISO === 'string' && horaISO.includes(':')) {
        const [horas, minutos] = horaISO.split(':');
        const horasNum = parseInt(horas);
        const minutosNum = parseInt(minutos);
        
        // Validar que sean números válidos
        if (!isNaN(horasNum) && !isNaN(minutosNum) && horasNum >= 0 && horasNum <= 23 && minutosNum >= 0 && minutosNum <= 59) {
          return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
        }
      }
      
      // Si viene como timestamp completo, extraer solo la hora
      const fecha = new Date(horaISO);
      if (!isNaN(fecha.getTime())) {
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutos}`;
      }
      
      throw new Error('Formato de hora no válido');
    } catch (error) {
      console.warn("Error formateando hora en PDF:", horaISO, error);
      
      // Fallback: intentar extraer solo números y :
      if (typeof horaISO === 'string') {
        // Buscar patron HH:MM en cualquier parte del string
        const match = horaISO.match(/(\d{1,2}):(\d{1,2})/);
        if (match) {
          const horas = match[1].padStart(2, '0');
          const minutos = match[2].padStart(2, '0');
          return `${horas}:${minutos}`;
        }
      }
      
      // Si todo falla, devolver un formato por defecto
      return '00:00';
    }
  }

  // Generar y descargar PDF
  public generarReporte(): void {
    if (this.historial.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const estadisticas = this.calcularEstadisticas();
    const fechaActual = new Date().toLocaleDateString('es-ES');

    // Preparar datos para la tabla de eventos
    const datosTablaEventos = this.historial.map((evento, index) => [
      (index + 1).toString(),
      evento.nombreEvento,
      evento.tipoEvento,
      this.formatearFecha(evento.fechaEvento),
      `${this.formatearHora(evento.horaInicio)} - ${this.formatearHora(evento.horaFin)}`,
      evento.numeroAsistentesReal?.toString() || '0',
      evento.responsableSala.nombre,
      evento.fallasRegistradas ? 'Sí' : 'No'
    ]);

    // Definir el documento PDF
    const documentDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 60],
      
      header: {
        text: 'CICESE - Centro de Investigación Científica y de Educación Superior de Ensenada',
        style: 'header',
        alignment: 'center',
        margin: [0, 20, 0, 0]
      },

      footer: function(currentPage: number, pageCount: number) {
        return {
          text: `Página ${currentPage} de ${pageCount} - Generado el ${fechaActual}`,
          alignment: 'center',
          style: 'footer'
        };
      },

      content: [
        // Título principal
        {
          text: 'REPORTE DE ASISTENCIA POR SALA',
          style: 'title',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },

        // Información de la sala
        {
          table: {
            widths: ['25%', '75%'],
            body: [
              [
                { text: 'Sala:', style: 'tableHeader' },
                { text: this.sala?.nombreSala || 'N/A', style: 'tableContent' }
              ],
              [
                { text: 'Ubicación:', style: 'tableHeader' },
                { text: this.sala?.ubicacion || 'N/A', style: 'tableContent' }
              ],
              [
                { text: 'Período del reporte:', style: 'tableHeader' },
                { text: `Historial completo hasta ${fechaActual}`, style: 'tableContent' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },

        // Resumen estadístico
        {
          text: 'RESUMEN ESTADÍSTICO',
          style: 'subtitle',
          margin: [0, 10, 0, 10]
        },

        {
          columns: [
            {
              width: '25%',
              table: {
                body: [
                  [
                    { text: 'Total de Eventos', style: 'statLabel' },
                    { text: estadisticas.totalEventos.toString(), style: 'statValue' }
                  ]
                ]
              },
              layout: 'noBorders'
            },
            {
              width: '25%',
              table: {
                body: [
                  [
                    { text: 'Total Asistentes', style: 'statLabel' },
                    { text: estadisticas.totalAsistentes.toString(), style: 'statValue' }
                  ]
                ]
              },
              layout: 'noBorders'
            },
            {
              width: '25%',
              table: {
                body: [
                  [
                    { text: 'Horas de Uso', style: 'statLabel' },
                    { text: `${estadisticas.horasDeUso}h`, style: 'statValue' }
                  ]
                ]
              },
              layout: 'noBorders'
            },
            {
              width: '25%',
              table: {
                body: [
                  [
                    { text: 'Eventos con Fallas', style: 'statLabel' },
                    { text: estadisticas.fallasRegistradas.toString(), style: 'statValue' }
                  ]
                ]
              },
              layout: 'noBorders'
            }
          ],
          margin: [0, 0, 0, 20]
        },

        // Tabla de eventos
        {
          text: 'DETALLE DE EVENTOS Y ASISTENCIA',
          style: 'subtitle',
          margin: [0, 20, 0, 10]
        },

        {
          table: {
            headerRows: 1,
            widths: ['5%', '20%', '12%', '12%', '15%', '8%', '18%', '10%'],
            body: [
              // Encabezados
              [
                { text: '#', style: 'tableHeader' },
                { text: 'Evento', style: 'tableHeader' },
                { text: 'Tipo', style: 'tableHeader' },
                { text: 'Fecha', style: 'tableHeader' },
                { text: 'Horario', style: 'tableHeader' },
                { text: 'Asistentes', style: 'tableHeader' },
                { text: 'Organizador', style: 'tableHeader' },
                { text: 'Fallas', style: 'tableHeader' }
              ],
              // Datos
              ...datosTablaEventos.map(row => 
                row.map(cell => ({ text: cell, style: 'tableContent' }))
              )
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return (rowIndex === 0) ? '#003E6A' : (rowIndex % 2 === 0 ? '#F8FAFC' : null);
            }
          }
        },

        // Promedio de asistencia
        estadisticas.totalEventos > 0 ? {
          text: [
            'Promedio de asistentes por evento: ',
            { 
              text: Math.round(estadisticas.totalAsistentes / estadisticas.totalEventos).toString(),
              style: 'highlight'
            },
            ' personas'
          ],
          style: 'summary',
          margin: [0, 20, 0, 10]
        } : {},

        // Observaciones finales
        {
          text: 'OBSERVACIONES',
          style: 'subtitle',
          margin: [0, 20, 0, 10]
        },

        {
          ul: [
            `Este reporte incluye ${estadisticas.totalEventos} eventos registrados en la sala ${this.sala?.nombreSala || 'N/A'}.`,
            `Se registraron un total de ${estadisticas.totalAsistentes} asistentes en todos los eventos.`,
            `La sala tuvo ${estadisticas.horasDeUso} horas de uso registradas.`,
            estadisticas.fallasRegistradas > 0 
              ? `Se reportaron fallas en ${estadisticas.fallasRegistradas} eventos, se recomienda revisión de equipamiento.`
              : 'No se reportaron fallas en los eventos registrados.',
            'Los datos mostrados corresponden al historial completo disponible en el sistema.'
          ],
          style: 'observations'
        }
      ],

      styles: {
        header: {
          fontSize: 10,
          color: '#003E6A',
          bold: true
        },
        footer: {
          fontSize: 8,
          color: '#6B7280'
        },
        title: {
          fontSize: 18,
          bold: true,
          color: '#1F2937'
        },
        subtitle: {
          fontSize: 14,
          bold: true,
          color: '#374151'
        },
        tableHeader: {
          fontSize: 9,
          bold: true,
          color: 'white',
          fillColor: '#003E6A'
        },
        tableContent: {
          fontSize: 8,
          color: '#374151'
        },
        statLabel: {
          fontSize: 10,
          color: '#6B7280'
        },
        statValue: {
          fontSize: 16,
          bold: true,
          color: '#1F2937'
        },
        highlight: {
          bold: true,
          color: '#003E6A'
        },
        summary: {
          fontSize: 12,
          color: '#374151'
        },
        observations: {
          fontSize: 10,
          color: '#4B5563'
        }
      }
    };

    // Generar y descargar el PDF
    const fileName = `Reporte_Asistencia_${this.sala?.nombreSala || 'Sala'}_${fechaActual.replace(/\//g, '-')}.pdf`;
    pdfMake.createPdf(documentDefinition).download(fileName);
    
    console.log(`📄 PDF generado: ${fileName}`);
  }
}

// Hook personalizado para usar el generador de PDF
export const usePDFGenerator = (sala: SalaInfo | null, historial: HistorialEvento[]) => {
  const generarReporte = () => {
    const generator = new PDFGenerator(sala, historial);
    generator.generarReporte();
  };

  return { generarReporte };
};

export default PDFGenerator;
export type { PDFGeneratorProps, HistorialEvento, SalaInfo };