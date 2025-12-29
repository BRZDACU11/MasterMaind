import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { ScoreEntry, getRankingApi } from '../services/gameService';
import { Trophy, Clock, Hash } from 'lucide-react';

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LeaderboardTable: React.FC<{ scores: ScoreEntry[], loading: boolean }> = ({ scores, loading }) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="text-center py-6 text-slate-500 animate-pulse">Ładowanie wyników...</div>;
    if (scores.length === 0) return <div className="text-center py-6 text-slate-500 italic">Brak wyników. Bądź pierwszy!</div>;

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Gracz</div>
                <div className="col-span-3 text-center">Próby</div>
                <div className="col-span-3 text-right">Czas</div>
            </div>
            {scores.map((score, index) => (
                <div
                    key={index}
                    className={`
                        grid grid-cols-12 gap-2 p-3 rounded-xl items-center border
                        ${index === 0 ? 'bg-yellow-500/10 border-yellow-500/30' :
                            index === 1 ? 'bg-slate-300/10 border-slate-300/20' :
                                index === 2 ? 'bg-amber-700/10 border-amber-700/20' :
                                    'bg-slate-800/30 border-slate-800'}
                    `}
                >
                    <div className="col-span-1 font-bold text-slate-400">
                        {index === 0 ? <Trophy className="w-4 h-4 text-yellow-500" /> : index + 1}
                    </div>
                    <div className="col-span-5 font-bold text-white truncate text-sm">{score.name}</div>
                    <div className="col-span-3 flex items-center justify-center gap-1 text-slate-300 text-xs">
                        <Hash className="w-3 h-3 text-slate-500" /> {score.attempts}
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-1 text-slate-300 text-xs font-mono">
                        <Clock className="w-3 h-3 text-slate-500" /> {formatTime(score.time)}
                    </div>
                </div>
            ))}
        </div>
    );
};

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
    const [scores, setScores] = useState<ScoreEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getRankingApi()
                .then(data => setScores(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Najlepsze Wyniki">
            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <LeaderboardTable scores={scores} loading={loading} />
            </div>
        </Modal>
    );
};

export default LeaderboardModal;
