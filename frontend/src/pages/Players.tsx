import { useState } from 'react';
import { AlertCircle, Loader2, UserPlus, Search, CheckCircle2, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePlayers } from '../hooks/usePlayers';
import { useAvailability } from '../hooks/useAvailability';
import { useMatches } from '../hooks/useMatches';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import PlayerList from '../components/PlayerList';

export default function Players() {
  const { jugadores, loading, error, addJugador, deleteJugador, getPlayerStats } = usePlayers();
  const { disponibilidad, updateDisponibilidad } = useAvailability();
  const { partidos } = useMatches();
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchSearchTerm] = useState('');

  const handleAddJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;

    try {
      await addJugador(nombreNuevo.trim(), selectedMatches);
      setNombreNuevo('');
      setSelectedMatches([]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error al agregar jugador:', err);
    }
  };

  const toggleMatchSelection = (matchId: string) => {
    setSelectedMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId) 
        : [...prev, matchId]
    );
  };

  const handleToggleDisponibilidad = async (jugadorId: string) => {
    const actual = disponibilidad.get(jugadorId) || false;
    await updateDisponibilidad(jugadorId, !actual);
  };

  const filteredJugadores = jugadores.filter(j => 
    j.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Cargando plantel…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Jugadores</h1>
          <p className="text-muted-foreground">
            Gestiona el equipo y su disponibilidad.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-2xl px-6 shadow-lg shadow-primary/20">
              <UserPlus className="w-5 h-5 mr-2" />
              Nuevo Jugador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Registrar Jugador</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo integrante y selecciona sus partidos previos si aplica.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddJugador} className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Nombre Completo</label>
                <Input
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  placeholder="Ej: Lionel Messi"
                  className="h-12 rounded-xl"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  Partidos Jugados
                  <Badge variant="outline" className="font-mono">{selectedMatches.length}</Badge>
                </label>
                <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {partidos.length === 0 ? (
                    <p className="text-sm text-center py-8 text-muted-foreground italic bg-muted/30 rounded-xl">
                      No hay partidos registrados aún.
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
                  Guardar Jugador
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar jugador..."
            value={searchTerm}
            onChange={(e) => setSearchSearchTerm(e.target.value)}
            className="pl-12 h-12 rounded-2xl bg-card border-muted/50 shadow-sm"
          />
        </div>

        <PlayerList
          jugadores={filteredJugadores}
          disponibilidad={disponibilidad}
          onToggleDisponibilidad={handleToggleDisponibilidad}
          onDelete={deleteJugador}
          getPlayerStats={getPlayerStats}
        />
      </div>
    </div>
  );
}
