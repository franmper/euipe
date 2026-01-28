import type { Jugador, EquipoBalanceado } from '../../../shared/types';

interface JugadorConPuntaje extends Jugador {
  puntajePromedio: number;
}

/**
 * Calcula el puntaje promedio de un jugador basado en sus participaciones
 */
export function calcularPuntajePromedio(
  jugador: Jugador,
  participaciones: Array<{ puntaje: number }>
): number {
  if (participaciones.length === 0) {
    return 5; // Puntaje neutral si no tiene historial
  }
  
  const suma = participaciones.reduce((acc, p) => acc + p.puntaje, 0);
  return suma / participaciones.length;
}

/**
 * Algoritmo de balanceo de equipos usando snake draft
 * Distribuye jugadores de forma equilibrada considerando puntajes
 */
export function balancearEquipos(
  jugadores: JugadorConPuntaje[],
  jugadoresPorEquipo: number
): EquipoBalanceado {
  // Validar que tenemos suficientes jugadores
  const totalJugadores = jugadores.length;
  const totalNecesario = jugadoresPorEquipo * 2;
  
  if (totalJugadores < totalNecesario) {
    throw new Error(
      `Se necesitan al menos ${totalNecesario} jugadores, pero solo hay ${totalJugadores} disponibles`
    );
  }

  // Ordenar jugadores por puntaje (mejor a peor)
  const jugadoresOrdenados = [...jugadores].sort(
    (a, b) => b.puntajePromedio - a.puntajePromedio
  );

  // Snake draft: alternar selección entre equipos
  const equipoA: JugadorConPuntaje[] = [];
  const equipoB: JugadorConPuntaje[] = [];

  for (let i = 0; i < jugadoresPorEquipo * 2; i++) {
    const jugador = jugadoresOrdenados[i];
    
    // Alternar: A, B, B, A, A, B, B, A... (snake pattern)
    const ronda = Math.floor(i / 2);
    const esPar = ronda % 2 === 0;
    
    if (i % 2 === 0) {
      // Primera selección de la ronda
      if (esPar) {
        equipoA.push(jugador);
      } else {
        equipoB.push(jugador);
      }
    } else {
      // Segunda selección de la ronda
      if (esPar) {
        equipoB.push(jugador);
      } else {
        equipoA.push(jugador);
      }
    }
  }

  // Calcular puntajes totales
  const puntajeTotalA = equipoA.reduce((sum, j) => sum + j.puntajePromedio, 0);
  const puntajeTotalB = equipoB.reduce((sum, j) => sum + j.puntajePromedio, 0);
  const diferencia = Math.abs(puntajeTotalA - puntajeTotalB);

  // Intentar mejorar el balance si la diferencia es grande
  const umbral = 2.0; // Diferencia máxima aceptable
  if (diferencia > umbral) {
    return optimizarBalance(equipoA, equipoB, diferencia, umbral);
  }

  return {
    equipoA: {
      jugadores: equipoA,
      puntajeTotal: puntajeTotalA,
    },
    equipoB: {
      jugadores: equipoB,
      puntajeTotal: puntajeTotalB,
    },
    diferencia,
  };
}

/**
 * Optimiza el balance intercambiando jugadores entre equipos
 */
function optimizarBalance(
  equipoA: JugadorConPuntaje[],
  equipoB: JugadorConPuntaje[],
  diferenciaInicial: number,
  umbral: number
): EquipoBalanceado {
  let mejorEquipoA = [...equipoA];
  let mejorEquipoB = [...equipoB];
  let mejorDiferencia = diferenciaInicial;

  // Intentar intercambios para mejorar el balance
  for (let i = 0; i < equipoA.length; i++) {
    for (let j = 0; j < equipoB.length; j++) {
      // Intercambiar jugadores
      const nuevoEquipoA = [...equipoA];
      const nuevoEquipoB = [...equipoB];
      [nuevoEquipoA[i], nuevoEquipoB[j]] = [nuevoEquipoB[j], nuevoEquipoA[i]];

      // Calcular nueva diferencia
      const nuevoPuntajeA = nuevoEquipoA.reduce(
        (sum, j) => sum + j.puntajePromedio,
        0
      );
      const nuevoPuntajeB = nuevoEquipoB.reduce(
        (sum, j) => sum + j.puntajePromedio,
        0
      );
      const nuevaDiferencia = Math.abs(nuevoPuntajeA - nuevoPuntajeB);

      // Si mejora, guardar esta configuración
      if (nuevaDiferencia < mejorDiferencia) {
        mejorEquipoA = nuevoEquipoA;
        mejorEquipoB = nuevoEquipoB;
        mejorDiferencia = nuevaDiferencia;

        // Si ya está dentro del umbral, podemos parar
        if (mejorDiferencia <= umbral) {
          break;
        }
      }
    }
    if (mejorDiferencia <= umbral) {
      break;
    }
  }

  const puntajeTotalA = mejorEquipoA.reduce(
    (sum, j) => sum + j.puntajePromedio,
    0
  );
  const puntajeTotalB = mejorEquipoB.reduce(
    (sum, j) => sum + j.puntajePromedio,
    0
  );

  return {
    equipoA: {
      jugadores: mejorEquipoA,
      puntajeTotal: puntajeTotalA,
    },
    equipoB: {
      jugadores: mejorEquipoB,
      puntajeTotal: puntajeTotalB,
    },
    diferencia: mejorDiferencia,
  };
}
