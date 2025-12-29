import React from 'react';
import Modal from './Modal';
import { Target, HelpCircle } from 'lucide-react';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Zasady Gry">
            <div className="space-y-6 text-slate-300">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 mt-1">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-1">Cel Gry</h3>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Odgadnij ukryty kod składający się z 4 kolorów. Masz 10 prób, aby znaleźć właściwą kombinację.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="font-bold text-white border-b border-slate-800 pb-2">Przewodnik po Wskazówkach</h3>

                    <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-200 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                        <div>
                            <span className="text-white font-bold block text-sm">Czarny Pionek</span>
                            <span className="text-xs text-slate-500">Dobry kolor na dobrym miejscu</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                        <div className="w-4 h-4 rounded-full bg-transparent border-2 border-slate-400"></div>
                        <div>
                            <span className="text-white font-bold block text-sm">Biały Pionek</span>
                            <span className="text-xs text-slate-500">Dobry kolor na złym miejscu</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/30 p-4 rounded-xl text-xs text-slate-500 italic">
                    Wskazówka: Ukryty kod może zawierać powtarzające się kolory.
                </div>
            </div>
        </Modal>
    );
};

export default RulesModal;
