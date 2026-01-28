import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Partido, Participacion } from '../../../shared/types';

export function useMatches() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartidos = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('partidos')
        .select('*')
        .order('fecha', { ascending: false });

      if (fetchError) throw fetchError;

      // Obtener participaciones para cada partido
      const partidosConEquipos = await Promise.all(
        (data || []).map(async (partido) => {
          const { data: participaciones } = await supabase
            .from('participaciones')
            .select('*')
            .eq('partido_id', partido.id);

          const equipoA: string[] = [];
          const equipoB: string[] = [];

          participaciones?.forEach((p) => {
            if (p.equipo === 'A') {
              equipoA.push(p.jugador_id);
            } else {
              equipoB.push(p.jugador_id);
            }
          });

          return {
            id: partido.id,
            fecha: partido.fecha,
            jugadoresPorEquipo: partido.jugadores_por_equipo,
            equipoA,
            equipoB,
          };
        })
      );

      setPartidos(partidosConEquipos);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar partidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartidos();
  }, []);

  const createPartido = async (
    fecha: string,
    jugadoresPorEquipo: number,
    equipoA: string[],
    equipoB: string[],
    participaciones: Array<{ jugadorId: string; puntaje: number; equipo: 'A' | 'B' }>
  ) => {
    try {
      // Crear partido
      const { data: partidoData, error: partidoError } = await supabase
        .from('partidos')
        .insert([{ fecha, jugadores_por_equipo: jugadoresPorEquipo }])
        .select()
        .single();

      if (partidoError) throw partidoError;

      // Crear participaciones
      const participacionesData = participaciones.map((p) => ({
        jugador_id: p.jugadorId,
        partido_id: partidoData.id,
        puntaje: p.puntaje,
        equipo: p.equipo,
      }));

      const { error: participacionesError } = await supabase
        .from('participaciones')
        .insert(participacionesData);

      if (participacionesError) throw participacionesError;

      const nuevoPartido: Partido = {
        id: partidoData.id,
        fecha: partidoData.fecha,
        jugadoresPorEquipo: partidoData.jugadores_por_equipo,
        equipoA,
        equipoB,
      };

      setPartidos([nuevoPartido, ...partidos]);
      return nuevoPartido;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear partido';
      setError(errorMessage);
      throw err;
    }
  };

  const getParticipaciones = async (partidoId: string): Promise<Participacion[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('participaciones')
        .select('*')
        .eq('partido_id', partidoId);

      if (fetchError) throw fetchError;

      return (data || []).map((p) => ({
        id: p.id,
        jugadorId: p.jugador_id,
        partidoId: p.partido_id,
        puntaje: p.puntaje,
        equipo: p.equipo,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar participaciones');
      return [];
    }
  };

  return {
    partidos,
    loading,
    error,
    createPartido,
    getParticipaciones,
    refetch: fetchPartidos,
  };
}
