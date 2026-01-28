import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Jugador, Participacion } from '../../../shared/types';

export function usePlayers() {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [participaciones, setParticipaciones] = useState<Participacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJugadores = async () => {
    try {
      setLoading(true);
      
      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('jugadores')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (playersError) throw playersError;

      // Fetch all participations to calculate stats
      const { data: participationsData, error: participationsError } = await supabase
        .from('participaciones')
        .select('*');

      if (participationsError) throw participationsError;

      const mappedPlayers: Jugador[] = (playersData || []).map((j) => ({
        id: j.id,
        nombre: j.nombre,
        fechaCreacion: j.fecha_creacion,
        activo: j.activo,
      }));

      const mappedParticipations: Participacion[] = (participationsData || []).map((p) => ({
        id: p.id,
        jugadorId: p.jugador_id,
        partidoId: p.partido_id,
        puntaje: p.puntaje,
        equipo: p.equipo,
      }));

      setJugadores(mappedPlayers);
      setParticipaciones(mappedParticipations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar jugadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJugadores();
  }, []);

  const addJugador = async (nombre: string, matchIds: string[] = []) => {
    try {
      const { data, error: insertError } = await supabase
        .from('jugadores')
        .insert([{ nombre }])
        .select()
        .single();

      if (insertError) throw insertError;

      // If there are matches to link, create participations
      if (matchIds.length > 0) {
        const participationsToInsert = matchIds.map(matchId => ({
          jugador_id: data.id,
          partido_id: matchId,
          puntaje: 5, // Default score
          equipo: 'A' // Default team
        }));

        const { error: partError } = await supabase
          .from('participaciones')
          .insert(participationsToInsert);
        
        if (partError) console.error('Error linking matches:', partError);
      }

      const nuevoJugador: Jugador = {
        id: data.id,
        nombre: data.nombre,
        fechaCreacion: data.fecha_creacion,
        activo: data.activo,
      };

      setJugadores([...jugadores, nuevoJugador]);
      // Refetch to get updated participations
      fetchJugadores();
      return nuevoJugador;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar jugador';
      setError(errorMessage);
      throw err;
    }
  };

  const getPlayerStats = (jugadorId: string) => {
    const playerParticipations = participaciones.filter(p => p.jugadorId === jugadorId);
    const matchesPlayed = playerParticipations.length;
    const avgPoints = matchesPlayed > 0 
      ? playerParticipations.reduce((acc, p) => acc + p.puntaje, 0) / matchesPlayed 
      : 0;
    
    return {
      matchesPlayed,
      avgPoints: Number(avgPoints.toFixed(1))
    };
  };

  return {
    jugadores,
    participaciones,
    loading,
    error,
    addJugador,
    updateJugador: async (id: string, updates: Partial<Jugador>) => {
      try {
        const updateData: any = {};
        if (updates.nombre !== undefined) updateData.nombre = updates.nombre;
        if (updates.activo !== undefined) updateData.activo = updates.activo;

        const { error: updateError } = await supabase
          .from('jugadores')
          .update(updateData)
          .eq('id', id);

        if (updateError) throw updateError;

        setJugadores(
          jugadores.map((j) => (j.id === id ? { ...j, ...updates } : j))
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar jugador';
        setError(errorMessage);
        throw err;
      }
    },
    deleteJugador: async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('jugadores')
          .update({ activo: false })
          .eq('id', id);

        if (deleteError) throw deleteError;

        setJugadores(jugadores.filter((j) => j.id !== id));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar jugador';
        setError(errorMessage);
        throw err;
      }
    },
    getPlayerStats,
    refetch: fetchJugadores,
  };
}
