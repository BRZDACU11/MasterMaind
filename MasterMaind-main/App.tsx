
import React from 'react';
import Board from './components/Board';
import { Target } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-slate-700 flex flex-col">
      {/* Simple Header */}
      <header className="py-8 px-6 border-b border-slate-900 flex justify-between items-center max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg text-slate-950">
            <Target className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Mastermind<span className="text-slate-500 ml-1 font-medium">Pro</span></h1>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            <span>10 Attempts</span>
            <span>6 Colors</span>
            <span>4 Slots</span>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex-1 overflow-y-auto">
        <Board />
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-slate-600 text-[10px] uppercase tracking-widest">
        &copy; 2024 Modern Mastermind Engine &bull; Senior Dev UX Demo
      </footer>
    </div>
  );
};

export default App;
