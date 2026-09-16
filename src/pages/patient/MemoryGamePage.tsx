import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Check, RotateCcw, Volume2, Trophy } from 'lucide-react';
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

  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [message, setMessage] = useState('Find the matching pictures. Tap any card.');

  // Initialize Cards
  const setupGame = () => {
    const rawPairs = [
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
    ];

    // Create duplicates
    const combined = [...rawPairs, ...rawPairs].map((item, idx) => ({
      id: idx + 1,
      pairId: item.pairId,
      name: item.name,
      image: item.image,
      isFlipped: false,
      isMatched: false,
    }));

    // Shuffle
    const shuffled = combined.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedCount(0);
    setGameCompleted(false);
    setStartTime(Date.now());

    const intro =
      currentLanguage === 'hi'
        ? `स्मृति कार्ड मिलान खेल में आपका स्वागत है, ${patient.preferredName || 'दादू'} जी। किसी भी कार्ड को छुएं।`
        : currentLanguage === 'as'
        ? `স্মৃতি কাৰ্ড খেললৈ স্বাগতম, ${patient.preferredName || 'দাদু'}। যিকোনো কাৰ্ডত স্পৰ্শ কৰক।`
        : `Welcome to Memory Matching, ${patient.preferredName || 'Dadu'}. Tap any card to reveal its friendly picture.`;

    setMessage(intro);
    voiceEngine.speak(intro, currentLanguage);
  };

  useEffect(() => {
    setupGame();
    return () => voiceEngine.stop();
  }, []);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length >= 2) {
      return;
    }

    // Flip chosen card
    const updated = [...cards];
    updated[index].isFlipped = true;
    setCards(updated);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Speak card name gently
    const cardName = updated[index].name;
    voiceEngine.speak(cardName, currentLanguage);

    if (newFlipped.length === 2) {
      const first = updated[newFlipped[0]];
      const second = updated[newFlipped[1]];

      if (first.pairId === second.pairId) {
        // MATCH FOUND!
        setTimeout(() => {
          first.isMatched = true;
          second.isMatched = true;
          setCards([...updated]);
          setFlippedIndices([]);
          setMatchedCount((prev) => {
            const nextCount = prev + 1;
            if (nextCount === 3) {
              handleGameComplete();
            } else {
              const cheer = `Wonderful! You found both ${first.name} cards.`;
              setMessage(cheer);
              voiceEngine.speak(cheer, currentLanguage);
            }
            return nextCount;
          });
        }, 800);
      } else {
        // NO MATCH - Gentle, encouraging pause
        setTimeout(() => {
          first.isFlipped = false;
          second.isFlipped = false;
          setCards([...updated]);
          setFlippedIndices([]);
          const gentleText = 'Good try! Let us look at the cards again.';
          setMessage(gentleText);
          voiceEngine.speak(gentleText, currentLanguage);
        }, 1400);
      }
    }
  };

  const handleGameComplete = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    setGameCompleted(true);

    const finishMsg = `Magnificent! You matched all the pairs peacefully, ${patient.preferredName || 'Dadu'}!`;
    setMessage(finishMsg);
    voiceEngine.speak(finishMsg, currentLanguage);

    // Record into caregiver analytics store
    addGameResult({
      gameType: 'memory_match',
      score: 100,
      maxScore: 100,
      difficulty: 1,
      reactionTimeSec: elapsedSec > 60 ? 4.5 : Math.round((elapsedSec / 6) * 10) / 10,
      completed: true,
      notes: `Patient matched 3 pairs in ${elapsedSec}s with high engagement.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar with Back Button */}
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

        <span className="text-stone-600 font-bold text-base">
          Pairs Matched: {matchedCount} / 3
        </span>

        <button
          onClick={setupGame}
          className="touch-target-large px-4 py-2 bg-sage-100 hover:bg-sage-200 text-sage-900 rounded-2xl flex items-center gap-2 font-bold text-base cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-sage-700" />
          <span>Play Again</span>
        </button>
      </div>

      {/* Sahayak Audio Instruction Banner */}
      <div className="bg-white border-2 border-sage-200 rounded-3xl p-5 shadow-sm flex items-start gap-4">
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
      </div>

      {/* Card Grid (Minimum 110x130px accessible cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-2">
        {cards.map((card, idx) => {
          const showFace = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              aria-label={`Card number ${idx + 1}, ${showFace ? card.name : 'hidden'}`}
              className={`relative h-44 sm:h-52 rounded-3xl border-4 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-md flex flex-col items-center justify-center overflow-hidden ${
                card.isMatched
                  ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200'
                  : showFace
                  ? 'border-indigoSoft-400 bg-white'
                  : 'border-stone-300 bg-gradient-to-tr from-sage-100 to-indigoSoft-50 hover:border-sage-400'
              }`}
            >
              {/* Card Number for Voice Cue ("Card 1", "Card 2") */}
              <span className="absolute top-3 left-3 bg-white/90 px-2.5 py-0.5 rounded-full text-xs font-bold text-stone-700 border border-stone-200 shadow-xs">
                Card {idx + 1}
              </span>

              {showFace ? (
                <div className="w-full h-full p-2 flex flex-col items-center justify-between">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-32 sm:h-36 object-cover rounded-2xl mt-4"
                  />
                  <p className="text-base sm:text-lg font-bold text-stone-900 truncate px-2 pb-1">
                    {card.name}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-sage-700">
                  <Sparkles className="w-12 h-12 opacity-40 mb-2" />
                  <span className="text-xl font-bold text-stone-700">Tap to Reveal</span>
                </div>
              )}

              {card.isMatched && (
                <div className="absolute top-3 right-3 bg-emerald-600 text-white rounded-full p-1 shadow-sm">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Completion Dialog Banner */}
      {gameCompleted && (
        <div className="p-6 bg-emerald-50 border-3 border-emerald-400 rounded-3xl text-center space-y-4 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
            <Trophy className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-extrabold text-emerald-950">
            All Pairs Matched!
          </h3>
          <p className="text-xl text-emerald-800">
            You remembered all the pictures wonderfully today, {patient.preferredName || 'Dadu'}.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={setupGame}
              className="touch-target-large px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-2xl shadow-md cursor-pointer"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/patient/games')}
              className="touch-target-large px-8 py-3 bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-300 font-bold text-xl rounded-2xl shadow-sm cursor-pointer"
            >
              Choose Another Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
