import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Smile, ArrowRight, Sparkles, PenTool, Eye, ListOrdered, Tag, Image } from 'lucide-react';
import { voiceEngine } from '../../services/voiceEngine';
import { useAppStore } from '../../store/useAppStore';

export const GamesHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, patient } = useAppStore();

  useEffect(() => {
    const prompt =
      currentLanguage === 'hi'
        ? `मस्तिष्क खेलों में आपका स्वागत है, ${patient.preferredName || 'दादू'} जी। आप कौन सा खेल खेलना पसंद करेंगे? मेमोरी कार्ड, चेहरा पहचान, बिंदु जोड़ें, या फोटो पहेली?`
        : `Welcome to Brain Games, ${patient.preferredName || 'Dadu'}. Which peaceful exercise would you like to enjoy today?`;

    voiceEngine.speak(prompt, currentLanguage);
  }, [currentLanguage, patient.preferredName]);

  const allActiveGames = [
    {
      id: 'memory_match',
      title: 'Memory Card Matching',
      titleHi: 'स्मृति कार्ड मिलान',
      subtitle: 'Find friendly pairs of family faces and familiar items',
      path: '/patient/games/memory',
      icon: Brain,
      color: 'bg-emerald-50 border-emerald-300 hover:border-emerald-400 text-emerald-900',
      badge: 'Ready to Play',
    },
    {
      id: 'face_recognition',
      title: 'Family Face Recognition',
      titleHi: 'पारिवारिक चेहरा पहचान',
      subtitle: 'See familiar family photos and name your loved ones',
      path: '/patient/games/faces',
      icon: Smile,
      color: 'bg-indigoSoft-50 border-indigoSoft-300 hover:border-indigoSoft-400 text-indigoSoft-900',
      badge: 'Ready to Play',
    },
    {
      id: 'connect_dots',
      title: 'Connect the Dots',
      titleHi: 'बिंदु जोड़ें',
      subtitle: 'Gentle sequential drawing of leaves, hearts, and stars',
      path: '/patient/games/dots',
      icon: PenTool,
      color: 'bg-teal-50 border-teal-300 hover:border-teal-400 text-teal-900',
      badge: 'Ready to Play',
    },
    {
      id: 'spot_difference',
      title: 'Spot the Difference',
      titleHi: 'अंतर पहचानें',
      subtitle: 'Find subtle peaceful differences in morning verandah scenes',
      path: '/patient/games/spot-diff',
      icon: Eye,
      color: 'bg-amber-50 border-amber-300 hover:border-amber-400 text-amber-900',
      badge: 'Ready to Play',
    },
    {
      id: 'sequence_arranging',
      title: 'Routine & Number Arranging',
      titleHi: 'दिनचर्या क्रम व्यवस्थित करें',
      subtitle: 'Order daily morning activities and soothing habits into sequence',
      path: '/patient/games/sequence',
      icon: ListOrdered,
      color: 'bg-sky-50 border-sky-300 hover:border-sky-400 text-sky-900',
      badge: 'Ready to Play',
    },
    {
      id: 'object_naming',
      title: 'Familiar Object Naming',
      titleHi: 'वस्तु नाम पहचान',
      subtitle: 'Speak or tap names of familiar household items (tea, radio, shawl)',
      path: '/patient/games/naming',
      icon: Tag,
      color: 'bg-rose-50 border-rose-300 hover:border-rose-400 text-rose-900',
      badge: 'Ready to Play',
    },
    {
      id: 'photo_puzzle',
      title: 'Family Photo Jigsaw',
      titleHi: 'परिवार फोटो पहेली',
      subtitle: 'Assemble a soothing 4-piece jigsaw puzzle of your family portrait',
      path: '/patient/games/puzzle',
      icon: Image,
      color: 'bg-purple-50 border-purple-300 hover:border-purple-400 text-purple-900',
      badge: 'Ready to Play',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
          Gentle Cognitive Games
        </h1>
        <p className="text-lg md:text-xl text-stone-600 mt-2">
          Encouraging, unhurried exercises for memory, attention, and joy. Never any countdown or penalty.
        </p>
      </div>

      {/* Active Games Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold text-sm tracking-wider uppercase">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span>7 Playable Cognitive Exercises</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allActiveGames.map((game) => {
            const Icon = game.icon;

            return (
              <button
                key={game.id}
                onClick={() => {
                  voiceEngine.stop();
                  navigate(game.path);
                }}
                className={`touch-target-large p-6 rounded-3xl border-3 ${game.color} text-left flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/90 border border-current/20 flex items-center justify-center text-current shadow-xs">
                      <Icon className="w-8 h-8" />
                    </div>
                    <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-white/90 text-current border border-current/30 shadow-xs">
                      {game.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-1 leading-snug">
                    {currentLanguage === 'hi' ? game.titleHi : game.title}
                  </h3>
                  <p className="text-sm opacity-80 leading-relaxed mt-1">{game.subtitle}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-current/20 flex items-center justify-between font-bold text-base">
                  <span>Start Exercise</span>
                  <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5 text-current" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
