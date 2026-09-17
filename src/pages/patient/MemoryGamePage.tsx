import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Check, RotateCcw, Volume2, Trophy, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

interface CardItem {
  id: number;
  pairId: string;
  name: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { familyMembers, addGameResult, currentLanguage, patient } = useAppStore();

  // Difficulty: 1 = 4 cards (2 pairs), 2 = 6 cards (3 pairs), 3 = 8 cards (4 pairs)
  const [difficulty, setDifficulty] = useState<number>(1);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [message, setMessage] = useState('Find the matching pictures. Tap any card or say "Card 1".');
  const [isListening, setIsListening] = useState(false);

  // Available pair definitions
  const poolPairs = [
    {
      pairId: 'priya',
      name: 'Daughter Priya',
      image: familyMembers[0]?.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      pairId: 'aarav',
      name: 'Grandson Aarav',
      image: familyMembers[1]?.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    },
    {
      pairId: 'tea',
      name: 'Warm Assam Tea',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
    },
    {
      pairId: 'marigold',
      name: 'Yellow Marigold',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const totalPairs = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;

  const setupGame = useCallback((level: number) => {
    const pairsCount = level === 1 ? 2 : level === 2 ? 3 : 4;
    const selectedPairs = poolPairs.slice(0, pairsCount);

    const combined = [...selectedPairs, ...selectedPairs].map((item, idx) => ({
      id: idx + 1,
      pairId: item.pairId,
      name: item.name,
      image: item.image,
      isFlipped: false,
      isMatched: false,
    }));

    const shuffled = combined.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedCount(0);
    setWrongAttempts(0);
    setGameCompleted(false);
    setStartTime(Date.now());

    const levelText = level === 1 ? 'Gentle Level' : level === 2 ? 'Comfortable Level' : 'Attentive Level';
    const intro =
      currentLanguage === 'hi'
        ? `स्मृति कार्ड मिलान खेल में आपका स्वागत है (${levelText})। किसी भी कार्ड को छुएं या बोलें "कार्ड 1"।`
        : currentLanguage === 'as'
        ? `স্মৃতি কাৰ্ড খেললৈ স্বাগতম (${levelText})। কাৰ্ডত স্পৰ্শ কৰক বা কওক "কাৰ্ড 1"।`
        : `Welcome to Memory Matching (${levelText}), ${patient.preferredName || 'Dadu'}. Tap any card or say "Card 1".`;

    setMessage(intro);
    voiceEngine.speak(intro, currentLanguage);
  }, [currentLanguage, patient.preferredName]);

  useEffect(() => {
    setupGame(difficulty);
    return () => voiceEngine.stop();
  }, [difficulty, setupGame]);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length >= 2) {
      return;
    }

    const updated = [...cards];
    updated[index].isFlipped = true;
    setCards(updated);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Speak the card name gently
    const cardName = updated[index].name;
    voiceEngine.speak(cardName, currentLanguage);

    if (newFlipped.length === 2) {
      const first = updated[newFlipped[0]];
      const second = updated[newFlipped[1]];

      if (first.pairId === second.pairId) {
        // MATCH FOUND
        setTimeout(() => {
          first.isMatched = true;
          second.isMatched = true;
          setCards([...updated]);
          setFlippedIndices([]);
          setMatchedCount((prev) => {
            const nextCount = prev + 1;
            if (nextCount === totalPairs) {
              handleGameComplete();
            } else {
              const praise =
                currentLanguage === 'hi'
                  ? `बहुत सुंदर! आपने ${first.name} का जोड़ा ढूंढ लिया।`
                  : `Wonderful! You found both ${first.name} cards.`;
              setMessage(praise);
              voiceEngine.speak(praise, currentLanguage);
            }
            return nextCount;
          });
        }, 700);
      } else {
        // NO MATCH - Warm, calm encouragement
        setWrongAttempts((prev) => prev + 1);
        setTimeout(() => {
          first.isFlipped = false;
          second.isFlipped = false;
          setCards([...updated]);
          setFlippedIndices([]);
          const calmNote =
            currentLanguage === 'hi'
              ? 'बहुत अच्छा प्रयास! आइए फिर से देखें, कोई जल्दी नहीं है।'
              : 'That was a lovely try! Let us take another peaceful look.';
          setMessage(calmNote);
          voiceEngine.speak(calmNote, currentLanguage);
        }, 1200);
      }
    }
  };

  const handleGameComplete = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    setGameCompleted(true);

    const finishMsg =
      currentLanguage === 'hi'
        ? `अद्भुत, ${patient.preferredName || 'दादू'} जी! आपने शांति से सभी कार्ड मिला लिए।`
        : `Magnificent, ${patient.preferredName || 'Dadu'}! You matched all the pairs peacefully.`;
    setMessage(finishMsg);
    voiceEngine.speak(finishMsg, currentLanguage);

    addGameResult({
      gameType: 'memory_match',
      score: wrongAttempts > 3 ? 85 : 100,
      maxScore: 100,
      difficulty,
      reactionTimeSec: Math.round((elapsedSec / totalPairs) * 10) / 10,
      completed: true,
      notes: `Level ${difficulty} completed in ${elapsedSec}s with ${wrongAttempts} gentle retries.`,
    });
  };

  // Adaptive Next Level progression
  const handleAdvanceLevel = () => {
    if (wrongAttempts <= 1 && difficulty < 3) {
      setDifficulty((prev) => prev + 1);
    } else if (wrongAttempts >= 4 && difficulty > 1) {
      // Gently reduce difficulty
      setDifficulty((prev) => prev - 1);
    } else {
      setupGame(difficulty);
    }
  };

  // Voice Command Processing
  const handleVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    if (text.includes('repeat') || text.includes('again') || text.includes('दोहराएं')) {
      voiceEngine.speak(message, currentLanguage);
      return;
    }

    if (text.includes('start over') || text.includes('restart') || text.includes('फिर से')) {
      setupGame(difficulty);
      return;
    }

    if (text.includes('next') || text.includes('आगे')) {
      if (gameCompleted) {
        handleAdvanceLevel();
      } else {
        const availableIdx = cards.findIndex((c) => !c.isFlipped && !c.isMatched);
        if (availableIdx !== -1) handleCardClick(availableIdx);
      }
      return;
    }

    // Check for card number utterance ("card 1", "card two", "one", "two", "three", etc.)
    const numberWords: { [key: string]: number } = {
      one: 1, '1': 1, 'एक': 1,
      two: 2, '2': 2, 'दो': 2,
      three: 3, '3': 3, 'तीन': 3,
      four: 4, '4': 4, 'चार': 4,
      five: 5, '5': 5, 'पाँच': 5,
      six: 6, '6': 6, 'छह': 6,
      seven: 7, '7': 7, 'सात': 7,
      eight: 8, '8': 8, 'आठ': 8,
    };

    for (const [key, num] of Object.entries(numberWords)) {
      if (text.includes(`card ${key}`) || text === key || text.includes(`कार्ड ${key}`)) {
        const targetIndex = num - 1;
        if (targetIndex >= 0 && targetIndex < cards.length) {
          handleCardClick(targetIndex);
          return;
        }
      }
    }

    // Default gentle acknowledgment
    const gentleReply = `I heard you, ${patient.preferredName || 'Dadu'}. Tap any card or say "Card 1" through "Card ${cards.length}".`;
    setMessage(gentleReply);
    voiceEngine.speak(gentleReply, currentLanguage);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls */}
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
            Pairs Matched: {matchedCount} / {totalPairs}
          </span>
          <span className="text-xs font-bold text-sage-800 bg-sage-100 px-2.5 py-1 rounded-xl">
            Level {difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`touch-target-large px-3 py-2 rounded-2xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-colors ${
              isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
            }`}
            title="Voice control: Say 'Card 1', 'repeat', 'start over'"
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice Control'}</span>
          </button>

          <button
            onClick={() => setupGame(difficulty)}
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
            Sahayak Voice
          </span>
          <p className="text-xl md:text-2xl font-bold text-stone-900 leading-snug">
            {message}
          </p>
        </div>
      </motion.div>

      {/* Card Grid with Calm Framer Motion Transitions (300-500ms, no bounce) */}
      <div
        className={`grid gap-4 sm:gap-6 pt-2 ${
          cards.length <= 4
            ? 'grid-cols-2 max-w-lg mx-auto'
            : cards.length <= 6
            ? 'grid-cols-2 sm:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        {cards.map((card, idx) => {
          const showFace = card.isFlipped || card.isMatched;

          return (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              aria-label={`Card number ${idx + 1}, ${showFace ? card.name : 'hidden'}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`relative h-44 sm:h-52 rounded-3xl border-4 transition-colors duration-400 cursor-pointer shadow-xs hover:shadow-md flex flex-col items-center justify-center overflow-hidden ${
                card.isMatched
                  ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200'
                  : showFace
                  ? 'border-indigoSoft-400 bg-white'
                  : 'border-stone-300 bg-gradient-to-tr from-sage-100 to-indigoSoft-50 hover:border-sage-400'
              }`}
            >
              {/* Card Number for Voice Cue */}
              <span className="absolute top-3 left-3 bg-white/90 px-2.5 py-0.5 rounded-full text-xs font-bold text-stone-700 border border-stone-200 shadow-xs z-10">
                Card {idx + 1}
              </span>

              <AnimatePresence mode="wait">
                {showFace ? (
                  <motion.div
                    key="front"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="w-full h-full p-2 flex flex-col items-center justify-between"
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-32 sm:h-36 object-cover rounded-2xl mt-4"
                    />
                    <p className="text-base sm:text-lg font-bold text-stone-900 truncate px-2 pb-1">
                      {card.name}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="flex flex-col items-center justify-center text-sage-700"
                  >
                    <Sparkles className="w-12 h-12 opacity-40 mb-2" />
                    <span className="text-xl font-bold text-stone-700">Tap to Reveal</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {card.isMatched && (
                <div className="absolute top-3 right-3 bg-emerald-600 text-white rounded-full p-1 shadow-xs z-10">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Completion Dialog Banner */}
      <AnimatePresence>
        {gameCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="p-6 bg-emerald-50 border-3 border-emerald-400 rounded-3xl text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-extrabold text-emerald-950">
              All Pairs Matched Peacefully!
            </h3>
            <p className="text-xl text-emerald-800">
              You remembered all the pictures with calm concentration today, {patient.preferredName || 'Dadu'}.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={handleAdvanceLevel}
                className="touch-target-large px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-2xl shadow-md cursor-pointer"
              >
                {difficulty < 3 && wrongAttempts <= 1 ? 'Play Next Level' : 'Play Again'}
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
