import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Users, CalendarCheck, BookOpen, Compass } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';
import { evaluatePatientVoiceInput } from '../../services/persona';
import { generateDialogueWithLLM } from '../../services/llmService';
import { speechService } from '../../services/speechService';
import { VoiceOrb } from '../../components/patient/VoiceOrb';
import { VoiceTranscript } from '../../components/patient/VoiceTranscript';
import { EmergencyCallModal } from '../../components/patient/EmergencyCallModal';

export const PatientHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { patient, caregiver, currentLanguage, addToneLog } = useAppStore();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sahayakText, setSahayakText] = useState(
    `Good day, ${patient.preferredName || 'Dadu'}. I am right here with you. How are you feeling today?`
  );
  const [patientText, setPatientText] = useState('');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const silenceTimerRef = useRef<any>(null);

  // Initial greeting on mount
  useEffect(() => {
    const greetingText =
      currentLanguage === 'hi'
        ? `नमस्ते ${patient.preferredName || 'दादू'} जी, मैं आपके साथ हूँ। आज आप कैसा महसूस कर रहे हैं?`
        : currentLanguage === 'as'
        ? `নমস্কাৰ ${patient.preferredName || 'দাদু'}, মই আপোনাৰ লগতেই আছোঁ। আজি কেনেকুৱা লাগিছে?`
        : `Good day, ${patient.preferredName || 'Dadu'}. I am right here with you. How are you feeling today?`;

    setSahayakText(greetingText);
    voiceEngine.speak(
      greetingText,
      currentLanguage,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );

    return () => {
      voiceEngine.stop();
      clearTimeout(silenceTimerRef.current);
    };
  }, [currentLanguage, patient.preferredName]);

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (!voiceEngine.getIsSpeaking()) {
        const calmGentlePrompt =
          currentLanguage === 'hi'
            ? 'आराम से सोचिए, कोई जल्दी नहीं है।'
            : currentLanguage === 'as'
            ? 'ধীৰে ধীৰে চিন্তা কৰক, কোনো খৰখেদা নাই।'
            : 'Take your time, there is no hurry at all.';
        setSahayakText(calmGentlePrompt);
        voiceEngine.speak(
          calmGentlePrompt,
          currentLanguage,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    }, 5500); // 5.5s calm silence prompt
  };

  const handleToggleMic = () => {
    if (isListening) {
      voiceEngine.stopListening();
      setIsListening(false);
      clearTimeout(silenceTimerRef.current);
      return;
    }

    voiceEngine.stop();
    setIsSpeaking(false);
    setPatientText('');

    const started = voiceEngine.startListening(currentLanguage, {
      onSpeechStart: () => {
        setIsListening(true);
        resetSilenceTimer();
      },
      onTranscript: (spoken, isFinal) => {
        setPatientText(spoken);
        resetSilenceTimer();

        if (isFinal) {
          clearTimeout(silenceTimerRef.current);
          handlePatientSpeech(spoken);
        }
      },
      onSpeechEnd: () => {
        setIsListening(false);
      },
      onError: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      // Fallback if mic is not active or permission blocked
      const fallbackSpoken = 'I want to play a game';
      setPatientText(fallbackSpoken);
      handlePatientSpeech(fallbackSpoken);
    }
  };

  const handlePatientSpeech = async (transcript: string) => {
    if (!transcript || !transcript.trim()) {
      const retryText = speechService.getRetryPrompt(currentLanguage);
      setSahayakText(retryText);
      voiceEngine.speak(
        retryText,
        currentLanguage,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
      return;
    }

    // Evaluate quick triggers / specific game subroutes
    const navResponse = evaluatePatientVoiceInput(
      transcript,
      patient.preferredName,
      caregiver?.name || 'Priya',
      currentLanguage
    );

    // Call dynamic LLM generation for full persona dialog
    const llmResponse = await generateDialogueWithLLM(
      transcript,
      patient.preferredName,
      caregiver?.name || 'Priya',
      currentLanguage
    );

    const isDistress = navResponse.isDistress || llmResponse.isDistress;
    const tone = llmResponse.detectedTone || navResponse.detectedTone || 'calm';

    addToneLog({
      tone,
      context: `Patient said: "${transcript}"`,
      triggerDetected: isDistress ? 'Distress / Disorientation phrase' : undefined,
    });

    if (isDistress || navResponse.triggerCallCaregiver || llmResponse.suggestedAction === 'call_caregiver') {
      setShowEmergencyModal(true);
    }

    // Determine navigation target
    let targetNav = navResponse.navigateTo;
    if (!targetNav && llmResponse.suggestedAction) {
      if (llmResponse.suggestedAction === 'navigate_games') targetNav = '/patient/games';
      if (llmResponse.suggestedAction === 'navigate_family') targetNav = '/patient/family';
      if (llmResponse.suggestedAction === 'navigate_routine') targetNav = '/patient/routine';
      if (llmResponse.suggestedAction === 'navigate_journal') targetNav = '/patient/journal';
      if (llmResponse.suggestedAction === 'navigate_house') targetNav = '/patient/house-map';
    }

    // Select spoken reply: specific game sub-route reply takes precedence, otherwise dynamic LLM reply
    let reply = llmResponse.spokenReply;
    if (navResponse.navigateTo && navResponse.navigateTo !== '/patient/games') {
      reply = navResponse.spokenReply;
    }

    setSahayakText(reply);

    voiceEngine.speak(
      reply,
      currentLanguage,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        if (targetNav) {
          navigate(targetNav);
        }
      }
    );
  };

  const largeActionCards = [
    {
      title: 'Brain Games',
      subtitle: 'Play matching pairs & face recognition',
      path: '/patient/games',
      icon: Brain,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    },
    {
      title: 'Our Family',
      subtitle: 'See photos & hear loving greetings',
      path: '/patient/family',
      icon: Users,
      color: 'bg-indigoSoft-50 border-indigoSoft-300 text-indigoSoft-900',
    },
    {
      title: "Today's Schedule",
      subtitle: 'View medicine times & meals',
      path: '/patient/routine',
      icon: CalendarCheck,
      color: 'bg-amber-50 border-amber-300 text-amber-900',
    },
    {
      title: 'Daily Journal',
      subtitle: 'Tell Sahayak about your day',
      path: '/patient/journal',
      icon: BookOpen,
      color: 'bg-rose-50 border-rose-300 text-rose-900',
    },
    {
      title: 'Our Home Guide',
      subtitle: 'Directions to rooms & kitchen',
      path: '/patient/house-map',
      icon: Compass,
      color: 'bg-stone-50 border-stone-300 text-stone-900',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-between min-h-[78vh] space-y-6">
      
      {/* 1. Voice Orb Centerpiece */}
      <div className="w-full flex flex-col items-center pt-2">
        <VoiceOrb
          isSpeaking={isSpeaking}
          isListening={isListening}
          onToggleMic={handleToggleMic}
          size="lg"
        />

        {/* Real-time High Contrast Transcript */}
        <VoiceTranscript sahayakText={sahayakText} patientText={patientText} />
      </div>

      {/* 2. Large Accessible Action Grid (Minimum 88x88px targets, generous spacing) */}
      <div className="w-full max-w-5xl">
        <div className="text-center mb-4">
          <p className="text-sm uppercase tracking-wider font-bold text-stone-500">
            Touch any card or say its name aloud
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {largeActionCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.path}
                onClick={() => {
                  voiceEngine.stop();
                  navigate(card.path);
                }}
                className={`touch-target-large p-5 rounded-3xl border-2 ${card.color} shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all text-left flex items-center gap-4 cursor-pointer`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/80 border border-current flex items-center justify-center shrink-0 shadow-xs">
                  <Icon className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{card.title}</h3>
                  <p className="text-sm opacity-80 mt-0.5 leading-snug">{card.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency Modal */}
      <EmergencyCallModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </div>
  );
};
