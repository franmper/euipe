import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de base de datos
export interface Database {
  public: {
    Tables: {
      jugadores: {
        Row: {
          id: string;
          nombre: string;
          fecha_creacion: string;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          fecha_creacion?: string;
          activo?: boolean;
        };
        Update: {
          id?: string;
          nombre?: string;
          activo?: boolean;
        };
      };
      partidos: {
        Row: {
          id: string;
          fecha: string;
          jugadores_por_equipo: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          fecha: string;
          jugadores_por_equipo?: number;
        };
        Update: {
          id?: string;
          fecha?: string;
          jugadores_por_equipo?: number;
        };
      };
      participaciones: {
        Row: {
          id: string;
          jugador_id: string;
          partido_id: string;
          puntaje: number;
          equipo: 'A' | 'B';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          jugador_id: string;
          partido_id: string;
          puntaje: number;
          equipo: 'A' | 'B';
        };
        Update: {
          id?: string;
          jugador_id?: string;
          partido_id?: string;
          puntaje?: number;
          equipo?: 'A' | 'B';
        };
      };
      disponibilidad: {
        Row: {
          jugador_id: string;
          disponible: boolean;
          updated_at: string;
        };
        Insert: {
          jugador_id: string;
          disponible?: boolean;
        };
        Update: {
          disponible?: boolean;
        };
      };
    };
  };
}
