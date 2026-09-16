import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, HelpCircle, Check, ArrowRight, Trophy } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

export const FaceRecognitionGame: React.FC = () => {
  const navigate = useNavigate();
  const { familyMembers, addGameResult, currentLanguage, patient } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [guidanceText, setGuidanceText] = useState('');
  const [gameFinished, setGameFinished] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const activeMember = familyMembers[currentIndex] || familyMembers[0];

  // Generate 3 choices (1 correct, 2 distractors)
  const generateChoices = () => {
    const correctName = activeMember.name;
    const distractors = familyMembers
      .filter((m) => m.name !== correctName)
      .map((m) => m.name);

    const pool = [correctName, ...distractors.slice(0, 2)];
    // Fallback names if family member count is small
    if (pool.length < 3) {
      if (!pool.includes('Sunita')) pool.push('Sunita (Sister)');
      if (!pool.includes('Dr. Neha')) pool.push('Dr. Neha');
    }
    return pool.sort();
  };

  const choices = generateChoices();

  useEffect(() => {
    if (!activeMember) return;
    setSelectedAnswer(null);
    setIsCorrect(null);

    const questionText =
      currentLanguage === 'hi'
        ? `तस्वीर में यह कौन मुस्कुरा रहे हैं, ${patient.preferredName || 'दादू'} जी?`
        : currentLanguage === 'as'
        ? `ছবিত এয়া কোনে হাঁহি আছে, ${patient.preferredName || 'দাদু'}?`
        : `Who is this smiling in the picture, ${patient.preferredName || 'Dadu'}?`;

    setGuidanceText(questionText);
    voiceEngine.speak(questionText, currentLanguage);
  }, [currentIndex, currentLanguage]);

  const handleSelectChoice = (chosenName: string) => {
    setSelectedAnswer(chosenName);

    if (chosenName === activeMember.name) {
      setIsCorrect(true);
      const praise = `Yes, wonderful! This is your ${activeMember.relation}, ${activeMember.name}.`;
      setGuidanceText(praise);
      voiceEngine.speak(praise, currentLanguage);
    } else {
      setIsCorrect(false);
      // Encourage gently without punishment
      const gentleCorrection = `That was a very close try! This is ${activeMember.name}, your ${activeMember.relation}.`;
      setGuidanceText(gentleCorrection);
      voiceEngine.speak(gentleCorrection, currentLanguage);
    }
  };

  const handleHearHint = () => {
    const hint = `This person loves you very much and lives right here with you. It is your ${activeMember.relation}.`;
    setGuidanceText(hint);
    voiceEngine.speak(hint, currentLanguage);
  };

  const handleNext = () => {
    if (currentIndex + 1 < familyMembers.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all members
      setGameFinished(true);
      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const endMsg = `You recognized all our family members wonderfully today, ${patient.preferredName || 'Dadu'}!`;
      setGuidanceText(endMsg);
      voiceEngine.speak(endMsg, currentLanguage);

      addGameResult({
        gameType: 'face_recognition',
        score: isCorrect === false ? 90 : 100,
        maxScore: 100,
        difficulty: 1,
        reactionTimeSec: 4.1,
        completed: true,
        notes: `Recognized family members in ${elapsed}s with high warmth.`,
      });
    }
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

        <span className="text-stone-500 font-bold text-base">
          Photo {currentIndex + 1} of {familyMembers.length}
        </span>
      </div>

      {/* Sahayak Guidance Banner */}
      <div className="bg-white border-2 border-sage-200 rounded-3xl p-5 shadow-sm flex items-start gap-4">
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
      </div>

      {!gameFinished ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
          {/* Family Member Portrait */}
          <div className="relative w-full max-w-sm mx-auto h-64 sm:h-72 rounded-3xl overflow-hidden shadow-md border-4 border-sage-100">
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

          {/* Large Multiple Choice Buttons (Minimum 88px height) */}
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
                <button
                  key={idx}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleSelectChoice(name)}
                  className={`w-full touch-target-large p-4 rounded-2xl border-3 text-left font-bold text-2xl md:text-3xl flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                >
                  <span>{name}</span>
                  {selectedAnswer && isRight && (
                    <Check className="w-8 h-8 text-emerald-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Button after answering */}
          {selectedAnswer && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNext}
                className="touch-target-large px-8 py-3 bg-sage-600 hover:bg-sage-700 active:scale-95 text-white rounded-2xl text-2xl font-bold flex items-center gap-3 shadow-md cursor-pointer transition-all"
              >
                <span>Next Family Photo</span>
                <ArrowRight className="w-7 h-7" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Game Finished Screen */
        <div className="p-8 bg-emerald-50 border-3 border-emerald-400 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
            <Trophy className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-extrabold text-emerald-950">
            Family Photo Session Complete!
          </h3>
          <p className="text-xl text-emerald-800">
            You recognized all your loved ones with such warmth and joy today.
          </p>
          <div className="flex justify-center gap-4 pt-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setGameFinished(false);
                setStartTime(Date.now());
              }}
              className="touch-target-large px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-2xl shadow-md cursor-pointer"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/patient/family')}
              className="touch-target-large px-8 py-3 bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-300 font-bold text-xl rounded-2xl shadow-sm cursor-pointer"
            >
              View Full Family Tree
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
