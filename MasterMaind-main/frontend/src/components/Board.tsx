import React, { useState, useEffect, useCallback } from 'react';
import { Color, GameState, GameStatus } from '../types';
import { CODE_LENGTH, COLOR_MAP } from '../constants';
import Row from './Row';
import ColorPicker from './ColorPicker';
import Modal from './Modal';
import RulesModal from './RulesModal';
import LeaderboardModal, { LeaderboardTable } from './LeaderboardModal';
import DifficultyModal from './DifficultyModal';
import { checkGuessApi, startGameApi, submitScoreApi, getRankingApi, ScoreEntry } from '../services/gameService';
import { AudioManager } from '../utils/audioManager';
import { RefreshCcw, HelpCircle, Trophy, AlertCircle, Send, BookOpen, BarChart3, Volume2, VolumeX, Clock } from 'lucide-react';

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

  // Tu trzymamy czas i wszystko co potrzebne do liczenia wyniku
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Poziom trudności i dynamiczna liczba prób
  const [showDifficultyModal, setShowDifficultyModal] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState(10);

  // Zarządzanie wszystkimi wyskakującymi okienkami (modalami)
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Ranking wyświetlany po zakończeniu gry
  const [rankingScores, setRankingScores] = useState<ScoreEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  // Czy wyciszyliśmy dźwięki?
  const [isMuted, setIsMuted] = useState(false);

  // Odpalamy dźwięki (wymaga pierwszej interakcji użytkownika)
  useEffect(() => {
    const audio = AudioManager.getInstance();
    const handleInteraction = () => {
      audio.toggleBGM(true);
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);


  // Licznik czasu gry
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState.status === GameStatus.PLAYING && !endTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.status, startTime, endTime]);

  const handleDifficultySelect = async (difficulty: 'easy' | 'normal' | 'hard') => {
    setLoading(true);
    setShowDifficultyModal(false);
    try {
      const { gameId: id, maxAttempts: max } = await startGameApi(difficulty);
      setGameId(id);
      setMaxAttempts(max);

      setGameState({
        history: Array(max).fill(null).map(() => ({
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
      setRankingScores([]);
      AudioManager.getInstance().playSound('click');
    } catch (error) {
      console.error("Failed to start game:", error);
      setShowDifficultyModal(true); // Wyświetlamy ponownie, jeśli coś poszło nie tak
    } finally {
      setLoading(false);
    }
  };

  const restartGame = () => {
    setShowDifficultyModal(true);
  };

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
      await fetchRankingForSummary();
    }
  };

  const handleSubmitGuess = async () => {
    if (currentGuess.some(c => c === null)) {
      AudioManager.getInstance().playSound('error');
      return;
    }
    if (loading || gameState.status !== GameStatus.PLAYING || !gameId) return;

    setLoading(true);
    AudioManager.getInstance().playSound('click');
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
        AudioManager.getInstance().playSound('win');
        fetchRankingForSummary();
      } else if (gameState.currentTurn === maxAttempts - 1) { // Sprawdzamy czy to była ostatnia szansa
        newStatus = GameStatus.LOST;
        setShowSolution(true);
        setEndTime(Date.now());
        AudioManager.getInstance().playSound('lose');
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
    <div className="w-full h-full flex flex-col items-center relative">

      {/* Pasek narzędzi (Zasady, Ranking, Dźwięk) */}
      <div className="w-full flex justify-between items-center p-4 bg-white/5 backdrop-blur-md border-b border-white/5">

        <div className="flex gap-2">
          {[
            { icon: BookOpen, action: () => setIsRulesOpen(true), label: "Zasady" },
            { icon: BarChart3, action: () => setIsLeaderboardOpen(true), label: "Ranking" },
            { icon: isMuted ? VolumeX : Volume2, action: toggleMute, label: "Dźwięk" },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className="glass-button p-2 rounded-xl text-white/70 hover:text-white"
              title={btn.label}
            >
              <btn.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-4">
          {/* Czasomierz */}
          <div className="flex items-center gap-2 text-fuchsia-400 font-mono font-bold">
            <Clock className="w-4 h-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            Próba {gameState.currentTurn + 1} <span className="text-white/30">/ {maxAttempts}</span>
          </div>
        </div>
      </div>

      {/* Plansza, na której gramy */}
      <div className="flex-1 w-full max-w-3xl overflow-y-auto p-4 flex flex-col-reverse gap-3 pb-32 no-scrollbar mask-gradient-b">
        {/* Ukryte rozwiązanie (pokazuje się po wygranej/przegranej) */}
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

        {/* Rzędy z naszymi strzałami */}
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

      {/* Przycisk do zatwierdzania ruchu */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-20">
        {gameState.status === GameStatus.PLAYING && (
          <button
            onClick={handleSubmitGuess}
            disabled={!canSubmit}
            className={`
                w-full py-4 rounded-2xl font-bold tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-xl border border-white/10
                ${canSubmit
                ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white hover:scale-[1.02] shadow-indigo-500/25'
                : 'bg-white/5 text-white/20 cursor-not-allowed backdrop-blur-md'}
              `}
          >
            {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? "SPRAWDZAM..." : "ZATWIERDŹ RUCH"}
          </button>
        )}
      </div>

      {/* Okienko końca gry z rankingiem */}
      <Modal
        isOpen={gameState.status !== GameStatus.PLAYING}
        onClose={restartGame}
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

          {/* Zintegrowana tabela wyników */}
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
            onClick={restartGame}
            className="w-full py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-xl"
          >
            Zagraj Ponownie
          </button>
        </div>
      </Modal>

      {/* Okienko wyboru trudności */}
      <DifficultyModal
        isOpen={showDifficultyModal}
        onSelect={handleDifficultySelect}
      />

      {/* Okienko z zasadami gry */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Okienko rankingu */}
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />

      {/* Okienko wyboru koloru */}
      <Modal isOpen={isColorPickerOpen} onClose={() => setIsColorPickerOpen(false)} title="Wybierz Kolor">
        <ColorPicker onSelectColor={handleColorSelect} />
      </Modal>

    </div>
  );
};

export default Board;
