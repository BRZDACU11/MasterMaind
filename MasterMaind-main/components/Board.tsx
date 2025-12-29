import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Color, GameState, GameStatus } from '../types';
import { COLORS, MAX_ATTEMPTS, CODE_LENGTH } from '../constants';
import Row from './Row';
import ColorPicker from './ColorPicker';
import Modal from './Modal';
import RulesModal from './RulesModal';
import LeaderboardModal, { LeaderboardTable } from './LeaderboardModal';
import { checkGuessApi, startGameApi, submitScoreApi, getRankingApi, ScoreEntry } from '../services/gameService';
import { AudioManager } from '../utils/audioManager';
import { RefreshCcw, HelpCircle, Trophy, AlertCircle, Send, BookOpen, BarChart3, Volume2, VolumeX, Clock } from 'lucide-react';
import { COLOR_MAP } from '../constants';

const Board: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    history: [],
    solution: [],
    status: GameStatus.PLAYING,
    currentTurn: 0
  });

  const [currentGuess, setCurrentGuess] = useState<(Color | null)[]>(Array(CODE_LENGTH).fill(null));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  // New State for Timer/Score
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Modal states
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Game Over Ranking State
  const [rankingScores, setRankingScores] = useState<ScoreEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  // Audio State
  const [isMuted, setIsMuted] = useState(false);

  // Initialize Audio
  useEffect(() => {
    const audio = AudioManager.getInstance();
    const handleInteraction = () => {
      audio.toggleBGM(true);
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState.status === GameStatus.PLAYING && !endTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.status, startTime, endTime]);

  const initGame = useCallback(async () => {
    setLoading(true);
    try {
      const id = await startGameApi();
      setGameId(id);

      setGameState({
        history: Array(MAX_ATTEMPTS).fill(null).map(() => ({
          guess: Array(CODE_LENGTH).fill(null),
          feedback: null
        })),
        solution: [],
        status: GameStatus.PLAYING,
        currentTurn: 0
      });
      setCurrentGuess(Array(CODE_LENGTH).fill(null));
      setSelectedSlot(null);
      setShowSolution(false);
      setStartTime(Date.now());
      setEndTime(null);
      setElapsedTime(0);
      setRankingScores([]); // Clear old ranking
      AudioManager.getInstance().playSound('click');
    } catch (error) {
      console.error("Failed to start game:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const toggleMute = () => {
    const muted = AudioManager.getInstance().toggleMute();
    setIsMuted(muted);
  };

  const handleSlotClick = (idx: number) => {
    if (gameState.status !== GameStatus.PLAYING) return;
    AudioManager.getInstance().playSound('click');
    setSelectedSlot(idx);
    setIsColorPickerOpen(true);
  };

  const handleColorSelect = (color: Color) => {
    if (gameState.status !== GameStatus.PLAYING || selectedSlot === null) return;
    AudioManager.getInstance().playSound('click');

    const nextGuess = [...currentGuess];
    nextGuess[selectedSlot] = color;
    setCurrentGuess(nextGuess);
    setIsColorPickerOpen(false);
    setSelectedSlot(null);
  };

  const calculateTime = () => {
    if (!endTime) return 0;
    return (endTime - startTime) / 1000;
  };

  const fetchRankingForSummary = async () => {
    setRankingLoading(true);
    try {
      const scores = await getRankingApi();
      setRankingScores(scores);
    } catch (e) {
      console.error(e);
    } finally {
      setRankingLoading(false);
    }
  };

  const handleSubmitScore = async () => {
    const name = prompt("Podaj swoje imię do rankingu:", "Anonim");
    if (name) {
      await submitScoreApi(name, calculateTime(), gameState.currentTurn + 1);
      await fetchRankingForSummary(); // Refresh ranking
    }
  };

  const handleSubmitGuess = async () => {
    if (currentGuess.some(c => c === null)) {
      AudioManager.getInstance().playSound('error'); // Distinct error sound
      return;
    }
    if (loading || gameState.status !== GameStatus.PLAYING || !gameId) return;

    setLoading(true);
    AudioManager.getInstance().playSound('click'); // Check sound
    try {
      const resultFeedback = await checkGuessApi(gameId, currentGuess as Color[]);

      const newHistory = [...gameState.history];
      newHistory[gameState.currentTurn] = {
        guess: [...currentGuess],
        feedback: resultFeedback
      };

      let newStatus = GameStatus.PLAYING;
      if (resultFeedback.black === CODE_LENGTH) {
        newStatus = GameStatus.WON;
        setShowSolution(true);
        setEndTime(Date.now());
        AudioManager.getInstance().playSound('win'); // Plays champion.mp3
        fetchRankingForSummary();
      } else if (gameState.currentTurn === MAX_ATTEMPTS - 1) {
        newStatus = GameStatus.LOST;
        setShowSolution(true);
        setEndTime(Date.now());
        AudioManager.getInstance().playSound('lose'); // Plays sad_trombone.mp3
        fetchRankingForSummary();
      } else {
        AudioManager.getInstance().playSound('click');
      }

      setGameState(prev => ({
        ...prev,
        history: newHistory,
        currentTurn: prev.currentTurn + 1,
        status: newStatus
      }));

      setCurrentGuess(Array(CODE_LENGTH).fill(null));
      setSelectedSlot(null);
    } catch (e) {
      AudioManager.getInstance().playSound('error');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !currentGuess.some(c => c === null) && !loading && gameState.status === GameStatus.PLAYING;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md md:max-w-2xl mx-auto flex flex-col items-center gap-6 py-6 px-4 min-h-screen relative overflow-x-hidden">

      {/* Top Controls */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setIsRulesOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Zasady</span>
          </button>
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden md:inline">Ranking</span>
          </button>
          <button
            onClick={toggleMute}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-full text-xs font-bold transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
          <div className="px-3 py-1 bg-slate-800/50 rounded-full text-slate-300">
            Próba {gameState.currentTurn + 1}/{MAX_ATTEMPTS}
          </div>
        </div>
      </div>

      {/* Hidden Solution Section */}
      <div className="w-full flex flex-col items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          {showSolution ? (
            <div className="flex gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
              {gameState.solution.map((color, i) => (
                <div key={i} className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${COLOR_MAP[color]} shadow-lg ring-2 ring-white/10`} />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 p-4 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
              {[...Array(CODE_LENGTH)].map((_, i) => (
                <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-slate-700" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Board */}
      <div className="w-full flex-1 flex flex-col-reverse gap-2 overflow-y-auto pb-32 no-scrollbar px-1">
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

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-10">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          {gameState.status === GameStatus.PLAYING && (
            <button
              onClick={handleSubmitGuess}
              className={`
                        w-full py-4 rounded-2xl font-black tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-lg
                        ${canSubmit
                  ? 'bg-white text-slate-950 hover:bg-slate-200 translate-y-0'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed translate-y-1'}
                    `}
            >
              {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              SPRAWDŹ
            </button>
          )}
        </div>
      </div>

      {/* Game Over Modal with Ranking */}
      <Modal
        isOpen={gameState.status !== GameStatus.PLAYING}
        onClose={initGame}
        title={gameState.status === GameStatus.WON ? "Podsumowanie" : "Koniec Gry"}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            {gameState.status === GameStatus.WON ? (
              <>
                <div className="flex justify-center mb-2"><Trophy className="w-12 h-12 text-emerald-400" /></div>
                <h3 className="text-3xl font-black text-emerald-400 mb-1">KOD ZŁAMANY!</h3>
                <p className="text-slate-400 text-sm">Twój czas: <span className="text-white font-mono">{formatTime((endTime! - startTime) / 1000)}</span></p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-2"><AlertCircle className="w-12 h-12 text-rose-400" /></div>
                <h3 className="text-3xl font-black text-rose-400 mb-1">PORAŻKA</h3>
                <p className="text-slate-400 text-sm">Rozwiązanie pozostało nieodkryte.</p>
              </>
            )}
          </div>

          {/* Integrated Leaderboard Summary */}
          <div className="w-full bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Tabela Wyników</h4>
            <LeaderboardTable scores={rankingScores} loading={rankingLoading} />
          </div>

          {gameState.status === GameStatus.WON && (
            <button
              onClick={handleSubmitScore}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-lg"
            >
              Zapisz Swój Wynik
            </button>
          )}

          <button
            onClick={initGame}
            className="w-full py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-xl"
          >
            Zagraj Ponownie
          </button>
        </div>
      </Modal>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Leaderboard Modal */}
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />

      {/* Color Picker Modal */}
      <Modal isOpen={isColorPickerOpen} onClose={() => setIsColorPickerOpen(false)} title="Wybierz Kolor">
        <ColorPicker onSelectColor={handleColorSelect} />
      </Modal>

    </div>
  );
};

export default Board;
