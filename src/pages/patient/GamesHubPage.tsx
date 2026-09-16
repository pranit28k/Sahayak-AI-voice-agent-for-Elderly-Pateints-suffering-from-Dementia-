import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Smile, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { voiceEngine } from '../../services/voiceEngine';
import { useAppStore } from '../../store/useAppStore';

export const GamesHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, patient } = useAppStore();

  useEffect(() => {
    const prompt =
      currentLanguage === 'hi'
        ? `आइए मस्तिष्क खेल खेलें, ${patient.preferredName || 'दादू'} जी। आप कौन सा खेल खेलना पसंद करेंगे?`
        : currentLanguage === 'as'
        ? `আহক স্মৃতি খেল খেলোঁ, ${patient.preferredName || 'দাদু'}। আপুনি কোনটো খেল খেলিব?`
        : `Let us play a gentle brain game, ${patient.preferredName || 'Dadu'}. Would you like to match memory cards or recognize family photos?`;

    voiceEngine.speak(prompt, currentLanguage);
  }, [currentLanguage, patient.preferredName]);

  const activeGames = [
    {
      id: 'memory_match',
      title: 'Memory Card Matching',
      subtitle: 'Find friendly pairs of family faces and familiar items',
      path: '/patient/games/memory',
      badge: 'Ready to Play',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Brain,
      bgColor: 'bg-emerald-50 border-emerald-300 hover:border-emerald-400',
    },
    {
      id: 'face_recognition',
      title: 'Family Face Recognition',
      subtitle: 'See familiar family photos and name your loved ones',
      path: '/patient/games/faces',
      badge: 'Ready to Play',
      badgeColor: 'bg-indigoSoft-100 text-indigoSoft-800 border-indigoSoft-300',
      icon: Smile,
      bgColor: 'bg-indigoSoft-50 border-indigoSoft-300 hover:border-indigoSoft-400',
    },
  ];

  const roadmapGames = [
    {
      title: 'Connect the Dots',
      desc: 'Gentle sequence tracing with numbers and constellations',
    },
    {
      title: 'Spot the Difference',
      desc: 'Two calm, beautiful photos with gentle differences to tap',
    },
    {
      title: 'Day & Number Arranging',
      desc: 'Order the days of the week and morning routine sequence',
    },
    {
      title: 'Object & Word Naming',
      desc: 'See familiar everyday objects and speak their names aloud',
    },
    {
      title: 'Family Photo Jigsaw',
      desc: 'Large 4-piece soothing puzzle of your family garden photo',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
          Gentle Brain Games
        </h1>
        <p className="text-lg md:text-xl text-stone-600 mt-2">
          Encouraging, calm exercises for memory and focus. Never any timer or hard failure.
        </p>
      </div>

      {/* 1. Fully Playable Games Section */}
      <div>
        <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold text-sm tracking-wider uppercase">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span>Active Cognitive Games</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeGames.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                onClick={() => {
                  voiceEngine.stop();
                  navigate(game.path);
                }}
                className={`touch-target-large p-6 rounded-3xl border-3 ${game.bgColor} text-left flex flex-col justify-between shadow-sm hover:shadow-lg transition-all cursor-pointer group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-800 shadow-xs">
                      <Icon className="w-9 h-9" />
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${game.badgeColor}`}>
                      {game.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-stone-900 mb-1 group-hover:text-sage-800 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-base text-stone-600 leading-relaxed">{game.subtitle}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-between font-bold text-stone-800 text-lg">
                  <span>Start Game</span>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5 text-stone-800" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Coming Soon Roadmap Stubs (Clearly communicating hackathon scope) */}
      <div className="pt-4 border-t border-stone-200">
        <div className="flex items-center gap-2 mb-4 text-stone-500 font-bold text-sm tracking-wider uppercase">
          <Lock className="w-4 h-4" />
          <span>Upcoming Exercises (Roadmap Expansion)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmapGames.map((rg, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-stone-200 bg-stone-100/60 text-left opacity-75 select-none"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-stone-800 text-lg">{rg.title}</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-600">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-stone-500 leading-normal">{rg.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
