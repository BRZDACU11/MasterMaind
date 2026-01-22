
import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface DifficultyModalProps {
    onSelect: (difficulty: 'easy' | 'normal' | 'hard') => void;
    isOpen: boolean;
}

const DifficultyModal: React.FC<DifficultyModalProps> = ({ onSelect, isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-panel w-full max-w-lg p-8 rounded-3xl border border-white/10 relative overflow-hidden">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">V2.0 OPERATION</h2>
                    <p className="text-slate-400">Select mission difficulty parameters</p>
                </div>

                <div className="grid gap-4">
                    <button
                        onClick={() => onSelect('easy')}
                        className="group relative p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all text-left"
                    >
                        <div className="absolute top-4 right-4 opacity-50"><ShieldCheck className="w-6 h-6 text-emerald-500" /></div>
                        <h3 className="text-xl font-bold text-emerald-400 mb-1">RECRUIT (Easy)</h3>
                        <p className="text-sm text-slate-400">10 Attempts • Unique Colors Only</p>
                    </button>

                    <button
                        onClick={() => onSelect('normal')}
                        className="group relative p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all text-left"
                    >
                        <div className="absolute top-4 right-4 opacity-50"><Shield className="w-6 h-6 text-indigo-500" /></div>
                        <h3 className="text-xl font-bold text-indigo-400 mb-1">AGENT (Normal)</h3>
                        <p className="text-sm text-slate-400">10 Attempts • Duplicates Allowed</p>
                    </button>

                    <button
                        onClick={() => onSelect('hard')}
                        className="group relative p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/50 transition-all text-left"
                    >
                        <div className="absolute top-4 right-4 opacity-50"><ShieldAlert className="w-6 h-6 text-rose-500" /></div>
                        <h3 className="text-xl font-bold text-rose-400 mb-1">VETERAN (Hard)</h3>
                        <p className="text-sm text-slate-400">8 Attempts • Duplicates Allowed</p>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DifficultyModal;
