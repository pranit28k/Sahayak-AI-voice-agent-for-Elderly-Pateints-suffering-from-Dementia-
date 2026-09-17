import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Trophy, RotateCcw, Check, HelpCircle, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

interface PuzzlePiece {
  id: number;
  correctSlot: number; // 0, 1, 2, 3
  bgPosition: string;
}

export const PhotoPuzzleGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, patient, familyMembers, addGameResult } = useAppStore();

  const [difficulty, setDifficulty] = useState<number>(1);
  const [boardSlots, setBoardSlots] = useState<(PuzzlePiece | null)[]>([null, null, null, null]);
  const [trayPieces, setTrayPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [wrongTries, setWrongTries] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const familyPhoto =
    familyMembers[0]?.photoUrl ||
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80';

  // 4 pieces for 2x2 grid: top-left(0), top-right(1), bottom-left(2), bottom-right(3)
  const basePieces: PuzzlePiece[] = [
    { id: 1, correctSlot: 0, bgPosition: '0% 0%' },
    { id: 2, correctSlot: 1, bgPosition: '100% 0%' },
    { id: 3, correctSlot: 2, bgPosition: '0% 100%' },
    { id: 4, correctSlot: 3, bgPosition: '100% 100%' },
  ];

  const setupLevel = useCallback((_lvl: number) => {
    // Scramble tray pieces
    const shuffled = [...basePieces].sort(() => Math.random() - 0.5);
    setTrayPieces(shuffled);
    setBoardSlots([null, null, null, null]);
    setSelectedPieceId(null);
    setIsCompleted(false);
    setWrongTries(0);
    setStartTime(Date.now());

    const intro =
      currentLanguage === 'hi'
        ? `परिवार फोटो पहेली: इन 4 टुकड़ों को सही जगह रखकर तस्वीर पूरी करें। पहले नीचे से एक टुकड़ा छुएं, फिर ऊपर के खाने को छुएं।`
        : `Family Photo Puzzle: Place these 4 pieces together to assemble the loving family portrait, ${patient.preferredName || 'Dadu'}. Touch a piece from the tray, then touch its slot in the frame.`;

    setMessage(intro);
    voiceEngine.speak(intro, currentLanguage);
  }, [currentLanguage, patient.preferredName]);

  useEffect(() => {
    setupLevel(difficulty);
    return () => voiceEngine.stop();
  }, [difficulty, setupLevel]);

  const handleSelectTrayPiece = (piece: PuzzlePiece) => {
    if (isCompleted) return;
    setSelectedPieceId(piece.id);
    const cue = `Selected piece ${piece.id}. Now touch the square where it fits.`;
    setMessage(cue);
    voiceEngine.speak(`Piece ${piece.id} chosen. Tap the square.`, currentLanguage);
  };

  const handleSlotClick = (slotIdx: number) => {
    if (isCompleted || selectedPieceId === null) return;

    const chosenPiece = trayPieces.find((p) => p.id === selectedPieceId);
    if (!chosenPiece) return;

    // Check if correct slot
    if (chosenPiece.correctSlot === slotIdx) {
      // Place piece in slot
      const newSlots = [...boardSlots];
      newSlots[slotIdx] = chosenPiece;
      setBoardSlots(newSlots);

      // Remove from tray
      setTrayPieces((prev) => prev.filter((p) => p.id !== selectedPieceId));
      setSelectedPieceId(null);

      const allFilled = newSlots.every((s) => s !== null);
      if (allFilled) {
        handleFinishPuzzle();
      } else {
        const praise =
          currentLanguage === 'hi'
            ? `बहुत सुंदर! टुकड़ा बिल्कुल सही जगह बैठ गया।`
            : `Splendid! That piece fits perfectly.`;
        setMessage(praise);
        voiceEngine.speak(praise, currentLanguage);
      }
    } else {
      // Wrong slot - warm encouragement
      setWrongTries((prev) => prev + 1);
      const gentle =
        currentLanguage === 'hi'
          ? 'अच्छा प्रयास! यह टुकड़ा किसी दूसरे खाने में लगेगा। शांति से देखें।'
          : 'That was a good try! This piece belongs in a different square.';
      setMessage(gentle);
      voiceEngine.speak(gentle, currentLanguage);
    }
  };

  const handleFinishPuzzle = () => {
    setIsCompleted(true);
    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    const celebration =
      currentLanguage === 'hi'
        ? `अद्भुत! आपने परिवार की पूरी तस्वीर जोड़ ली, ${patient.preferredName || 'दादू'} जी!`
        : `Magnificent, ${patient.preferredName || 'Dadu'}! You assembled the entire family portrait peacefully.`;

    setMessage(celebration);
    voiceEngine.speak(celebration, currentLanguage);

    addGameResult({
      gameType: 'photo_puzzle',
      score: wrongTries > 3 ? 85 : 100,
      maxScore: 100,
      difficulty,
      reactionTimeSec: Math.round((elapsed / 4) * 10) / 10,
      completed: true,
      notes: `Assembled 4-piece family photo in ${elapsed}s (Level ${difficulty}).`,
    });
  };

  const handleHearHint = () => {
    if (trayPieces.length === 0) return;
    const piece = trayPieces[0];
    const slotNames = ['top left', 'top right', 'bottom left', 'bottom right'];
    const hint = `Piece number ${piece.id} goes in the ${slotNames[piece.correctSlot]} square.`;
    setMessage(hint);
    voiceEngine.speak(hint, currentLanguage);
  };

  // Voice Command Processing
  const handleVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    if (text.includes('hint') || text.includes('मदद')) {
      handleHearHint();
      return;
    }

    if (text.includes('repeat') || text.includes('दोहराएं')) {
      voiceEngine.speak(message, currentLanguage);
      return;
    }

    if (text.includes('start over') || text.includes('restart')) {
      setupLevel(difficulty);
      return;
    }

    // Number word match for piece selection
    const pieceMap: { [key: string]: number } = {
      one: 1, '1': 1, 'एक': 1,
      two: 2, '2': 2, 'दो': 2,
      three: 3, '3': 3, 'तीन': 3,
      four: 4, '4': 4, 'चार': 4,
    };

    for (const [word, id] of Object.entries(pieceMap)) {
      if (text.includes(`piece ${word}`) || text.includes(`टुकड़ा ${word}`) || text === word) {
        const found = trayPieces.find((p) => p.id === id);
        if (found) {
          handleSelectTrayPiece(found);
          return;
        }
      }
    }

    // Slot position keywords ("top left", "top right", "bottom left", "bottom right")
    if (selectedPieceId !== null) {
      if (text.includes('top left')) handleSlotClick(0);
      else if (text.includes('top right')) handleSlotClick(1);
      else if (text.includes('bottom left')) handleSlotClick(2);
      else if (text.includes('bottom right')) handleSlotClick(3);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      voiceEngine.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    voiceEngine.startListening(currentLanguage, {
      onSpeechStart: () => setIsListening(true),
      onTranscript: (spoken, isFinal) => {
        if (isFinal) {
          handleVoiceCommand(spoken);
          setIsListening(false);
        }
      },
      onSpeechEnd: () => setIsListening(false),
      onError: () => setIsListening(false),
    });
  };

  const handleAdvanceLevel = () => {
    if (wrongTries <= 1 && difficulty < 3) {
      setDifficulty((prev) => prev + 1);
    } else if (wrongTries > 3 && difficulty > 1) {
      setDifficulty((prev) => prev - 1);
    } else {
      setupLevel(difficulty);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            voiceEngine.stop();
            navigate('/patient/games');
          }}
          className="touch-target-large px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl flex items-center gap-2 font-bold text-lg cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Back to Games</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-stone-600 font-bold text-base px-3 py-1 bg-white border border-stone-200 rounded-xl shadow-xs">
            Placed: {boardSlots.filter(Boolean).length} / 4
          </span>
          <span className="text-xs font-bold text-sage-800 bg-sage-100 px-2.5 py-1 rounded-xl">
            Level {difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleHearHint}
            className="touch-target-large px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <span className="hidden sm:inline">Hint</span>
          </button>

          <button
            onClick={toggleMic}
            className={`touch-target-large px-3 py-2 rounded-2xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-colors ${
              isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
            }`}
            title="Voice control: Say 'piece 1', 'top left'"
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
          </button>

          <button
            onClick={() => setupLevel(difficulty)}
            className="touch-target-large px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-900 rounded-2xl flex items-center gap-2 font-bold text-base cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-sage-700" />
            <span className="hidden sm:inline">Start Over</span>
          </button>
        </div>
      </div>

      {/* Sahayak Audio Instruction Banner */}
      <motion.div
        layout
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="bg-white border-2 border-sage-200 rounded-3xl p-5 shadow-xs flex items-start gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center shrink-0 text-sage-800">
          <Volume2 className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sage-600 block mb-0.5">
            Sahayak Guidance
          </span>
          <p className="text-xl md:text-2xl font-bold text-stone-900 leading-snug">
            {message}
          </p>
        </div>
      </motion.div>

      {/* Assembly Frame & Tray Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 items-center">
        {/* Frame Target (2x2 Grid) */}
        <div className="bg-white rounded-3xl border-3 border-stone-300 p-4 shadow-sm flex flex-col items-center">
          <span className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-2">
            Family Photo Frame (Assemble Here)
          </span>

          <div className="relative w-64 h-64 sm:w-72 sm:h-72 grid grid-cols-2 grid-rows-2 gap-2 border-3 border-stone-200 bg-stone-100 rounded-2xl p-2 select-none overflow-hidden">
            {[0, 1, 2, 3].map((slotIdx) => {
              const placedPiece = boardSlots[slotIdx];
              const slotLabels = ['Top-Left', 'Top-Right', 'Bottom-Left', 'Bottom-Right'];

              return (
                <button
                  key={slotIdx}
                  onClick={() => handleSlotClick(slotIdx)}
                  aria-label={`Frame slot ${slotLabels[slotIdx]}`}
                  className={`w-full h-full rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer relative overflow-hidden ${
                    placedPiece
                      ? 'border-emerald-500 shadow-xs'
                      : selectedPieceId !== null
                      ? 'border-dashed border-sage-500 bg-sage-50/80 hover:bg-sage-100'
                      : 'border-dashed border-stone-300 bg-white/70'
                  }`}
                >
                  {placedPiece ? (
                    <motion.div
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{
                        backgroundImage: `url(${familyPhoto})`,
                        backgroundSize: '200% 200%',
                        backgroundPosition: placedPiece.bgPosition,
                      }}
                      className="w-full h-full"
                    />
                  ) : (
                    <span className="text-xs font-bold text-stone-400">
                      {difficulty === 1 ? `#${slotIdx + 1}` : slotLabels[slotIdx]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Piece Tray (Scrambled Pieces to select) */}
        <div className="bg-white rounded-3xl border-3 border-stone-300 p-4 shadow-sm flex flex-col items-center">
          <span className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-2">
            Puzzle Pieces Tray (Touch a Piece First)
          </span>

          <div className="w-64 h-64 sm:w-72 sm:h-72 grid grid-cols-2 grid-rows-2 gap-3 bg-stone-50 rounded-2xl p-3 border border-stone-200">
            {trayPieces.map((piece) => {
              const isSelected = selectedPieceId === piece.id;

              return (
                <motion.button
                  key={piece.id}
                  onClick={() => handleSelectTrayPiece(piece)}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: isSelected ? 1.05 : 1 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className={`touch-target-large rounded-xl border-3 transition-colors duration-300 relative overflow-hidden cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-indigoSoft-600 ring-4 ring-indigoSoft-200'
                      : 'border-stone-300 hover:border-sage-500'
                  }`}
                >
                  <div
                    style={{
                      backgroundImage: `url(${familyPhoto})`,
                      backgroundSize: '200% 200%',
                      backgroundPosition: piece.bgPosition,
                    }}
                    className="w-full h-full"
                  />
                  <span className="absolute top-1 left-1 bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-stone-800 shadow-xs">
                    Piece {piece.id}
                  </span>
                </motion.button>
              );
            })}

            {trayPieces.length === 0 && (
              <div className="col-span-2 row-span-2 flex flex-col items-center justify-center text-emerald-700">
                <Check className="w-12 h-12 mb-1" />
                <span className="text-base font-bold">All Pieces Placed!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Dialog */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="p-8 bg-emerald-50 border-3 border-emerald-400 rounded-3xl text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-extrabold text-emerald-950">
              Family Portrait Assembled!
            </h3>
            <p className="text-xl text-emerald-800">
              You completed the family picture with such lovely patience, {patient.preferredName || 'Dadu'}.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={handleAdvanceLevel}
                className="touch-target-large px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-2xl shadow-md cursor-pointer"
              >
                {difficulty < 3 && wrongTries <= 1 ? 'Play Next Level' : 'Play Again'}
              </button>
              <button
                onClick={() => navigate('/patient/games')}
                className="touch-target-large px-8 py-3 bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-300 font-bold text-xl rounded-2xl shadow-xs cursor-pointer"
              >
                Choose Another Game
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
