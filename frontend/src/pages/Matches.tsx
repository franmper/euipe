import { useState } from 'react';
import {
  X,
  Plus,
  AlertCircle,
  Calendar,
  Users,
  UserPlus,
  Trophy,
  Star,
  Trash2,
  CheckCircle2,
  Save,
  Loader2,
  ChevronRight,
  History,
  LayoutGrid
} from 'lucide-react';
import { useMatches } from '../hooks/useMatches';
import { usePlayers } from '../hooks/usePlayers';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

export default function Matches() {
  const { partidos, loading, error, createPartido } = useMatches();
  const { jugadores } = usePlayers();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [jugadoresPorEquipo, setJugadoresPorEquipo] = useState(5);
  const [participaciones, setParticipaciones] = useState<
    Array<{ jugadorId: string; puntaje: number; equipo: 'A' | 'B' }>
  >([]);

  const handleCreatePartido = async (e: React.FormEvent) => {
    e.preventDefault();

    const equipoA: string[] = [];
    const equipoB: string[] = [];

    participaciones.forEach((p) => {
      if (p.equipo === 'A') {
        equipoA.push(p.jugadorId);
      } else {
        equipoB.push(p.jugadorId);
      }
    });

    try {
      await createPartido(fecha, jugadoresPorEquipo, equipoA, equipoB, participaciones);
      setShowCreateForm(false);
      setParticipaciones([]);
      setFecha(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error('Error al crear partido:', err);
    }
  };

  const addParticipacion = (jugadorId: string) => {
    if (participaciones.find((p) => p.jugadorId === jugadorId)) return;

    const equipo: 'A' | 'B' = participaciones.length % 2 === 0 ? 'A' : 'B';
    setParticipaciones([
      ...participaciones,
      { jugadorId, puntaje: 5, equipo },
    ]);
  };

  const updateParticipacion = (jugadorId: string, updates: { puntaje?: number; equipo?: 'A' | 'B' }) => {
    setParticipaciones(
      participaciones.map((p) =>
        p.jugadorId === jugadorId ? { ...p, ...updates } : p
      )
    );
  };

  const removeParticipacion = (jugadorId: string) => {
    setParticipaciones(participaciones.filter((p) => p.jugadorId !== jugadorId));
  };

  const jugadoresNoAgregados = jugadores.filter(
    (j) => !participaciones.find((p) => p.jugadorId === j.id)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium text-lg">Cargando historial…</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight tracking-tighter">Partidos</h1>
          <p className="text-muted-foreground text-lg">
            Registra los resultados y califica el rendimiento de tu equipo.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant={showCreateForm ? "outline" : "default"}
          size="lg"
          className="rounded-2xl px-6 shadow-lg shadow-primary/20"
        >
          {showCreateForm ? (
            <>
              <X className="w-5 h-5 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Partido
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {showCreateForm && (
        <Card className="border-2 border-primary/10 shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-300">
          <CardHeader className="bg-primary/5 p-8 border-b border-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold">Nuevo Encuentro</CardTitle>
            </div>
            <CardDescription className="text-base ml-13">
              Configura los detalles del partido y califica a los participantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <form onSubmit={handleCreatePartido} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fecha del partido
                  </label>
                  <Input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    className="h-14 rounded-2xl border-muted bg-muted/20 text-lg px-6 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Jugadores por equipo
                  </label>
                  <Input
                    type="number"
                    min="3"
                    max="11"
                    value={jugadoresPorEquipo}
                    onChange={(e) => setJugadoresPorEquipo(parseInt(e.target.value) || 5)}
                    required
                    className="h-14 rounded-2xl border-muted bg-muted/20 text-lg px-6 focus:bg-background transition-all"
                  />
                </div>
              </div>

              {jugadoresNoAgregados.length > 0 && (
                <div className="space-y-4">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Convocatoria
                  </label>
                  <div className="flex flex-wrap gap-2 p-6 rounded-[1.5rem] bg-muted/20 border-2 border-dashed border-muted">
                    {jugadoresNoAgregados.map((jugador) => (
                      <Button
                        key={jugador.id}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => addParticipacion(jugador.id)}
                        className="rounded-xl h-10 px-4 bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {jugador.nombre}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {participaciones.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold">Planilla de Juego ({participaciones.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {participaciones.map((p) => {
                      const jugador = jugadores.find((j) => j.id === p.jugadorId);
                      if (!jugador) return null;

                      return (
                        <Card key={p.jugadorId} className="border-none bg-muted/30 hover:bg-muted/50 transition-colors rounded-2xl overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1 w-full">
                                <div className={cn(
                                  "h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm",
                                  p.equipo === 'A' ? "bg-blue-600" : "bg-red-600"
                                )}>
                                  {jugador.nombre.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-lg flex-1 truncate">{jugador.nombre}</span>
                                
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={p.equipo}
                                    onChange={(e) =>
                                      updateParticipacion(p.jugadorId, {
                                        equipo: e.target.value as 'A' | 'B',
                                      })
                                    }
                                    className={cn(
                                      "w-32 h-10 rounded-xl font-bold border-none shadow-sm",
                                      p.equipo === 'A'
                                        ? "bg-blue-500/10 text-blue-700"
                                        : "bg-red-500/10 text-red-700"
                                    )}
                                  >
                                    <option value="A">Equipo A</option>
                                    <option value="B">Equipo B</option>
                                  </Select>
                                  
                                  <div className="flex items-center gap-3 bg-background/50 px-3 py-1 rounded-xl border border-muted shadow-sm">
                                    <Input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={p.puntaje}
                                      onChange={(e) =>
                                        updateParticipacion(p.jugadorId, {
                                          puntaje: parseInt(e.target.value) || 5,
                                        })
                                      }
                                      className="w-12 h-8 p-0 text-center border-none bg-transparent font-black text-lg focus-visible:ring-0"
                                    />
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                  </div>
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeParticipacion(p.jugadorId)}
                                className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-muted">
                <div>
                  {participaciones.length < jugadoresPorEquipo * 2 ? (
                    <Badge variant="outline" className="h-10 px-4 rounded-xl text-orange-600 border-orange-200 bg-orange-50/50 text-sm font-bold">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Faltan {jugadoresPorEquipo * 2 - participaciones.length} jugadores
                    </Badge>
                  ) : (
                    <Badge variant="default" className="h-10 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-sm font-bold shadow-lg shadow-green-500/20">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Plantel completo
                    </Badge>
                  )}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={participaciones.length < jugadoresPorEquipo * 2}
                  className="w-full sm:w-auto h-14 px-12 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Finalizar Registro
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <History className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-widest">Historial de Encuentros</h2>
        </div>
        
        {partidos.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Trophy className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Aún no hay partidos</h3>
              <p className="text-muted-foreground/60 max-w-[280px] text-sm">
                Los partidos que registres aparecerán aquí con sus estadísticas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {partidos.map((partido) => (
              <Card key={partido.id} className="group hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-[2rem] overflow-hidden border-muted/50">
                <CardHeader className="bg-muted/10 p-6 border-b border-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black">
                          {new Intl.DateTimeFormat('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }).format(new Date(partido.fecha))}
                        </CardTitle>
                        <CardDescription className="font-bold text-primary/60">
                          {partido.jugadoresPorEquipo} vs {partido.jugadoresPorEquipo} • Fútbol
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 w-fit">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Equipo A</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {partido.equipoA.map((jugadorId) => {
                          const jugador = jugadores.find((j) => j.id === jugadorId);
                          return (
                            <div key={jugadorId} className="text-sm font-medium bg-muted/30 rounded-xl px-4 py-2 border border-muted/50 truncate">
                              {jugador?.nombre || '---'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 w-fit">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-xs font-black text-red-700 uppercase tracking-widest">Equipo B</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {partido.equipoB.map((jugadorId) => {
                          const jugador = jugadores.find((j) => j.id === jugadorId);
                          return (
                            <div key={jugadorId} className="text-sm font-medium bg-muted/30 rounded-xl px-4 py-2 border border-muted/50 truncate">
                              {jugador?.nombre || '---'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
