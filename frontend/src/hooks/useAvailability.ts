import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAvailability() {
  const [disponibilidad, setDisponibilidad] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisponibilidad = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('disponibilidad')
        .select('*');

      if (fetchError) throw fetchError;

      const map = new Map<string, boolean>();
      (data || []).forEach((d) => {
        map.set(d.jugador_id, d.disponible);
      });

      setDisponibilidad(map);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisponibilidad();
  }, []);

  const updateDisponibilidad = async (jugadorId: string, disponible: boolean) => {
    try {
      const { error: upsertError } = await supabase
        .from('disponibilidad')
        .upsert({ jugador_id: jugadorId, disponible }, { onConflict: 'jugador_id' });

      if (upsertError) throw upsertError;

      setDisponibilidad(new Map(disponibilidad.set(jugadorId, disponible)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar disponibilidad';
      setError(errorMessage);
      throw err;
    }
  };

  const getJugadoresDisponibles = (): string[] => {
    return Array.from(disponibilidad.entries())
      .filter(([_, disponible]) => disponible)
      .map(([jugadorId]) => jugadorId);
  };

  return {
    disponibilidad,
    loading,
    error,
    updateDisponibilidad,
    getJugadoresDisponibles,
    refetch: fetchDisponibilidad,
  };
}
