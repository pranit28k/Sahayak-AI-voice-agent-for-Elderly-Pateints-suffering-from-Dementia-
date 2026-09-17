import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Trophy, Check, HelpCircle, ArrowRight, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

interface NamingItem {
  id: string;
  name: string;
  nameHi: string;
  imageUrl: string;
  acceptedAliases: string[];
  hint: string;
}

export const ObjectNamingGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, patient, addGameResult } = useAppStore();

  const [difficulty, setDifficulty] = useState<number>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [misses, setMisses] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const poolObjects: NamingItem[] = [
    {
      id: 'tea',
      name: 'Cup of Assam Tea',
      nameHi: 'असम चाय का प्याला',
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      acceptedAliases: ['tea', 'chai', 'cup', 'tea cup', 'chaha', 'चाय', 'कप'],
      hint: 'A warm, soothing drink you enjoy every morning with Priya.',
    },
    {
      id: 'radio',
      name: 'Transistor Radio',
      nameHi: 'ट्रांजिस्टर रेडियो',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
      acceptedAliases: ['radio', 'transistor', 'music', 'songs', 'रेडियो', 'संगीत'],
      hint: 'Plays your favourite Rabindra Sangeet and old instrumental melodies.',
    },
    {
      id: 'shawl',
      name: 'Warm Woollen Shawl',
      nameHi: 'गर्म ऊनी शॉल',
      imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80',
      acceptedAliases: ['shawl', 'wool', 'chadar', 'blanket', 'warm', 'शॉल', 'चादर'],
      hint: 'Keeps you warm and comfortable on chilly mornings on the balcony.',
    },
    {
      id: 'glasses',
      name: 'Reading Spectacles',
      nameHi: 'पढ़ने का चश्मा',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
      acceptedAliases: ['glasses', 'spectacles', 'specs', 'chashma', 'चश्मा'],
      hint: 'Rests on your bedside table so you can read the morning newspaper.',
    },
  ];

  const totalCount = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;
  const activeObjects = poolObjects.slice(0, totalCount);
  const currentItem = activeObjects[currentIndex] || activeObjects[0];

  // Dynamic choices for tap assistance
  const generateChoices = useCallback(() => {
    const correct = currentItem.name;
    const others = poolObjects.filter((o) => o.name !== correct).map((o) => o.name);
    const count = difficulty === 1 ? 1 : 2;
    return [correct, ...others.slice(0, count)].sort();
  }, [currentItem.name, difficulty]);

  const choices = generateChoices();

  const promptItem = useCallback(() => {
    setSelectedAnswer(null);

    const question =
      currentLanguage === 'hi'
        ? `तस्वीर में यह कौन सी परिचित वस्तु है, ${patient.preferredName || 'दादू'} जी? बोलकर बताएं या नीचे छुएं।`
        : `What is this familiar object in the picture, ${patient.preferredName || 'Dadu'}? Speak its name or touch the card below.`;

    setMessage(question);
    voiceEngine.speak(question, currentLanguage);
  }, [currentLanguage, patient.preferredName]);

  useEffect(() => {
    promptItem();
  }, [currentIndex, difficulty, promptItem]);

  const handleEvaluateAnswer = (chosenText: string) => {
    setSelectedAnswer(chosenText);
    const lower = chosenText.toLowerCase().trim();

    // Fuzzy matching against accepted aliases
    const isMatch =
      currentItem.acceptedAliases.some((alias) => lower.includes(alias.toLowerCase())) ||
      lower.includes(currentItem.name.toLowerCase());

    if (isMatch) {
      const praise =
        currentLanguage === 'hi'
          ? `शाबाश! यह बिल्कुल सही है — ${currentItem.nameHi}।`
          : `Splendid! That is exactly right — ${currentItem.name}.`;
      setMessage(praise);
      voiceEngine.speak(praise, currentLanguage);
    } else {
      setMisses((prev) => prev + 1);
      const gentle =
        currentLanguage === 'hi'
          ? `बहुत अच्छा प्रयास! यह ${currentItem.nameHi} है।`
          : `That was a lovely try! This is ${currentItem.name}.`;
      setMessage(gentle);
      voiceEngine.speak(gentle, currentLanguage);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeObjects.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all items
      setIsCompleted(true);
      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));

      const celebration =
        currentLanguage === 'hi'
          ? `शानदार, ${patient.preferredName || 'दादू'} जी! आपने सभी परिचित वस्तुओं के नाम बहुत सुंदर तरह से बताए।`
          : `Magnificent, ${patient.preferredName || 'Dadu'}! You named all the familiar objects with such ease.`;
      setMessage(celebration);
      voiceEngine.speak(celebration, currentLanguage);

      addGameResult({
        gameType: 'object_naming',
        score: misses > 2 ? 85 : 100,
        maxScore: 100,
        difficulty,
        reactionTimeSec: 3.9,
        completed: true,
        notes: `Named ${activeObjects.length} objects in ${elapsed}s (Level ${difficulty}).`,
      });
    }
  };

  const handleHearHint = () => {
    setMessage(currentItem.hint);
    voiceEngine.speak(currentItem.hint, currentLanguage);
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

    if (text.includes('next') || text.includes('आगे')) {
      if (selectedAnswer) handleNext();
      return;
    }

    if (text.includes('start over') || text.includes('restart')) {
      setCurrentIndex(0);
      setIsCompleted(false);
      setMisses(0);
      promptItem();
      return;
    }

    // Direct object name spoken
    handleEvaluateAnswer(text);
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
    } else if (misses > 2 && difficulty > 1) {
      setDifficulty((prev) => prev - 1);
    }
    setCurrentIndex(0);
    setIsCompleted(false);
    setMisses(0);
    setStartTime(Date.now());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
            Item {currentIndex + 1} of {activeObjects.length}
          </span>
          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-xl">
            Level {difficulty}
          </span>
        </div>

        <button
          onClick={toggleMic}
          className={`touch-target-large px-3 py-2 rounded-2xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-colors ${
            isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
          }`}
          title="Voice: Speak the object name aloud"
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Speak'}</span>
        </button>
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

      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6"
          >
            {/* Object Photograph */}
            <div className="relative w-full max-w-sm mx-auto h-64 sm:h-72 rounded-3xl overflow-hidden shadow-sm border-4 border-sage-100">
              <img
                src={currentItem.imageUrl}
                alt="Everyday object"
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleHearHint}
                className="absolute bottom-3 right-3 bg-white/95 text-sage-800 hover:bg-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-sage-600" />
                <span>Hear Hint</span>
              </button>
            </div>

            {/* Voice Prompt Action Button */}
            <div className="text-center">
              <button
                onClick={toggleMic}
                className={`touch-target-large mx-auto px-6 py-3 rounded-2xl font-bold text-xl flex items-center gap-3 transition-all cursor-pointer shadow-md ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200'
                    : 'bg-sage-600 hover:bg-sage-700 text-white'
                }`}
              >
                <Mic className="w-7 h-7" />
                <span>{isListening ? 'Listening to your voice...' : 'Press & Say the Name'}</span>
              </button>
            </div>

            {/* Tap Choices Alternative */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 text-center mb-3">
                Or tap one of these cards:
              </p>
              <div className="space-y-3">
                {choices.map((name) => {
                  const isSelected = selectedAnswer === name;
                  const isRight = name === currentItem.name;

                  let btnStyle = 'border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800';
                  if (selectedAnswer) {
                    if (isRight) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-4 ring-emerald-200';
                    } else if (isSelected) {
                      btnStyle = 'border-amber-400 bg-amber-50 text-amber-950';
                    }
                  }

                  return (
                    <button
                      key={name}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleEvaluateAnswer(name)}
                      className={`w-full touch-target-large p-4 rounded-2xl border-3 text-left font-bold text-2xl flex items-center justify-between transition-colors duration-300 cursor-pointer ${btnStyle}`}
                    >
                      <span>{name}</span>
                      {selectedAnswer && isRight && <Check className="w-7 h-7 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Button after answering */}
            {selectedAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="pt-2 flex justify-end"
              >
                <button
                  onClick={handleNext}
                  className="touch-target-large px-8 py-3 bg-sage-600 hover:bg-sage-700 active:scale-98 text-white rounded-2xl text-2xl font-bold flex items-center gap-3 shadow-md cursor-pointer transition-all"
                >
                  <span>Next Object</span>
                  <ArrowRight className="w-7 h-7" />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="finish"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="p-8 bg-emerald-50 border-3 border-emerald-400 rounded-3xl text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-extrabold text-emerald-950">
              All Objects Named!
            </h3>
            <p className="text-xl text-emerald-800">
              You recognized all the familiar household items with such warmth, {patient.preferredName || 'Dadu'}.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-3">
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
