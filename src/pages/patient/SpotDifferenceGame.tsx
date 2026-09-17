import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Trophy, RotateCcw, HelpCircle, Check, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

interface DifferenceItem {
  id: string;
  name: string;
  nameHi: string;
  x: number; // percentage in image
  y: number;
  radius: number; // percentage
  hint: string;
}

export const SpotDifferenceGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, patient, addGameResult } = useAppStore();

  const [difficulty, setDifficulty] = useState<number>(1);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [isListening, setIsListening] = useState(false);
  const [misses, setMisses] = useState(0);

  // Defined differences for the serene balcony tea scene
  const allDifferences: DifferenceItem[] = [
    {
      id: 'marigold',
      name: 'Yellow Flower in Vase',
      nameHi: 'फूलदान में पीला फूल',
      x: 24,
      y: 35,
      radius: 12,
      hint: 'Look near the flower vase on the left table.',
    },
    {
      id: 'biscuit',
      name: 'Tea Biscuit on Plate',
      nameHi: 'प्लेट में बिस्कुट',
      x: 62,
      y: 68,
      radius: 10,
      hint: 'Look closely at the saucer beside the warm tea cup.',
    },
    {
      id: 'bird',
      name: 'Little Bird on Balcony Railing',
      nameHi: 'रेलिंग पर छोटी चिड़िया',
      x: 82,
      y: 22,
      radius: 11,
      hint: 'Look at the balcony railing near the morning sky.',
    },
    {
      id: 'spectacles',
      name: 'Reading Spectacles on Book',
      nameHi: 'किताब पर चश्मा',
      x: 38,
      y: 78,
      radius: 10,
      hint: 'Look near the reading book on the wooden table.',
    },
  ];

  // Number of differences per level
  const activeCount = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;
  const activeDifferences = allDifferences.slice(0, activeCount);

  const setupLevel = useCallback((lvl: number) => {
    setFoundIds([]);
    setIsCompleted(false);
    setMisses(0);
    setStartTime(Date.now());

    const count = lvl === 1 ? 2 : lvl === 2 ? 3 : 4;
    const intro =
      currentLanguage === 'hi'
        ? `अंतर पहचानें खेल: इन दो तस्वीरों में ${count} अंतर हैं। किसी भी अंतर को छुएं या बोलें।`
        : `Spot the Difference: There are ${count} gentle differences between these two pictures, ${patient.preferredName || 'Dadu'}. Tap the difference or speak it aloud.`;

    setMessage(intro);
    voiceEngine.speak(intro, currentLanguage);
  }, [currentLanguage, patient.preferredName]);

  useEffect(() => {
    setupLevel(difficulty);
    return () => voiceEngine.stop();
  }, [difficulty, setupLevel]);

  const handleSpotTap = (diff: DifferenceItem) => {
    if (foundIds.includes(diff.id) || isCompleted) return;

    const updated = [...foundIds, diff.id];
    setFoundIds(updated);

    const diffName = currentLanguage === 'hi' ? diff.nameHi : diff.name;
    const praise =
      currentLanguage === 'hi'
        ? `शाबाश! आपने ${diffName} ढूंढ लिया।`
        : `Well done! You found the ${diffName}.`;
    setMessage(praise);
    voiceEngine.speak(praise, currentLanguage);

    if (updated.length === activeDifferences.length) {
      handleCompleteGame();
    }
  };

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCompleted) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if click was inside any unfound difference hit target
    const hit = activeDifferences.find((d) => {
      if (foundIds.includes(d.id)) return false;
      const dx = clickX - d.x;
      const dy = clickY - d.y;
      return Math.sqrt(dx * dx + dy * dy) <= d.radius;
    });

    if (hit) {
      handleSpotTap(hit);
    } else {
      // Near-miss gentle feedback
      setMisses((prev) => prev + 1);
      const gentle =
        currentLanguage === 'hi'
          ? 'अच्छा प्रयास! थोड़ा और ध्यान से देखें, कोई जल्दी नहीं है।'
          : 'That was a good look! Take another gentle look around the picture.';
      setMessage(gentle);
      voiceEngine.speak(gentle, currentLanguage);
    }
  };

  const handleCompleteGame = () => {
    setIsCompleted(true);
    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    const celebration =
      currentLanguage === 'hi'
        ? `अद्भुत, ${patient.preferredName || 'दादू'} जी! आपने शांति से सभी अंतर पहचान लिए।`
        : `Wonderful, ${patient.preferredName || 'Dadu'}! You spotted all the peaceful differences.`;
    setMessage(celebration);
    voiceEngine.speak(celebration, currentLanguage);

    addGameResult({
      gameType: 'spot_difference',
      score: misses > 3 ? 85 : 100,
      maxScore: 100,
      difficulty,
      reactionTimeSec: Math.round((elapsed / activeDifferences.length) * 10) / 10,
      completed: true,
      notes: `Found ${activeDifferences.length} differences in ${elapsed}s (Level ${difficulty}).`,
    });
  };

  const handleGiveHint = () => {
    const unfound = activeDifferences.find((d) => !foundIds.includes(d.id));
    if (!unfound) return;

    setMessage(unfound.hint);
    voiceEngine.speak(unfound.hint, currentLanguage);
  };

  // Voice Command Processing
  const handleVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    if (text.includes('hint') || text.includes('help') || text.includes('मदद')) {
      handleGiveHint();
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

    // Keyword match for differences
    if (text.includes('flower') || text.includes('marigold') || text.includes('फूल')) {
      const target = activeDifferences.find((d) => d.id === 'marigold');
      if (target) handleSpotTap(target);
      return;
    }
    if (text.includes('biscuit') || text.includes('tea') || text.includes('बिस्कुट') || text.includes('चाय')) {
      const target = activeDifferences.find((d) => d.id === 'biscuit');
      if (target) handleSpotTap(target);
      return;
    }
    if (text.includes('bird') || text.includes('चिड़िया')) {
      const target = activeDifferences.find((d) => d.id === 'bird');
      if (target) handleSpotTap(target);
      return;
    }
    if (text.includes('spectacles') || text.includes('glasses') || text.includes('book') || text.includes('चश्मा')) {
      const target = activeDifferences.find((d) => d.id === 'spectacles');
      if (target) handleSpotTap(target);
      return;
    }

    // Default gentle guidance
    const unfound = activeDifferences.find((d) => !foundIds.includes(d.id));
    if (unfound) {
      setMessage(unfound.hint);
      voiceEngine.speak(unfound.hint, currentLanguage);
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
    if (misses <= 1 && difficulty < 3) {
      setDifficulty((prev) => prev + 1);
    } else if (misses >= 3 && difficulty > 1) {
      setDifficulty((prev) => prev - 1);
    } else {
      setupLevel(difficulty);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            Differences Found: {foundIds.length} / {activeDifferences.length}
          </span>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-xl">
            Level {difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGiveHint}
            className="touch-target-large px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <span className="hidden sm:inline">Hear a Hint</span>
          </button>

          <button
            onClick={toggleMic}
            className={`touch-target-large px-3 py-2 rounded-2xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-colors ${
              isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
            }`}
            title="Voice control: Say 'flower', 'biscuit', 'hint'"
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

      {/* Two Calm Side-by-Side Illustrated Scenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Scene 1: Original Picture */}
        <div className="bg-white rounded-3xl border-3 border-stone-300 p-4 shadow-sm flex flex-col items-center">
          <span className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-2">
            Picture 1 (Original)
          </span>
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 select-none">
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=80"
              alt="Verandah morning scene original"
              className="w-full h-full object-cover"
            />
            {/* Found visual highlight indicators on left */}
            {activeDifferences.map((diff) => {
              const isFound = foundIds.includes(diff.id);
              if (!isFound) return null;

              return (
                <motion.div
                  key={`left-${diff.id}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    left: `${diff.x}%`,
                    top: `${diff.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute w-14 h-14 rounded-full border-4 border-emerald-500 bg-emerald-500/20 pointer-events-none flex items-center justify-center text-white"
                >
                  <Check className="w-6 h-6 text-emerald-700 drop-shadow" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Scene 2: Interactive Second Picture with Differences */}
        <div className="bg-white rounded-3xl border-3 border-amber-300 p-4 shadow-sm flex flex-col items-center">
          <span className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-2">
            Picture 2 (Tap the Differences Here)
          </span>
          <div
            onClick={handleBoardClick}
            className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-amber-200 bg-amber-50/50 cursor-crosshair select-none"
          >
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=80"
              alt="Verandah morning scene with subtle differences"
              className="w-full h-full object-cover filter contrast-105"
            />

            {/* Found difference highlight rings with calm pulse */}
            {activeDifferences.map((diff) => {
              const isFound = foundIds.includes(diff.id);
              if (!isFound) return null;

              return (
                <motion.div
                  key={`right-${diff.id}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    left: `${diff.x}%`,
                    top: `${diff.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute w-14 h-14 rounded-full border-4 border-emerald-500 bg-emerald-500/20 pointer-events-none flex items-center justify-center text-white shadow-md"
                >
                  <Check className="w-6 h-6 text-emerald-700 drop-shadow" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Found items checklist */}
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-center gap-4">
        {activeDifferences.map((d) => {
          const isFound = foundIds.includes(d.id);
          return (
            <div
              key={d.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold border ${
                isFound
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-white text-stone-500 border-stone-300'
              }`}
            >
              {isFound ? <Check className="w-5 h-5 text-emerald-600" /> : <div className="w-5 h-5 rounded-full border border-stone-400" />}
              <span>{currentLanguage === 'hi' ? d.nameHi : d.name}</span>
            </div>
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
              All Differences Spotted!
            </h3>
            <p className="text-xl text-emerald-800">
              You found all the gentle details with such sharp observation, {patient.preferredName || 'Dadu'}.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={handleAdvanceLevel}
                className="touch-target-large px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-2xl shadow-md cursor-pointer"
              >
                {difficulty < 3 && misses <= 1 ? 'Play Next Level' : 'Play Again'}
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
