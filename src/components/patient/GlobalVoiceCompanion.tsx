import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Sparkles, Play, X, HeartHandshake } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';
import { generateDialogueWithLLM } from '../../services/llmService';
import { evaluatePatientVoiceInput } from '../../services/persona';
import { speechService } from '../../services/speechService';

export type CompanionState = 'idle' | 'listening' | 'thinking' | 'speaking';

export const GlobalVoiceCompanion: React.FC = () => {
  const location = useLocation();
  const {
    patient,
    caregiver,
    currentLanguage,
    isGamePaused,
    setGamePaused,
    addToneLog,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<CompanionState>('idle');
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [sahayakReply, setSahayakReply] = useState('');
  const [offeredResume, setOfferedResume] = useState(false);

  const isGameRoute = location.pathname.startsWith('/patient/games/');
  const currentPathRef = useRef(location.pathname);

  useEffect(() => {
    currentPathRef.current = location.pathname;
  }, [location.pathname]);

  // Keep state synchronized with voice engine
  useEffect(() => {
    if (!isOpen) {
      voiceEngine.stop();
      setState('idle');
      setSpokenTranscript('');
      setOfferedResume(false);
    }
  }, [isOpen]);

  const handleOpenCompanion = () => {
    setIsOpen(true);
    setSpokenTranscript('');
    setOfferedResume(false);

    if (isGameRoute) {
      setGamePaused(true);
    }

    const greeting =
      currentLanguage === 'hi'
        ? `नमस्ते ${patient.preferredName || 'दादू'} जी, मैं सुन रहा हूँ। आप क्या पूछना चाहते हैं?`
        : currentLanguage === 'as'
        ? `নমস্কাৰ ${patient.preferredName || 'দাদু'}, মই শুনি আছোঁ। আপুনি কি সুধিব বিচাৰে?`
        : `Hello ${patient.preferredName || 'Dadu'}, I am right here listening. What would you like to know?`;

    setSahayakReply(greeting);
    setState('speaking');

    voiceEngine.speak(
      greeting,
      currentLanguage,
      () => setState('speaking'),
      () => {
        setState('idle');
        // Auto-start listening after greeting so user can speak immediately
        startListening();
      }
    );
  };

  const handleCloseCompanion = () => {
    voiceEngine.stop();
    voiceEngine.stopListening();
    setState('idle');
    setIsOpen(false);
    setOfferedResume(false);
    if (isGameRoute && isGamePaused) {
      setGamePaused(false);
    }
  };

  const handleResumeGame = () => {
    voiceEngine.stop();
    voiceEngine.stopListening();
    setState('idle');
    setIsOpen(false);
    setOfferedResume(false);
    setGamePaused(false);
  };

  const startListening = () => {
    voiceEngine.stop();
    setState('listening');
    setSpokenTranscript('');

    const started = voiceEngine.startListening(currentLanguage, {
      onSpeechStart: () => {
        setState('listening');
      },
      onTranscript: (spoken, isFinal) => {
        setSpokenTranscript(spoken);
        if (isFinal) {
          processPatientQuery(spoken);
        }
      },
      onSpeechEnd: () => {
        // Will transition to thinking or idle depending on transcript
      },
      onError: () => {
        setState('idle');
      },
    });

    if (!started) {
      setState('idle');
    }
  };

  const processPatientQuery = async (query: string) => {
    if (!query || !query.trim()) {
      const retryText = speechService.getRetryPrompt(currentLanguage);
      setSahayakReply(retryText);
      setState('speaking');
      voiceEngine.speak(
        retryText,
        currentLanguage,
        () => setState('speaking'),
        () => setState('idle')
      );
      return;
    }

    // Check for explicit resume intent
    const lower = query.toLowerCase();
    if (
      isGameRoute &&
      (lower.includes('continue') ||
        lower.includes('resume') ||
        lower.includes('back to game') ||
        lower.includes('खेल जारी') ||
        lower.includes('খেল'))
    ) {
      handleResumeGame();
      return;
    }

    setState('thinking');

    // Navigation and emergency triggers check
    const navResponse = evaluatePatientVoiceInput(
      query,
      patient.preferredName,
      caregiver?.name || 'Priya',
      currentLanguage
    );

    // Dynamic dialogue generation via LLM / persona
    const llmResponse = await generateDialogueWithLLM(
      query,
      patient.preferredName,
      caregiver?.name || 'Priya',
      currentLanguage
    );

    const isDistress = navResponse.isDistress || llmResponse.isDistress;
    const tone = llmResponse.detectedTone || navResponse.detectedTone || 'calm';

    addToneLog({
      tone,
      context: `Voice companion query: "${query}"`,
      triggerDetected: isDistress ? 'Distress / Disorientation phrase' : undefined,
    });

    let mainReply = llmResponse.spokenReply || navResponse.spokenReply;

    // If on a game route, append gentle continuation offer
    if (isGameRoute) {
      const resumeOffer =
        currentLanguage === 'hi'
          ? ' क्या आप अपना खेल जारी रखना चाहते हैं?'
          : currentLanguage === 'as'
          ? ' আপুনি খেলটো আকৌ আৰম্ভ কৰিব বিচাৰেনে?'
          : ' Would you like to continue your game?';

      const fullReply = `${mainReply} ${resumeOffer}`;
      setSahayakReply(fullReply);
      setOfferedResume(true);
      setState('speaking');

      voiceEngine.speak(
        fullReply,
        currentLanguage,
        () => setState('speaking'),
        () => setState('idle')
      );
    } else {
      setSahayakReply(mainReply);
      setState('speaking');

      voiceEngine.speak(
        mainReply,
        currentLanguage,
        () => setState('speaking'),
        () => setState('idle')
      );
    }
  };

  const quickQuestions = [
    {
      en: 'What time is it?',
      hi: 'समय क्या हुआ है?',
      as: 'এতিয়া কিমান বাজিছে?',
    },
    {
      en: 'What day is today?',
      hi: 'आज कौन सा दिन है?',
      as: 'আজি কি বাৰ?',
    },
    {
      en: `Where is ${caregiver?.name?.split(' ')[0] || 'Priya'}?`,
      hi: `${caregiver?.name?.split(' ')[0] || 'प्रिया'} कहाँ है?`,
      as: `${caregiver?.name?.split(' ')[0] || 'প্ৰিয়া'} ক’ত আছে?`,
    },
    {
      en: 'I feel a bit confused',
      hi: 'मुझे घबराहट हो रही है',
      as: 'মোৰ অলপ ভয় লাগিছে',
    },
  ];

  return (
    <>
      {/* Persistent Floating Voice Companion Trigger (Fixed in Bottom-Right Corner) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          onClick={handleOpenCompanion}
          aria-label="Open voice companion Sahayak"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative w-20 h-20 md:w-22 md:h-22 rounded-full flex flex-col items-center justify-center shadow-2xl border-4 cursor-pointer select-none transition-colors duration-300 ${
            state === 'speaking'
              ? 'bg-gradient-to-tr from-indigoSoft-600 to-indigoSoft-400 border-indigoSoft-200 text-white shadow-indigoSoft-500/40'
              : state === 'listening'
              ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 border-emerald-200 text-white shadow-emerald-500/40'
              : state === 'thinking'
              ? 'bg-gradient-to-tr from-amber-600 to-amber-400 border-amber-200 text-white shadow-amber-500/40'
              : 'bg-gradient-to-tr from-sage-700 via-sage-600 to-emerald-700 border-sage-200 text-white shadow-sage-900/30'
          }`}
        >
          {/* Subtle slow pulse aura (300-500ms ease, non-flashing) */}
          <span className="absolute -inset-1.5 rounded-full border-2 border-sage-400/40 animate-pulse pointer-events-none" />

          {state === 'speaking' ? (
            <Volume2 className="w-9 h-9 animate-pulse" />
          ) : state === 'listening' ? (
            <Mic className="w-9 h-9 animate-bounce" />
          ) : state === 'thinking' ? (
            <Sparkles className="w-9 h-9 animate-spin" />
          ) : (
            <Mic className="w-9 h-9" />
          )}

          <span className="text-[11px] font-bold tracking-wider uppercase mt-0.5">
            Sahayak
          </span>
        </motion.button>
      </div>

      {/* Expanded Voice Companion Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border-2 border-sage-200 flex flex-col relative text-stone-900"
            >
              {/* Header with Close and Game Paused Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-sage-100 border border-sage-300 flex items-center justify-center text-sage-800">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-stone-900">
                      Sahayak Voice Companion
                    </h2>
                    <p className="text-xs md:text-sm font-medium text-stone-500">
                      Always with you • Unhurried & calm
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseCompanion}
                  className="w-12 h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 active:scale-95 flex items-center justify-center text-stone-600 transition-all cursor-pointer"
                  aria-label="Close companion"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Game Paused Notice (Shown when opened from inside a game) */}
              {isGameRoute && (
                <div className="mt-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-sm md:text-base font-bold text-amber-900">
                      {currentLanguage === 'hi'
                        ? 'खेल रुका हुआ है • कोई जल्दी नहीं है'
                        : currentLanguage === 'as'
                        ? 'খেল স্থগিত আছে • কোনো খৰখেদা নাই'
                        : 'Game Paused • Take all the time you need'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-white border border-amber-200 rounded-lg text-amber-800">
                    Paused
                  </span>
                </div>
              )}

              {/* Interactive Orb Centerpiece */}
              <div className="flex flex-col items-center my-6">
                <motion.button
                  onClick={() => {
                    if (state === 'listening') {
                      voiceEngine.stopListening();
                      setState('idle');
                    } else {
                      startListening();
                    }
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className={`w-32 h-32 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center shadow-xl border-4 cursor-pointer select-none transition-all duration-500 ${
                    state === 'speaking'
                      ? 'bg-gradient-to-tr from-indigoSoft-600 to-indigoSoft-400 border-indigoSoft-200 text-white'
                      : state === 'listening'
                      ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 border-emerald-200 text-white ring-8 ring-emerald-100'
                      : state === 'thinking'
                      ? 'bg-gradient-to-tr from-amber-600 to-amber-400 border-amber-200 text-white ring-8 ring-amber-100'
                      : 'bg-gradient-to-tr from-sage-100 via-stone-50 to-sage-200 border-sage-300 text-sage-800 hover:bg-sage-200'
                  }`}
                >
                  {state === 'speaking' ? (
                    <Volume2 className="w-14 h-14 animate-pulse" />
                  ) : state === 'listening' ? (
                    <Mic className="w-14 h-14 animate-bounce" />
                  ) : state === 'thinking' ? (
                    <Sparkles className="w-14 h-14 animate-spin" />
                  ) : (
                    <Mic className="w-14 h-14 opacity-80" />
                  )}

                  <span className="text-xs font-bold mt-1 uppercase tracking-wider">
                    {state === 'listening'
                      ? 'Listening'
                      : state === 'thinking'
                      ? 'Thinking'
                      : state === 'speaking'
                      ? 'Speaking'
                      : 'Tap to Speak'}
                  </span>
                </motion.button>

                {/* State Label */}
                <p className="mt-3 text-sm md:text-base font-semibold text-stone-600">
                  {state === 'listening'
                    ? 'Listening to you gently...'
                    : state === 'thinking'
                    ? 'Sahayak is finding a calm answer...'
                    : state === 'speaking'
                    ? 'Sahayak is speaking...'
                    : 'Tap circle or ask any question'}
                </p>
              </div>

              {/* Real-time High Contrast Transcript Box */}
              <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 md:p-5 mb-5 space-y-3">
                {spokenTranscript && (
                  <div className="text-stone-700">
                    <span className="text-xs uppercase tracking-wider font-bold text-stone-400 block mb-1">
                      You said:
                    </span>
                    <p className="text-lg md:text-xl font-medium text-stone-900 bg-white p-3 rounded-xl border border-stone-200">
                      "{spokenTranscript}"
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-sage-700 block mb-1">
                    Sahayak says:
                  </span>
                  <p className="text-xl md:text-2xl font-bold text-stone-900 leading-snug">
                    {sahayakReply}
                  </p>
                </div>
              </div>

              {/* Single-Tap Game Resume Button (Prominent when on game route or after inquiry) */}
              {isGameRoute && (
                <div className="mb-4">
                  <button
                    onClick={handleResumeGame}
                    className="w-full touch-target-large py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-bold text-xl md:text-2xl shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer"
                  >
                    <Play className="w-8 h-8 fill-current" />
                    <span>
                      {currentLanguage === 'hi'
                        ? '▶ खेल जारी रखें'
                        : currentLanguage === 'as'
                        ? '▶ খেল অব্যাহত ৰাখক'
                        : '▶ Continue Game'}
                    </span>
                  </button>
                  {offeredResume && (
                    <p className="text-center text-xs font-semibold text-stone-500 mt-1.5">
                      {currentLanguage === 'hi'
                        ? 'आपकी जगह सुरक्षित रखी गई है'
                        : 'Your exact progress has been preserved'}
                    </p>
                  )}
                </div>
              )}

              {/* Quick Prompt Suggestions */}
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-stone-400 mb-2">
                  Or touch a question below:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((q, idx) => {
                    const label =
                      currentLanguage === 'hi'
                        ? q.hi
                        : currentLanguage === 'as'
                        ? q.as
                        : q.en;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSpokenTranscript(label);
                          processPatientQuery(label);
                        }}
                        className="p-3 text-left bg-stone-100 hover:bg-sage-100 active:scale-95 border border-stone-200 hover:border-sage-300 rounded-xl text-stone-800 text-sm md:text-base font-semibold transition-all cursor-pointer leading-snug"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
