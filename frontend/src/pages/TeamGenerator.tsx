import { useState } from 'react';
import { AlertCircle, Loader2, Settings2, Sparkles, Scale, UserPlus, Calendar, CheckCircle2 } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { useAvailability } from '../hooks/useAvailability';
import { useMatches } from '../hooks/useMatches';
import { balancearEquipos, calcularPuntajePromedio } from '../services/teamBalancer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import TeamDisplay from '../components/TeamDisplay';
import type { EquipoBalanceado, Jugador } from '../../../shared/types';
import { cn } from '../lib/utils';

interface JugadorConPuntaje extends Jugador {
  puntajePromedio: number;
}

export default function TeamGenerator() {
  const { jugadores, loading: loadingJugadores, addJugador } = usePlayers();
  const { getJugadoresDisponibles, loading: loadingDisponibilidad, updateDisponibilidad } = useAvailability();
  const { partidos, getParticipaciones } = useMatches();
  const [equipos, setEquipos] = useState<EquipoBalanceado | null>(null);
  const [jugadoresPorEquipo, setJugadoresPorEquipo] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for the new player modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);

  const handleAddJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;

    try {
      const nuevoJugador = await addJugador(nombreNuevo.trim(), selectedMatches);
      // Automatically set the new player as available
      await updateDisponibilidad(nuevoJugador.id, true);
      
      setNombreNuevo('');
      setSelectedMatches([]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding player in generator:', err);
    }
  };

  const toggleMatchSelection = (matchId: string) => {
    setSelectedMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId) 
        : [...prev, matchId]
    );
  };

  const generarEquipos = async () => {
    try {
      setLoading(true);
      setError(null);

      const jugadoresDisponiblesIds = getJugadoresDisponibles();
      const jugadoresDisponibles = jugadores.filter((j) =>
        jugadoresDisponiblesIds.includes(j.id)
      );

      if (jugadoresDisponibles.length < jugadoresPorEquipo * 2) {
        setError(
          `Se necesitan al menos ${jugadoresPorEquipo * 2} jugadores disponibles, pero solo hay ${jugadoresDisponibles.length}`
        );
        return;
      }

      const todasParticipaciones = await Promise.all(
        partidos.map(async (p) => {
          const participaciones = await getParticipaciones(p.id);
          return participaciones;
        })
      );

      const participacionesPorJugador = new Map<string, Array<{ puntaje: number }>>();
      todasParticipaciones.flat().forEach((p) => {
        const existing = participacionesPorJugador.get(p.jugadorId) || [];
        existing.push({ puntaje: p.puntaje });
        participacionesPorJugador.set(p.jugadorId, existing);
      });

      const jugadoresConPuntaje: JugadorConPuntaje[] = jugadoresDisponibles.map((j) => {
        const participaciones = participacionesPorJugador.get(j.id) || [];
        const puntajePromedio = calcularPuntajePromedio(j, participaciones);
        return {
          ...j,
          puntajePromedio,
        };
      });

      const equiposBalanceados = balancearEquipos(jugadoresConPuntaje, jugadoresPorEquipo);
      setEquipos(equiposBalanceados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar equipos');
    } finally {
      setLoading(false);
    }
  };

  if (loadingJugadores || loadingDisponibilidad) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium text-lg">Analizando estadísticas…</p>
      </div>
    );
  }

  const jugadoresDisponibles = getJugadoresDisponibles().length;
  const jugadoresNecesarios = jugadoresPorEquipo * 2;
  const puedeGenerar = jugadoresDisponibles >= jugadoresNecesarios;

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight tracking-tighter">Generador</h1>
          <p className="text-muted-foreground text-lg">
            Algoritmo de balanceo basado en rendimiento histórico.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="rounded-2xl px-6 border-primary/20 hover:bg-primary/5">
              <UserPlus className="w-5 h-5 mr-2 text-primary" />
              Rápido: Nuevo Jugador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Añadir y Convocar</DialogTitle>
              <DialogDescription>
                Crea un jugador y márcalo como disponible automáticamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddJugador} className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Nombre Completo</label>
                <Input
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  placeholder="Ej: Kylian Mbappé"
                  className="h-12 rounded-xl"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  Partidos Previos
                  <Badge variant="outline" className="font-mono">{selectedMatches.length}</Badge>
                </label>
                <div className="max-h-[180px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {partidos.length === 0 ? (
                    <p className="text-sm text-center py-6 text-muted-foreground italic bg-muted/30 rounded-xl">
                      No hay partidos registrados.
                    </p>
                  ) : (
                    partidos.map(match => (
                      <div 
                        key={match.id}
                        onClick={() => toggleMatchSelection(match.id)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer",
                          selectedMatches.includes(match.id) 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-muted hover:border-primary/20 bg-card"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className={cn("w-4 h-4", selectedMatches.includes(match.id) ? "text-primary" : "text-muted-foreground")} />
                          <span className="text-sm font-medium">
                            {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(match.fecha))}
                          </span>
                        </div>
                        {selectedMatches.includes(match.id) && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20">
                  Añadir y Activar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-[2rem] border-2 border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 p-6 border-b border-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <Settings2 className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl font-bold">Ajustes</CardTitle>
              </div>
              <CardDescription>Define las reglas del encuentro.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Jugadores por lado
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="3"
                    max="11"
                    value={jugadoresPorEquipo}
                    onChange={(e) => setJugadoresPorEquipo(parseInt(e.target.value) || 5)}
                    className="h-14 rounded-2xl border-muted bg-muted/20 text-2xl font-black text-center focus:bg-background transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-muted">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-muted-foreground">Disponibles</span>
                  <Badge variant="secondary" className={puedeGenerar ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}>
                    {jugadoresDisponibles}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-muted-foreground">Necesarios</span>
                  <Badge variant="outline" className="border-muted font-bold">
                    {jugadoresNecesarios}
                  </Badge>
                </div>
              </div>

              {!puedeGenerar && (
                <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-bold">
                    Faltan {jugadoresNecesarios - jugadoresDisponibles} jugadores para generar los equipos.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={generarEquipos}
                disabled={loading || !puedeGenerar}
                size="lg"
                className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Balancear
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5 animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="lg:col-span-2">
          {equipos ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TeamDisplay equipos={equipos as any} />
            </div>
          ) : (
            <Card className="h-full border-dashed border-2 bg-muted/30 rounded-[2rem]">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center h-full">
                <div className="h-20 w-20 rounded-[2rem] bg-muted flex items-center justify-center mb-6">
                  <Scale className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-muted-foreground">Esperando Balanceo</h3>
                <p className="text-muted-foreground/60 max-w-[300px]">
                  Configura el número de jugadores y presiona el botón para generar equipos equilibrados.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
