import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, CheckCircle2, Circle, Pill, Utensils, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

export const RoutineTimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const { routine, toggleRoutineCompleted, currentLanguage, patient } = useAppStore();

  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  useEffect(() => {
    const greeting =
      currentLanguage === 'hi'
        ? `यह आपकी आज की दिनचर्या है, ${patient.preferredName || 'दादू'} जी।`
        : currentLanguage === 'as'
        ? `এয়া আপোনাৰ আজিৰ কামৰ তালিকা, ${patient.preferredName || 'দাদু'}।`
        : `Here is your routine for today, ${patient.preferredName || 'Dadu'}.`;

    voiceEngine.speak(greeting, currentLanguage);
    return () => voiceEngine.stop();
  }, [currentLanguage, patient.preferredName]);

  const handleReadScheduleAloud = async () => {
    setIsReadingAloud(true);

    for (let i = 0; i < routine.length; i++) {
      const item = routine[i];
      setActiveItemIndex(i);

      const phrase = `At ${item.time}, ${item.title}. ${item.dosage ? item.dosage : ''}. ${
        item.completed ? 'This has been completed.' : 'Scheduled for today.'
      }`;

      await voiceEngine.speak(phrase, currentLanguage);
    }

    setIsReadingAloud(false);
    setActiveItemIndex(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medicine':
        return <Pill className="w-6 h-6 text-rose-600" />;
      case 'meal':
        return <Utensils className="w-6 h-6 text-amber-600" />;
      case 'rest':
        return <Moon className="w-6 h-6 text-indigoSoft-600" />;
      default:
        return <Sun className="w-6 h-6 text-sage-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

        <button
          onClick={handleReadScheduleAloud}
          disabled={isReadingAloud}
          className="touch-target-large px-6 py-2.5 bg-sage-600 hover:bg-sage-700 active:scale-95 text-white rounded-2xl flex items-center gap-2.5 font-bold text-lg shadow-sm transition-all cursor-pointer"
        >
          <Volume2 className="w-6 h-6" />
          <span>{isReadingAloud ? 'Reading Aloud...' : 'Read Aloud to Me'}</span>
        </button>
      </div>

      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900">
          Today's Schedule & Medicine
        </h1>
        <p className="text-base text-stone-500 mt-1 font-medium">
          Tap any card when you have taken your medicine or finished a meal
        </p>
      </div>

      {/* Routine Cards List */}
      <div className="space-y-4 pt-2">
        {routine.map((item, idx) => {
          const isHighlighted = activeItemIndex === idx;

          return (
            <div
              key={item.id}
              onClick={() => toggleRoutineCompleted(item.id)}
              className={`touch-target-large p-5 rounded-3xl border-3 transition-all flex items-center justify-between gap-4 cursor-pointer select-none ${
                item.completed
                  ? 'bg-stone-100/90 border-stone-300 opacity-80'
                  : isHighlighted
                  ? 'bg-sage-100 border-sage-500 ring-4 ring-sage-200 scale-[1.01]'
                  : 'bg-white border-stone-200 hover:border-sage-400 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0">
                  {getCategoryIcon(item.category)}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg bg-stone-200 text-stone-800">
                      {item.time}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      {item.category}
                    </span>
                  </div>

                  <h3 className={`text-xl md:text-2xl font-bold ${item.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                    {item.title}
                  </h3>

                  {item.dosage && (
                    <p className="text-sm text-stone-600 mt-0.5 font-medium">
                      {item.dosage}
                    </p>
                  )}
                </div>
              </div>

              {/* Accessible Checkmark Target */}
              <div className="shrink-0 p-2">
                {item.completed ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                ) : (
                  <Circle className="w-10 h-10 text-stone-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
