
import React, { useState, useEffect, useCallback } from 'react';
import { Color, GameState, GameStatus, GuessResult } from '../types';
import { COLORS, MAX_ATTEMPTS, CODE_LENGTH } from '../constants';
import Row from './Row';
import ColorPicker from './ColorPicker';
import { checkGuessApi } from '../services/gameService';
import { RefreshCcw, HelpCircle, Trophy, AlertCircle, Send } from 'lucide-react';

const Board: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    history: [],
    solution: [],
    status: GameStatus.PLAYING,
    currentTurn: 0
  });

  const [currentGuess, setCurrentGuess] = useState<(Color | null)[]>(Array(CODE_LENGTH).fill(null));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const initGame = useCallback(() => {
    const newSolution = Array.from({ length: CODE_LENGTH }, () => 
      COLORS[Math.floor(Math.random() * COLORS.length)]
    );
    
    setGameState({
      history: Array(MAX_ATTEMPTS).fill(null).map(() => ({
        guess: Array(CODE_LENGTH).fill(null),
        feedback: null
      })),
      solution: newSolution,
      status: GameStatus.PLAYING,
      currentTurn: 0
    });
    setCurrentGuess(Array(CODE_LENGTH).fill(null));
    setSelectedSlot(0);
    setShowSolution(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleSlotClick = (idx: number) => {
    if (gameState.status !== GameStatus.PLAYING) return;
    setSelectedSlot(idx);
  };

  const handleColorSelect = (color: Color) => {
    if (gameState.status !== GameStatus.PLAYING || selectedSlot === null) return;
    
    const nextGuess = [...currentGuess];
    nextGuess[selectedSlot] = color;
    setCurrentGuess(nextGuess);

    // Auto-advance to next slot
    if (selectedSlot < CODE_LENGTH - 1) {
      setSelectedSlot(selectedSlot + 1);
    }
  };

  const handleSubmitGuess = async () => {
    if (currentGuess.some(c => c === null) || loading || gameState.status !== GameStatus.PLAYING) return;

    setLoading(true);
    try {
      const resultFeedback = await checkGuessApi(currentGuess as Color[], gameState.solution);
      
      const newHistory = [...gameState.history];
      newHistory[gameState.currentTurn] = {
        guess: [...currentGuess],
        feedback: resultFeedback
      };

      let newStatus = GameStatus.PLAYING;
      if (resultFeedback.black === CODE_LENGTH) {
        newStatus = GameStatus.WON;
        setShowSolution(true);
      } else if (gameState.currentTurn === MAX_ATTEMPTS - 1) {
        newStatus = GameStatus.LOST;
        setShowSolution(true);
      }

      setGameState(prev => ({
        ...prev,
        history: newHistory,
        currentTurn: prev.currentTurn + 1,
        status: newStatus
      }));

      // Reset for next turn
      setCurrentGuess(Array(CODE_LENGTH).fill(null));
      setSelectedSlot(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !currentGuess.some(c => c === null) && !loading && gameState.status === GameStatus.PLAYING;

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center gap-8 py-10 px-4 min-h-screen">
      {/* Hidden Solution Section */}
      <div className="w-full flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 mb-2">
            {showSolution ? (
                <div className="flex gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                    {gameState.solution.map((color, i) => (
                        <div key={i} className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${COLOR_MAP[color]} shadow-lg`} />
                    ))}
                </div>
            ) : (
                <div className="flex gap-4 p-4 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                    {[...Array(CODE_LENGTH)].map((_, i) => (
                        <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800 flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-slate-700" />
                        </div>
                    ))}
                </div>
            )}
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Secret Code</p>
      </div>

      {/* Main Board */}
      <div className="w-full space-y-3 flex flex-col-reverse">
        {gameState.history.map((result, idx) => (
          <Row 
            key={idx}
            attemptIndex={idx}
            result={idx === gameState.currentTurn ? { guess: currentGuess, feedback: null } : result}
            isActive={idx === gameState.currentTurn && gameState.status === GameStatus.PLAYING}
            onPegClick={handleSlotClick}
            selectedSlot={selectedSlot}
          />
        )).reverse()}
      </div>

      {/* Action Zone - Fixed to bottom on mobile for accessibility */}
      <div className="sticky bottom-8 w-full z-10 space-y-4">
        {gameState.status === GameStatus.PLAYING ? (
            <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                    <button 
                        onClick={handleSubmitGuess}
                        disabled={!canSubmit}
                        className={`
                            px-8 py-3 rounded-full font-bold flex items-center gap-3 transition-all duration-300
                            ${canSubmit 
                                ? 'bg-white text-slate-950 hover:bg-slate-200 shadow-xl scale-100' 
                                : 'bg-slate-900 text-slate-700 cursor-not-allowed scale-95 opacity-50'}
                        `}
                    >
                        {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        SUBMIT GUESS
                    </button>
                </div>
                <ColorPicker onSelectColor={handleColorSelect} disabled={gameState.status !== GameStatus.PLAYING} />
            </div>
        ) : (
            <div className="bg-slate-900/90 border-2 border-slate-800 p-8 rounded-3xl backdrop-blur-lg flex flex-col items-center gap-6 animate-in zoom-in fade-in duration-500 shadow-2xl">
                <div className="flex items-center gap-3">
                    {gameState.status === GameStatus.WON ? (
                        <>
                            <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400">
                                <Trophy className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-emerald-400">VICTORY!</h2>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-rose-500/20 rounded-full text-rose-400">
                                <AlertCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-rose-400">DEFEAT...</h2>
                        </>
                    )}
                </div>
                <p className="text-slate-400 text-center text-sm md:text-base max-w-xs">
                    {gameState.status === GameStatus.WON 
                        ? "Masterful deduction. The combination was correctly identified." 
                        : "Better luck next time. The logic of the code was too complex this turn."}
                </p>
                <button 
                    onClick={initGame}
                    className="flex items-center gap-2 px-10 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-xl hover:scale-105"
                >
                    <RefreshCcw className="w-5 h-5" />
                    PLAY AGAIN
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

import { COLOR_MAP as RAW_COLOR_MAP } from '../constants';
const COLOR_MAP = RAW_COLOR_MAP;

export default Board;
