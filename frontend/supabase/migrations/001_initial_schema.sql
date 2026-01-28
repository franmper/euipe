-- Tabla de jugadores
CREATE TABLE IF NOT EXISTS jugadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de partidos
CREATE TABLE IF NOT EXISTS partidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  jugadores_por_equipo INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de participaciones (jugador en partido)
CREATE TABLE IF NOT EXISTS participaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jugador_id UUID NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  partido_id UUID NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  puntaje INTEGER NOT NULL CHECK (puntaje >= 1 AND puntaje <= 10),
  equipo TEXT NOT NULL CHECK (equipo IN ('A', 'B')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(jugador_id, partido_id)
);

-- Tabla de disponibilidad (para próximo partido)
CREATE TABLE IF NOT EXISTS disponibilidad (
  jugador_id UUID PRIMARY KEY REFERENCES jugadores(id) ON DELETE CASCADE,
  disponible BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_participaciones_jugador_id ON participaciones(jugador_id);
CREATE INDEX IF NOT EXISTS idx_participaciones_partido_id ON participaciones(partido_id);
CREATE INDEX IF NOT EXISTS idx_partidos_fecha ON partidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_jugadores_activo ON jugadores(activo);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_jugadores_updated_at
  BEFORE UPDATE ON jugadores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partidos_updated_at
  BEFORE UPDATE ON partidos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participaciones_updated_at
  BEFORE UPDATE ON participaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disponibilidad_updated_at
  BEFORE UPDATE ON disponibilidad
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Permitir todo para MVP (puede ajustarse después)
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE participaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Permitir todas las operaciones (público para MVP)
CREATE POLICY "Allow all operations on jugadores" ON jugadores
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on partidos" ON partidos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on participaciones" ON participaciones
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on disponibilidad" ON disponibilidad
  FOR ALL USING (true) WITH CHECK (true);

-- Vista para obtener estadísticas de jugadores
CREATE OR REPLACE VIEW estadisticas_jugadores AS
SELECT 
  j.id,
  j.nombre,
  j.activo,
  COUNT(DISTINCT p.partido_id) as partidos_jugados,
  COALESCE(AVG(p.puntaje), 0) as puntaje_promedio,
  COALESCE(MAX(p.puntaje), 0) as mejor_puntaje,
  COALESCE(MIN(p.puntaje), 0) as peor_puntaje,
  COALESCE(d.disponible, false) as disponible
FROM jugadores j
LEFT JOIN participaciones p ON j.id = p.jugador_id
LEFT JOIN disponibilidad d ON j.id = d.jugador_id
WHERE j.activo = true
GROUP BY j.id, j.nombre, j.activo, d.disponible;
