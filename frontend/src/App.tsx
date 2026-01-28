import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, Trophy, Sparkles } from 'lucide-react';
import { cn } from './lib/utils';
import Players from './pages/Players';
import Matches from './pages/Matches';
import TeamGenerator from './pages/TeamGenerator';

function NavLink({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon: React.ComponentType<{ className?: string }> }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1"
      )}
    >
      <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
      {children}
    </Link>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-200">
                    <Trophy className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-xl font-black tracking-tighter">Euipe</span>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Manager</span>
                  </div>
                </Link>
                
                <nav className="hidden md:flex items-center gap-1">
                  <NavLink to="/" icon={Users}>Jugadores</NavLink>
                  <NavLink to="/matches" icon={Trophy}>Partidos</NavLink>
                  <NavLink to="/teams" icon={Sparkles}>Generador</NavLink>
                </nav>
              </div>

              <div className="flex md:hidden">
                {/* Mobile menu could go here, but using bottom nav for now as requested or keeping it simple */}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
            <Routes>
              <Route path="/" element={<Players />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/teams" element={<TeamGenerator />} />
            </Routes>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden sticky bottom-0 z-50 flex items-center justify-around p-2 border-t bg-background/80 backdrop-blur-lg pb-safe">
          <Link to="/" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary transition-colors">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Jugadores</span>
          </Link>
          <Link to="/matches" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary transition-colors">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Partidos</span>
          </Link>
          <Link to="/teams" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary transition-colors">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Generador</span>
          </Link>
        </nav>
      </div>
    </Router>
  );
}

export default App;
