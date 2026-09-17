import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Trophy, RotateCcw, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

interface Dot {
  num: number;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

interface ShapeTemplate {
  name: string;
  nameHi: string;
  dots: Dot[];
  svgFinalPath: string;
}

export const ConnectDotsGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, patient, addGameResult } = useAppStore();

  const [difficulty, setDifficulty] = useState<number>(1);
  const [currentDot, setCurrentDot] = useState<number>(1);
  const [connectedDots, setConnectedDots] = useState<number[]>([1]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [wrongClicks, setWrongClicks] = useState(0);
  const [isListening, setIsListening] = useState(false);

  // Shapes tailored for calm recognition
  const shapes: { [key: number]: ShapeTemplate } = {
    1: {
      name: 'Assam Tea Leaf',
      nameHi: 'चाय की पत्ती',
      dots: [
        { num: 1, x: 20, y: 75 },
        { num: 2, x: 35, y: 30 },
        { num: 3, x: 70, y: 25 },
        { num: 4, x: 80, y: 75 },
      ],
      svgFinalPath: 'M 20 75 Q 35 30 70 25 Q 80 75 20 75 Z',
    },
    2: {
      name: 'Loving Heart',
      nameHi: 'प्यारा दिल',
      dots: [
        { num: 1, x: 50, y: 80 },
        { num: 2, x: 20, y: 45 },
        { num: 3, x: 35, y: 25 },
        { num: 4, x: 50, y: 40 },
        { num: 5, x: 65, y: 25 },
        { num: 6, x: 80, y: 45 },
      ],
      svgFinalPath: 'M 50 80 Q 15 45 35 25 Q 50 40 50 40 Q 50 40 65 25 Q 85 45 50 80 Z',
    },
    3: {
      name: 'Morning Star',
      nameHi: 'सुबह का तारा',
      dots: [
        { num: 1, x: 50, y: 15 },
        { num: 2, x: 62, y: 38 },
        { num: 3, x: 85, y: 40 },
        { num: 4, x: 68, y: 58 },
        { num: 5, x: 74, y: 85 },
        { num: 6, x: 50, y: 70 },
        { num: 7, x: 26, y: 85 },
        { num: 8, x: 32, y: 58 },
      ],
      svgFinalPath: 'M 50 15 L 62 38 L 85 40 L 68 58 L 74 85 L 50 70 L 26 85 L 32 58 Z',
    },
  };

  const currentShape = shapes[difficulty] || shapes[1];

  const setupLevel = useCallback((_lvl: number) => {
    setCurrentDot(1);
    setConnectedDots([1]);
    setIsCompleted(false);
    setWrongClicks(0);
    setStartTime(Date.now());

    const shapeName = currentLanguage === 'hi' ? currentShape.nameHi : currentShape.name;
    const intro =
      currentLanguage === 'hi'
        ? `बिंदु जोड़ें खेल: आइए बिंदु 1 से शुरू करें और ${shapeName} बनाएं। बिंदु 2 को छुएं।`
        : `Connect the Dots: Let us connect the numbers in order to draw a ${shapeName}, ${patient.preferredName || 'Dadu'}. Touch dot number 2.`;

    setMessage(intro);
    voiceEngine.speak(intro, currentLanguage);
  }, [currentLanguage, currentShape.name, currentShape.nameHi, patient.preferredName]);

  useEffect(() => {
    setupLevel(difficulty);
    return () => voiceEngine.stop();
  }, [difficulty, setupLevel]);

  const handleDotClick = (dotNum: number) => {
    if (isCompleted) return;

    if (dotNum === currentDot + 1) {
      // Correct sequential dot connected
      const nextNum = dotNum;
      setCurrentDot(nextNum);
      setConnectedDots((prev) => [...prev, nextNum]);

      if (nextNum === currentShape.dots.length) {
        // Completed the drawing
        handleFinishDrawing();
      } else {
        const cheer =
          currentLanguage === 'hi'
            ? `बहुत सुंदर! अब बिंदु ${nextNum + 1} को छुएं।`
            : `Wonderful! Now tap dot number ${nextNum + 1}.`;
        setMessage(cheer);
        voiceEngine.speak(cheer, currentLanguage);
      }
    } else if (dotNum > currentDot + 1) {
      // Skipped dot - warm, calm hint
      setWrongClicks((prev) => prev + 1);
      const hint =
        currentLanguage === 'hi'
          ? `अच्छा प्रयास! पहले बिंदु ${currentDot + 1} को ढूंढें।`
          : `That was a good try! First look for dot number ${currentDot + 1}.`;
      setMessage(hint);
      voiceEngine.speak(hint, currentLanguage);
    }
  };

  const handleFinishDrawing = () => {
    setIsCompleted(true);
    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const shapeName = currentLanguage === 'hi' ? currentShape.nameHi : currentShape.name;

    const celebration =
      currentLanguage === 'hi'
        ? `अद्भुत! आपने सभी बिंदु जोड़कर सुंदर ${shapeName} पूरा कर लिया, ${patient.preferredName || 'दादू'} जी!`
        : `Splendid! You connected all the dots to draw a beautiful ${shapeName}, ${patient.preferredName || 'Dadu'}!`;

    setMessage(celebration);
    voiceEngine.speak(celebration, currentLanguage);

    addGameResult({
      gameType: 'connect_dots',
      score: wrongClicks > 2 ? 85 : 100,
      maxScore: 100,
      difficulty,
      reactionTimeSec: Math.round((elapsed / currentShape.dots.length) * 10) / 10,
      completed: true,
      notes: `Connected ${currentShape.dots.length} dots for ${currentShape.name} in ${elapsed}s.`,
    });
  };

  // Voice Command Processing
  const handleVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    if (text.includes('next') || text.includes('आगे') || text.includes('connect')) {
      if (currentDot < currentShape.dots.length) {
        handleDotClick(currentDot + 1);
      } else if (isCompleted) {
        handleAdvanceLevel();
      }
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

    // Number word match
    const numMap: { [key: string]: number } = {
      one: 1, '1': 1, 'एक': 1,
      two: 2, '2': 2, 'दो': 2,
      three: 3, '3': 3, 'तीन': 3,
      four: 4, '4': 4, 'चार': 4,
      five: 5, '5': 5, 'पाँच': 5,
      six: 6, '6': 6, 'छह': 6,
      seven: 7, '7': 7, 'सात': 7,
      eight: 8, '8': 8, 'आठ': 8,
    };

    for (const [word, val] of Object.entries(numMap)) {
      if (text.includes(`dot ${word}`) || text.includes(word)) {
        handleDotClick(val);
        return;
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
    if (wrongClicks <= 1 && difficulty < 3) {
      setDifficulty((prev) => prev + 1);
    } else if (wrongClicks >= 3 && difficulty > 1) {
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
            Connecting: {currentShape.name}
          </span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
            Level {difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`touch-target-large px-3 py-2 rounded-2xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-colors ${
              isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
            }`}
            title="Voice control: Say 'next dot', 'dot 2', 'repeat'"
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

      {/* Interactive Dot Tracing Canvas */}
      <div className="bg-white rounded-3xl border-3 border-stone-200 shadow-md p-6 sm:p-10 relative h-[420px] sm:h-[480px] overflow-hidden select-none">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Calm connecting lines between connected dots */}
          {connectedDots.map((dotNum, idx) => {
            if (idx === 0) return null;
            const prevDot = currentShape.dots.find((d) => d.num === connectedDots[idx - 1]);
            const thisDot = currentShape.dots.find((d) => d.num === dotNum);
            if (!prevDot || !thisDot) return null;

            return (
              <motion.line
                key={`line-${idx}`}
                x1={prevDot.x}
                y1={prevDot.y}
                x2={thisDot.x}
                y2={thisDot.y}
                stroke="#4d6b4d"
                strokeWidth="1.8"
                strokeDasharray="0"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              />
            );
          })}

          {/* Final outline stroke when complete */}
          {isCompleted && (
            <motion.path
              d={currentShape.svgFinalPath}
              fill="rgba(122, 154, 122, 0.15)"
              stroke="#4d6b4d"
              strokeWidth="2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          )}
        </svg>

        {/* Large 88x88px Dot Touch Targets */}
        {currentShape.dots.map((dot) => {
          const isConnected = connectedDots.includes(dot.num);
          const isNextTarget = dot.num === currentDot + 1;

          return (
            <button
              key={dot.num}
              onClick={() => handleDotClick(dot.num)}
              aria-label={`Dot number ${dot.num}`}
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute touch-target-large flex items-center justify-center cursor-pointer group z-10"
            >
              <motion.div
                animate={{
                  scale: isNextTarget ? [1, 1.15, 1] : 1,
                  boxShadow: isNextTarget
                    ? '0 0 20px rgba(77, 107, 77, 0.5)'
                    : '0 2px 5px rgba(0,0,0,0.1)',
                }}
                transition={{
                  repeat: isNextTarget ? Infinity : 0,
                  duration: 2,
                  ease: 'easeInOut',
                }}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full font-bold text-xl sm:text-2xl flex items-center justify-center border-3 transition-colors duration-300 ${
                  isConnected
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : isNextTarget
                    ? 'bg-sage-100 text-sage-900 border-sage-600 ring-4 ring-sage-300'
                    : 'bg-white text-stone-700 border-stone-300 group-hover:border-sage-400'
                }`}
              >
                {dot.num}
              </motion.div>
            </button>
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
              Drawing Completed!
            </h3>
            <p className="text-xl text-emerald-800">
              You connected the dots into a lovely {currentShape.name}, {patient.preferredName || 'Dadu'}.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={handleAdvanceLevel}
                className="touch-target-large px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-2xl shadow-md cursor-pointer"
              >
                {difficulty < 3 && wrongClicks <= 1 ? 'Play Next Level' : 'Play Again'}
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
