import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Trophy, RotateCcw, Check, ArrowUpDown, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

interface SequenceItem {
  id: string;
  order: number; // 1-indexed correct order
  title: string;
  titleHi: string;
  detail: string;
  iconBg: string;
}

export const SequenceGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, patient, addGameResult } = useAppStore();

  const [difficulty, setDifficulty] = useState<number>(1);
  const [items, setItems] = useState<SequenceItem[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [swapCount, setSwapCount] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const poolSequences: SequenceItem[] = [
    {
      id: 'step-1',
      order: 1,
      title: '1. Wake up & Morning Warm Water',
      titleHi: '1. जागना और सुबह का गुनगुना पानी',
      detail: 'Start the day peacefully at 7:00 AM',
      iconBg: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'step-2',
      order: 2,
      title: '2. Sip Fresh Assam Tea with Priya',
      titleHi: '2. प्रिया के साथ ताज़ा चाय पीना',
      detail: 'Enjoy the gentle morning breeze on the verandah',
      iconBg: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'step-3',
      order: 3,
      title: '3. Nourishing Breakfast & Medicine',
      titleHi: '3. पौष्टिक नाश्ता और सुबह की दवा',
      detail: 'Amlodipine tablet with breakfast at 8:30 AM',
      iconBg: 'bg-indigoSoft-100 text-indigoSoft-800',
    },
    {
      id: 'step-4',
      order: 4,
      title: '4. Brain Games with Sahayak',
      titleHi: '4. सहायक के साथ मस्तिष्क खेल',
      detail: 'Memory matching and family photo recognition at 10:30 AM',
      iconBg: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'step-5',
      order: 5,
      title: '5. Afternoon Rest & Soothing Music',
      titleHi: '5. दोपहर का विश्राम और शांत संगीत',
      detail: 'Calm instrumental flute music in the armchair',
      iconBg: 'bg-stone-200 text-stone-800',
    },
  ];

  const totalSteps = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;

  const setupLevel = useCallback((lvl: number) => {
    const count = lvl === 1 ? 3 : lvl === 2 ? 4 : 5;
    const currentPool = poolSequences.slice(0, count);

    // Shuffle so it is genuinely out of order
    let shuffled = [...currentPool].sort(() => Math.random() - 0.5);
    // Ensure it's not already solved on spawn
    if (shuffled.every((item, idx) => item.order === idx + 1)) {
      shuffled = [shuffled[1], shuffled[0], ...shuffled.slice(2)];
    }

    setItems(shuffled);
    setSelectedItemIndex(null);
    setIsCompleted(false);
    setSwapCount(0);
    setStartTime(Date.now());

    const intro =
      currentLanguage === 'hi'
        ? `दिनचर्या क्रम खेल: इन ${count} गतिविधियों को सही समय क्रम में लगाएं। पहले गतिविधि को छुएं, फिर जहां रखना है उसे छुएं।`
        : `Routine Sequence: Arrange these ${count} daily activities into the correct order, ${patient.preferredName || 'Dadu'}. Tap one card, then tap another to swap them into order.`;

    setMessage(intro);
    voiceEngine.speak(intro, currentLanguage);
  }, [currentLanguage, patient.preferredName]);

  useEffect(() => {
    setupLevel(difficulty);
    return () => voiceEngine.stop();
  }, [difficulty, setupLevel]);

  const handleCardTap = (index: number) => {
    if (isCompleted) return;

    if (selectedItemIndex === null) {
      setSelectedItemIndex(index);
      const chosen = items[index];
      const title = currentLanguage === 'hi' ? chosen.titleHi : chosen.title;
      const prompt = `Selected "${title}". Now tap the card you want to swap it with.`;
      setMessage(prompt);
      voiceEngine.speak(`Selected. Now choose card to swap with.`, currentLanguage);
    } else {
      // Perform calm swap
      const updated = [...items];
      const temp = updated[selectedItemIndex];
      updated[selectedItemIndex] = updated[index];
      updated[index] = temp;

      setItems(updated);
      setSelectedItemIndex(null);
      setSwapCount((prev) => prev + 1);

      // Check if sequence is now in order
      const isSorted = updated.every((it, idx) => it.order === idx + 1);
      if (isSorted) {
        handleFinishSequence();
      } else {
        const encouragement =
          currentLanguage === 'hi'
            ? 'कार्ड बदल दिए गए। देखिए कौन सा कदम अभी सही जगह पर आना बाकी है।'
            : 'Cards swapped. Take a peaceful look to see what comes next.';
        setMessage(encouragement);
        voiceEngine.speak(encouragement, currentLanguage);
      }
    }
  };

  const handleFinishSequence = () => {
    setIsCompleted(true);
    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    const celebration =
      currentLanguage === 'hi'
        ? `बहुत सुंदर, ${patient.preferredName || 'दादू'} जी! आपकी दिनचर्या बिल्कुल सही क्रम में व्यवस्थित हो गई है।`
        : `Magnificent, ${patient.preferredName || 'Dadu'}! You put the entire routine into peaceful order.`;

    setMessage(celebration);
    voiceEngine.speak(celebration, currentLanguage);

    addGameResult({
      gameType: 'sequence_arranging',
      score: swapCount > totalSteps + 2 ? 85 : 100,
      maxScore: 100,
      difficulty,
      reactionTimeSec: Math.round((elapsed / totalSteps) * 10) / 10,
      completed: true,
      notes: `Arranged ${totalSteps} sequence steps in ${elapsed}s (Level ${difficulty}).`,
    });
  };

  // Voice Command Processing
  const handleVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    if (text.includes('repeat') || text.includes('दोहराएं')) {
      voiceEngine.speak(message, currentLanguage);
      return;
    }

    if (text.includes('start over') || text.includes('restart')) {
      setupLevel(difficulty);
      return;
    }

    if (text.includes('next') || text.includes('आगे')) {
      if (isCompleted) handleAdvanceLevel();
      return;
    }

    // Number word match for card positions ("first", "second", "third", "one", "two")
    const posMap: { [key: string]: number } = {
      one: 0, '1': 0, first: 0, पहला: 0,
      two: 1, '2': 1, second: 1, दूसरा: 1,
      three: 2, '3': 2, third: 2, तीसरा: 2,
      four: 3, '4': 3, fourth: 3, चौथा: 3,
      five: 4, '5': 4, fifth: 4, पाँचवाँ: 4,
    };

    for (const [key, idx] of Object.entries(posMap)) {
      if (text.includes(`card ${key}`) || text === key || text.includes(key)) {
        if (idx < items.length) {
          handleCardTap(idx);
          return;
        }
      }
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
    if (swapCount <= totalSteps && difficulty < 3) {
      setDifficulty((prev) => prev + 1);
    } else if (swapCount > totalSteps * 2 && difficulty > 1) {
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
            {totalSteps} Steps to Order
          </span>
          <span className="text-xs font-bold text-indigoSoft-800 bg-indigoSoft-100 px-2.5 py-1 rounded-xl">
            Level {difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`touch-target-large px-3 py-2 rounded-2xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-colors ${
              isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
            }`}
            title="Voice control: Say 'card 1', 'card 2'"
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

      {/* Sequence Cards with Calm Framer Motion Layout Reordering */}
      <div className="space-y-3 pt-2">
        {items.map((item, idx) => {
          const isSelected = selectedItemIndex === idx;
          const isInCorrectPosition = item.order === idx + 1;

          return (
            <motion.div
              layout
              key={item.id}
              onClick={() => handleCardTap(idx)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className={`touch-target-large p-4 sm:p-5 rounded-3xl border-3 transition-colors duration-300 flex items-center justify-between gap-4 cursor-pointer select-none ${
                isSelected
                  ? 'bg-amber-50 border-amber-500 ring-4 ring-amber-200 scale-[1.01]'
                  : isInCorrectPosition && isCompleted
                  ? 'bg-emerald-50 border-emerald-500'
                  : 'bg-white border-stone-200 hover:border-sage-400 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-300 flex items-center justify-center font-extrabold text-xl text-stone-700 shrink-0">
                  #{idx + 1}
                </span>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                    {currentLanguage === 'hi' ? item.titleHi : item.title}
                  </h3>
                  <p className="text-sm text-stone-500 font-medium mt-0.5">{item.detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isInCorrectPosition && isCompleted ? (
                  <Check className="w-8 h-8 text-emerald-600" />
                ) : (
                  <div className="p-2 text-stone-400 hover:text-stone-700">
                    <ArrowUpDown className="w-6 h-6" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
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
              Routine Perfectly Arranged!
            </h3>
            <p className="text-xl text-emerald-800">
              You arranged the day's schedule with wonderful clarity, {patient.preferredName || 'Dadu'}.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={handleAdvanceLevel}
                className="touch-target-large px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-2xl shadow-md cursor-pointer"
              >
                {difficulty < 3 ? 'Play Next Level' : 'Play Again'}
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
