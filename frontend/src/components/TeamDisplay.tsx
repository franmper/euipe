import { Star, CheckCircle2, Scale, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import type { EquipoBalanceado, Jugador } from '../../../shared/types';

interface JugadorConPuntaje extends Jugador {
  puntajePromedio: number;
}

interface TeamDisplayProps {
  equipos: {
    equipoA: {
      jugadores: JugadorConPuntaje[];
      puntajeTotal: number;
    };
    equipoB: {
      jugadores: JugadorConPuntaje[];
      puntajeTotal: number;
    };
    diferencia: number;
  };
}

export default function TeamDisplay({ equipos }: TeamDisplayProps) {
  const getPuntajeColor = (puntaje: number) => {
    if (puntaje >= 8) return 'text-green-600';
    if (puntaje >= 6) return 'text-blue-600';
    if (puntaje >= 4) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const getDiferenciaVariant = () => {
    if (equipos.diferencia <= 2) return 'default';
    if (equipos.diferencia <= 4) return 'secondary';
    return 'destructive';
  };

  const getDiferenciaMessage = () => {
    if (equipos.diferencia <= 2) return 'Equipos muy balanceados';
    if (equipos.diferencia <= 4) return 'Equipos razonablemente balanceados';
    return 'Considera regenerar los equipos';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Equipo A */}
        <Card className="border-2 border-blue-200 bg-blue-50/30 hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white w-fit">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Team Alpha</span>
                </div>
                <CardTitle className="text-3xl font-black text-blue-900">Equipo A</CardTitle>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/60 mb-1">Poder Total</p>
                <p className="text-4xl font-black text-blue-700 leading-none">
                  {equipos.equipoA.puntajeTotal.toFixed(1)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="space-y-3">
              {equipos.equipoA.jugadores.map((jugador, index) => (
                <Card key={jugador.id} className="bg-white/80 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-blue-200 font-black italic text-xl group-hover:text-blue-400 transition-colors">0{index + 1}</span>
                      <span className="font-bold text-lg text-blue-900">{jugador.nombre}</span>
                    </div>
                    <Badge variant="outline" className={cn("font-black h-8 px-3 rounded-xl border-2", getPuntajeColor(jugador.puntajePromedio))}>
                      {jugador.puntajePromedio.toFixed(1)} <Star className="w-3.5 h-3.5 ml-1.5 fill-current" />
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipo B */}
        <Card className="border-2 border-red-200 bg-red-50/30 hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white w-fit">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Team Beta</span>
                </div>
                <CardTitle className="text-3xl font-black text-red-900">Equipo B</CardTitle>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600/60 mb-1">Poder Total</p>
                <p className="text-4xl font-black text-red-700 leading-none">
                  {equipos.equipoB.puntajeTotal.toFixed(1)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="space-y-3">
              {equipos.equipoB.jugadores.map((jugador, index) => (
                <Card key={jugador.id} className="bg-white/80 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-red-200 font-black italic text-xl group-hover:text-red-400 transition-colors">0{index + 1}</span>
                      <span className="font-bold text-lg text-red-900">{jugador.nombre}</span>
                    </div>
                    <Badge variant="outline" className={cn("font-black h-8 px-3 rounded-xl border-2", getPuntajeColor(jugador.puntajePromedio))}>
                      {jugador.puntajePromedio.toFixed(1)} <Star className="w-3.5 h-3.5 ml-1.5 fill-current" />
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diferencia */}
      <Card className={cn(
        "border-2 rounded-[2rem] shadow-xl overflow-hidden transition-all duration-500",
        equipos.diferencia <= 2 && "border-green-200 bg-green-50/50",
        equipos.diferencia > 2 && equipos.diferencia <= 4 && "border-yellow-200 bg-yellow-50/50",
        equipos.diferencia > 4 && "border-red-200 bg-red-50/50"
      )}>
        <CardContent className="p-10 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-6 py-2 rounded-full border-2 border-inherit shadow-sm">
            <Scale className={cn(
              "w-8 h-8",
              equipos.diferencia <= 2 ? "text-green-600" : equipos.diferencia <= 4 ? "text-yellow-600" : "text-red-600"
            )} />
          </div>
          
          <div className="space-y-2 mb-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Brecha de Nivel</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-6xl font-black tracking-tighter">
                {equipos.diferencia.toFixed(1)}
              </span>
              <TrendingUp className={cn(
                "w-10 h-10",
                equipos.diferencia <= 2 ? "text-green-500" : "text-muted-foreground/30"
              )} />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Badge variant={getDiferenciaVariant()} className="px-6 py-2 rounded-full text-sm font-black shadow-lg shadow-inherit/20">
              {getDiferenciaMessage()}
            </Badge>
            
            {equipos.diferencia <= 2 && (
              <p className="text-green-700/60 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Partido de alta competitividad asegurado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
