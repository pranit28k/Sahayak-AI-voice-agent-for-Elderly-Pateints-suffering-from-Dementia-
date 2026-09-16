import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Compass, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

export const HouseMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { rooms, currentLanguage, patient } = useAppStore();

  const [activeRoomId, setActiveRoomId] = useState<string>(rooms[0]?.id || 'rm-1');
  const [spokenGuidance, setSpokenGuidance] = useState('');

  useEffect(() => {
    const welcome =
      currentLanguage === 'hi'
        ? `यह हमारे घर का नक़्शा है, ${patient.preferredName || 'दादू'} जी। आप कहाँ जाना चाहते हैं?`
        : currentLanguage === 'as'
        ? `এয়া আমাৰ ঘৰৰ মানচিত্ৰ, ${patient.preferredName || 'দাদু'}। আপুনি ক’লৈ যাব বিচাৰে?`
        : `This is our home guide, ${patient.preferredName || 'Dadu'}. Where would you like to walk to?`;

    setSpokenGuidance(welcome);
    voiceEngine.speak(welcome, currentLanguage);

    return () => voiceEngine.stop();
  }, [currentLanguage, patient.preferredName]);

  const handleRoomSelect = (roomId: string) => {
    const chosen = rooms.find((r) => r.id === roomId);
    if (!chosen) return;

    setActiveRoomId(roomId);
    setSpokenGuidance(chosen.guidanceVoiceText);
    voiceEngine.speak(chosen.guidanceVoiceText, currentLanguage);
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

        <span className="text-stone-500 font-bold text-base flex items-center gap-1.5">
          <Compass className="w-5 h-5 text-sage-600" />
          <span>Our Home Orientation</span>
        </span>
      </div>

      {/* Sahayak Spoken Directions Banner */}
      <div className="bg-white border-2 border-sage-200 rounded-3xl p-5 shadow-sm flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center shrink-0 text-sage-800">
          <Volume2 className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sage-600 block mb-0.5">
            Directions from Sahayak
          </span>
          <p className="text-2xl font-bold text-stone-900 leading-snug">
            {spokenGuidance}
          </p>
        </div>
      </div>

      {/* Quick Room Voice Questions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => handleRoomSelect(room.id)}
            className={`touch-target-large px-5 py-3 rounded-2xl font-bold text-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeRoomId === room.id
                ? 'bg-sage-600 text-white shadow-md scale-105'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>Where is {room.name}?</span>
          </button>
        ))}
      </div>

      {/* 2D Architectural Layout Canvas (Calm, high-contrast illustrated rooms) */}
      <div className="bg-stone-100/80 p-6 rounded-3xl border-3 border-stone-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rooms.map((room) => {
          const isSelected = activeRoomId === room.id;

          return (
            <button
              key={room.id}
              onClick={() => handleRoomSelect(room.id)}
              className={`rounded-3xl border-4 overflow-hidden transition-all text-left bg-white cursor-pointer relative shadow-sm flex flex-col ${
                isSelected
                  ? 'border-sage-600 ring-8 ring-sage-200 scale-[1.02] shadow-xl'
                  : 'border-stone-200 hover:border-stone-400 opacity-90'
              }`}
            >
              <div className="relative h-44 w-full">
                <img
                  src={room.photoUrl}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-stone-900/80 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{room.direction}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-stone-900">{room.name}</h3>
                  <p className="text-sm text-stone-600 mt-1 leading-snug">{room.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-sage-800 font-bold text-sm">
                  <span>Tap for voice directions</span>
                  <Volume2 className="w-5 h-5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
