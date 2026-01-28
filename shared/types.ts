// Tipos compartidos para la aplicación

export interface Jugador {
  id: string;
  nombre: string;
  fechaCreacion: string;
  activo: boolean;
}

export interface Partido {
  id: string;
  fecha: string;
  jugadoresPorEquipo: number;
  equipoA: string[];
  equipoB: string[];
}

export interface Participacion {
  id: string;
  jugadorId: string;
  partidoId: string;
  puntaje: number; // 1-10
  equipo: 'A' | 'B';
}

export interface Disponibilidad {
  jugadorId: string;
  disponible: boolean;
}

export interface EquipoBalanceado {
  equipoA: {
    jugadores: Jugador[];
    puntajeTotal: number;
  };
  equipoB: {
    jugadores: Jugador[];
    puntajeTotal: number;
  };
  diferencia: number;
}
