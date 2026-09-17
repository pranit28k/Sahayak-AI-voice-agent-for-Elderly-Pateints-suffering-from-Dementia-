import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, HelpCircle, Check, ArrowRight, Trophy, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

export const FaceRecognitionGame: React.FC = () => {
  const navigate = useNavigate();
  const { familyMembers, addGameResult, currentLanguage, patient } = useAppStore();

  const [difficulty, setDifficulty] = useState<number>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [guidanceText, setGuidanceText] = useState('');
  const [gameFinished, setGameFinished] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const activeMember = familyMembers[currentIndex] || familyMembers[0];

  // Generate dynamic choices based on difficulty level
  const generateChoices = useCallback(() => {
    if (!activeMember) return [];
    const correctName = activeMember.name;
    const distractors = familyMembers
      .filter((m) => m.name !== correctName)
      .map((m) => m.name);

    // Level 1: 2 choices; Level 2: 3 choices; Level 3: 4 choices
    const count = difficulty === 1 ? 1 : difficulty === 2 ? 2 : 3;
    const pool = [correctName, ...distractors.slice(0, count)];

    if (pool.length < count + 1) {
      if (!pool.includes('Sunita')) pool.push('Sunita (Sister)');
      if (!pool.includes('Dr. Neha')) pool.push('Dr. Neha');
    }

    return pool.sort();
  }, [activeMember, difficulty, familyMembers]);

  const choices = generateChoices();

  const askQuestion = useCallback(() => {
    if (!activeMember) return;
    setSelectedAnswer(null);

    const levelTag = difficulty === 1 ? 'Gentle' : difficulty === 2 ? 'Comfortable' : 'Attentive';
    const questionText =
      currentLanguage === 'hi'
        ? `तस्वीर में यह कौन मुस्कुरा रहे हैं, ${patient.preferredName || 'दादू'} जी?`
        : currentLanguage === 'as'
        ? `ছবিত এয়া কোনে হাঁহি আছে, ${patient.preferredName || 'দাদু'}?`
        : `Who is this smiling in the picture, ${patient.preferredName || 'Dadu'}? (${levelTag} Level)`;

    setGuidanceText(questionText);
    voiceEngine.speak(questionText, currentLanguage);
  }, [activeMember, currentLanguage, difficulty, patient.preferredName]);

  useEffect(() => {
    askQuestion();
  }, [currentIndex, difficulty, askQuestion]);

  const handleSelectChoice = (chosenName: string) => {
    setSelectedAnswer(chosenName);

    if (chosenName === activeMember.name) {
      const praise =
        currentLanguage === 'hi'
          ? `बिल्कुल सही! यह आपकी ${activeMember.relation}, ${activeMember.name} हैं।`
          : `Yes, wonderful! This is your ${activeMember.relation}, ${activeMember.name}.`;
      setGuidanceText(praise);
      voiceEngine.speak(praise, currentLanguage);
    } else {
      setIncorrectAttempts((prev) => prev + 1);
      // Gentle, warm encouragement - never harsh
      const gentleCorrection =
        currentLanguage === 'hi'
          ? `बहुत अच्छा प्रयास! यह ${activeMember.name} हैं, आपकी ${activeMember.relation}।`
          : `That was a very close try! This is ${activeMember.name}, your ${activeMember.relation}.`;
      setGuidanceText(gentleCorrection);
      voiceEngine.speak(gentleCorrection, currentLanguage);
    }
  };

  const handleHearHint = () => {
    const hint = `This person loves you dearly and is your ${activeMember.relation}.`;
    setGuidanceText(hint);
    voiceEngine.speak(hint, currentLanguage);
  };

  const handleNext = () => {
    if (currentIndex + 1 < familyMembers.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all members
      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      setGameFinished(true);

      const endMsg =
        currentLanguage === 'hi'
          ? `शानदार, ${patient.preferredName || 'दादू'} जी! आपने अपने परिवार के सभी सदस्यों को पहचान लिया।`
          : `You recognized all our family members wonderfully today, ${patient.preferredName || 'Dadu'}!`;
      setGuidanceText(endMsg);
      voiceEngine.speak(endMsg, currentLanguage);

      addGameResult({
        gameType: 'face_recognition',
        score: incorrectAttempts > 2 ? 85 : 100,
        maxScore: 100,
        difficulty,
        reactionTimeSec: 4.1,
        completed: true,
        notes: `Recognized family members in ${elapsed}s (Level ${difficulty}).`,
      });
    }
  };

  const handleAdvanceDifficulty = () => {
    if (incorrectAttempts <= 1 && difficulty < 3) {
      setDifficulty((prev) => prev + 1);
    } else if (incorrectAttempts >= 3 && difficulty > 1) {
      setDifficulty((prev) => prev - 1);
    }
    setCurrentIndex(0);
    setGameFinished(false);
    setIncorrectAttempts(0);
    setStartTime(Date.now());
  };

  // Voice Command Processing
  const handleVoiceInput = (rawSpoken: string) => {
    const text = rawSpoken.toLowerCase().trim();

    if (text.includes('repeat') || text.includes('again') || text.includes('दोहराएं')) {
      voiceEngine.speak(guidanceText, currentLanguage);
      return;
    }

    if (text.includes('hint') || text.includes('help') || text.includes('मदद')) {
      handleHearHint();
      return;
    }

    if (text.includes('next') || text.includes('आगे')) {
      if (selectedAnswer) handleNext();
      return;
    }

    if (text.includes('start over') || text.includes('restart')) {
      setCurrentIndex(0);
      setGameFinished(false);
      setIncorrectAttempts(0);
      askQuestion();
      return;
    }

    // Check if spoken text matches any choice
    const matchedChoice = choices.find((c) => text.includes(c.toLowerCase()));
    if (matchedChoice) {
      handleSelectChoice(matchedChoice);
      return;
    }

    // Position cues: "first one", "second one", "that one"
    if (text.includes('first') || text.includes('one') || text.includes('पहला')) {
      if (choices[0]) handleSelectChoice(choices[0]);
      return;
    }
    if (text.includes('second') || text.includes('two') || text.includes('दूसरा')) {
      if (choices[1]) handleSelectChoice(choices[1]);
      return;
    }
    if (text.includes('third') || text.includes('three') || text.includes('तीसरा')) {
      if (choices[2]) handleSelectChoice(choices[2]);
      return;
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
          handleVoiceInput(spoken);
          setIsListening(false);
        }
      },
      onSpeechEnd: () => setIsListening(false),
      onError: () => setIsListening(false),
    });
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

        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-bold text-base">
            Photo {currentIndex + 1} of {familyMembers.length}
          </span>
          <span className="text-xs font-bold text-indigoSoft-800 bg-indigoSoft-100 px-2.5 py-1 rounded-xl">
            Level {difficulty}
          </span>
        </div>

        <button
          onClick={toggleMic}
          className={`touch-target-large px-3 py-2 rounded-2xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-colors ${
            isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
          }`}
          title="Speak answer: Say 'Priya', 'that one', 'hint', 'next'"
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
        </button>
      </div>

      {/* Sahayak Guidance Banner with Calm Framer Motion layout */}
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
            Sahayak
          </span>
          <p className="text-2xl font-bold text-stone-900 leading-snug">
            {guidanceText}
          </p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!gameFinished ? (
          <motion.div
            key={activeMember.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6"
          >
            {/* Family Member Portrait */}
            <div className="relative w-full max-w-sm mx-auto h-64 sm:h-72 rounded-3xl overflow-hidden shadow-sm border-4 border-sage-100">
              <img
                src={activeMember.photoUrl}
                alt="Family Member"
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleHearHint}
                className="absolute bottom-3 right-3 bg-white/95 text-sage-800 hover:bg-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-sage-600" />
                <span>Hear a Hint</span>
              </button>
            </div>

            {/* Large Multiple Choice Buttons (88px+ targets, calm transitions) */}
            <div className="space-y-3 pt-2">
              {choices.map((name, idx) => {
                const isSelected = selectedAnswer === name;
                const isRight = name === activeMember.name;

                let btnStyle = 'border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800';
                if (selectedAnswer) {
                  if (isRight) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-4 ring-emerald-200';
                  } else if (isSelected) {
                    btnStyle = 'border-amber-400 bg-amber-50 text-amber-950';
                  }
                }

                return (
                  <motion.button
                    key={name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.08, ease: 'easeOut' }}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleSelectChoice(name)}
                    className={`w-full touch-target-large p-4 rounded-2xl border-3 text-left font-bold text-2xl md:text-3xl flex items-center justify-between transition-colors duration-300 cursor-pointer ${btnStyle}`}
                  >
                    <span>{name}</span>
                    {selectedAnswer && isRight && (
                      <Check className="w-8 h-8 text-emerald-600" />
                    )}
                  </motion.button>
                );
              })}
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
                  <span>Next Family Photo</span>
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
              Family Photo Session Complete!
            </h3>
            <p className="text-xl text-emerald-800">
              You recognized your family with such warmth and joy today, {patient.preferredName || 'Dadu'}.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-3">
              <button
                onClick={handleAdvanceDifficulty}
                className="touch-target-large px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-2xl shadow-md cursor-pointer"
              >
                {difficulty < 3 && incorrectAttempts <= 1 ? 'Play Next Level' : 'Play Again'}
              </button>
              <button
                onClick={() => navigate('/patient/family')}
                className="touch-target-large px-8 py-3 bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-300 font-bold text-xl rounded-2xl shadow-xs cursor-pointer"
              >
                View Full Family Tree
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
