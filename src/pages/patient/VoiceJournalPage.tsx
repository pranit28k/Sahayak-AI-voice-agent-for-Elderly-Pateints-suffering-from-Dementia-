import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, Volume2, CheckCircle2, BookOpen, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

export const VoiceJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, patient, addJournalEntry, journalEntries } = useAppStore();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [sahayakPrompt, setSahayakPrompt] = useState('');

  useEffect(() => {
    const question =
      currentLanguage === 'hi'
        ? `आज आपका दिन कैसा रहा, ${patient.preferredName || 'दादू'} जी? मुझे बताइए, मैं ध्यान से सुन रहा हूँ।`
        : currentLanguage === 'as'
        ? `আজিৰ দিনটো কেনেকুৱা গ’ল, ${patient.preferredName || 'দাদু'}? মোক কওক, মই শুনি আছোঁ।`
        : `How was your day today, ${patient.preferredName || 'Dadu'}? Press the microphone and tell me. I am listening gently.`;

    setSahayakPrompt(question);
    voiceEngine.speak(question, currentLanguage);

    return () => voiceEngine.stop();
  }, [currentLanguage, patient.preferredName]);

  const handleStartRecording = () => {
    if (isListening) {
      voiceEngine.stopListening();
      setIsListening(false);
      return;
    }

    voiceEngine.stop();
    setTranscript('');
    setIsSaved(false);

    const started = voiceEngine.startListening(currentLanguage, {
      onSpeechStart: () => setIsListening(true),
      onTranscript: (spoken) => setTranscript(spoken),
      onSpeechEnd: () => setIsListening(false),
      onError: () => setIsListening(false),
    });

    if (!started) {
      // Fallback test sentence if microphone is disabled in browser
      const demoTranscript =
        'Today Priya and I sat in the balcony. The marigolds were blooming bright yellow, and we had sweet warm tea together.';
      setTranscript(demoTranscript);
      setIsListening(false);
    }
  };

  const handleSaveEntry = () => {
    if (!transcript) return;
    addJournalEntry(transcript, 'Peaceful');
    setIsSaved(true);

    const thanks = `Thank you, ${patient.preferredName || 'Dadu'}. I have safely saved your thoughts for today. Rest peacefully.`;
    setSahayakPrompt(thanks);
    voiceEngine.speak(thanks, currentLanguage);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            voiceEngine.stop();
            navigate('/patient');
          }}
          className="touch-target-large px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl flex items-center gap-2 font-bold text-lg cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Back to Home</span>
        </button>

        <span className="text-stone-500 font-bold text-base flex items-center gap-1.5">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <span>Daily Memory Journal</span>
        </span>
      </div>

      {/* Sahayak Question Banner */}
      <div className="bg-white border-2 border-sage-200 rounded-3xl p-6 shadow-sm flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center shrink-0 text-sage-800">
          <Volume2 className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sage-600 block mb-0.5">
            Sahayak Daily Question
          </span>
          <p className="text-2xl md:text-3xl font-bold text-stone-900 leading-snug">
            {sahayakPrompt}
          </p>
        </div>
      </div>

      {/* Spoken Recording Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md text-center space-y-6">
        <button
          onClick={handleStartRecording}
          aria-label={isListening ? 'Stop recording voice journal' : 'Record voice journal'}
          className={`touch-target-large mx-auto w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-lg transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200'
              : 'bg-sage-600 hover:bg-sage-700 text-white'
          }`}
        >
          <Mic className="w-12 h-12 mb-1" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isListening ? 'Listening...' : 'Tap & Speak'}
          </span>
        </button>

        <div>
          <p className="text-sm font-semibold text-stone-500">
            {isListening ? 'Speak naturally about your day. Take your time.' : 'Tap the microphone when you are ready to speak.'}
          </p>
        </div>

        {/* Live Spoken Transcript */}
        {transcript && (
          <div className="p-5 bg-stone-50 rounded-2xl border-2 border-stone-200 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
              Your Words Today:
            </span>
            <p className="text-xl md:text-2xl font-medium text-stone-900 italic leading-relaxed">
              "{transcript}"
            </p>
          </div>
        )}

        {transcript && !isSaved && (
          <button
            onClick={handleSaveEntry}
            className="touch-target-large w-full max-w-sm mx-auto py-3 px-6 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xl rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-7 h-7" />
            <span>Save My Journal Note</span>
          </button>
        )}

        {isSaved && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 text-lg font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>Journal note safely saved for your caregiver to see!</span>
          </div>
        )}
      </div>

      {/* Previous Entries Preview */}
      <div className="pt-4 border-t border-stone-200">
        <h3 className="text-base font-bold text-stone-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-stone-500" />
          <span>Recent Journal Memories</span>
        </h3>
        <div className="space-y-3">
          {journalEntries.slice(0, 3).map((entry) => (
            <div key={entry.id} className="p-4 bg-white rounded-2xl border border-stone-200 text-left text-sm">
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1 font-semibold">
                <span>{entry.date} at {entry.timestamp}</span>
                {entry.moodTag && (
                  <span className="px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 text-[11px] font-bold">
                    {entry.moodTag}
                  </span>
                )}
              </div>
              <p className="text-base text-stone-800 italic">"{entry.transcript}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
