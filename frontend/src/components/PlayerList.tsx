import { useState } from 'react';
import { User, Calendar, Trash2, CheckCircle2, MoreVertical, ShieldCheck, ShieldAlert, Star, Trophy, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import type { Jugador } from '../../../shared/types';

interface PlayerListProps {
  jugadores: Jugador[];
  disponibilidad: Map<string, boolean>;
  onToggleDisponibilidad: (jugadorId: string) => void;
  onDelete: (jugadorId: string) => void;
  getPlayerStats?: (id: string) => { matchesPlayed: number; avgPoints: number };
}

export default function PlayerList({
  jugadores,
  disponibilidad,
  onToggleDisponibilidad,
  onDelete,
  getPlayerStats,
}: PlayerListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (jugadores.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No hay jugadores</h3>
          <p className="text-muted-foreground max-w-[250px]">
            Tu lista de jugadores está vacía. Comienza agregando a tu equipo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const disponiblesCount = Array.from(disponibilidad.values()).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <User className="w-12 h-12" />
          </div>
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-primary/60 mb-1">Total Jugadores</p>
            <p className="text-4xl font-black text-primary">{jugadores.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-12 h-12 text-green-600" />
          </div>
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-green-600/60 mb-1">Disponibles</p>
            <p className="text-4xl font-black text-green-600">{disponiblesCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3">
            {jugadores.map((jugador, index) => {
              const estaDisponible = disponibilidad.get(jugador.id) || false;
              const stats = getPlayerStats?.(jugador.id) || { matchesPlayed: 0, avgPoints: 0 };

              return (
                <Card
                  key={jugador.id}
                  className={cn(
                    "group transition-all duration-200 hover:shadow-md hover:border-primary/20",
                    estaDisponible ? "border-l-4 border-l-green-500" : "border-l-4 border-l-muted"
                  )}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-inner",
                          estaDisponible ? "bg-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {jugador.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg truncate">{jugador.nombre}</h4>
                            {estaDisponible && (
                              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none text-[10px] h-5 px-1.5">
                                LISTO
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Intl.DateTimeFormat('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                }).format(new Date(jugador.fechaCreacion))}
                              </span>
                            </div>
                            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                              <Trophy className="w-3 h-3 text-orange-500" />
                              <span>{stats.matchesPlayed} partidos</span>
                            </div>
                            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span>{stats.avgPoints} avg</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant={estaDisponible ? "secondary" : "outline"}
                      className={cn(
                        "h-9 px-3 rounded-xl transition-all",
                        estaDisponible 
                          ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none" 
                          : "text-muted-foreground"
                      )}
                      onClick={() => onToggleDisponibilidad(jugador.id)}
                    >
                      {estaDisponible ? (
                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 mr-1.5" />
                      )}
                      <span className="hidden sm:inline">{estaDisponible ? 'Disponible' : 'Ausente'}</span>
                    </Button>

                    {deleteConfirmId === jugador.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-9 rounded-xl px-3"
                          onClick={() => {
                            onDelete(jugador.id);
                            setDeleteConfirmId(null);
                          }}
                        >
                          Sí
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 rounded-xl"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        onClick={() => setDeleteConfirmId(jugador.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
