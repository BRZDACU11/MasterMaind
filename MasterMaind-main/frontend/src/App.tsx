
import React from 'react';
import Board from './components/Board';
// Wywalamy starą ikonę, bo nowa jest fajniejsza
import { Rocket } from 'lucide-react'; // Przykład nowej ikony

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Te ładne, rozmyte kółka w tle, żeby nie było nudno */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Główny panel, w którym siedzi cała gra */}
      <div className="glass-panel w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden flex flex-col relative z-10">

        {/* Nagłówek aplikacji */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-lg shadow-lg shadow-indigo-500/20">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Master Mind <span className="text-fuchsia-400 font-black italic ml-1">Demo</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">v2.0.0 Alpha</span>
          </div>
        </header>

        {/* Tu dzieje się magia, czyli plansza do gry */}
        <main className="flex-1 flex overflow-hidden relative">
          <Board />
        </main>
      </div>

      {/* Stopka z informacją o twórcach */}
      <footer className="mt-4 text-slate-500 text-xs font-medium tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity">
        Designed by Wiktor Staniszewski Marcin Ujazdowski i Gabriel wojcik
      </footer>
    </div>
  );
};

export default App;
