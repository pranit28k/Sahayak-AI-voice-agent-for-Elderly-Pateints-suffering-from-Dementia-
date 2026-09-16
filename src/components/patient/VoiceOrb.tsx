import React from 'react';
import { Mic, Volume2 } from 'lucide-react';

interface VoiceOrbProps {
  isSpeaking: boolean;
  isListening: boolean;
  onToggleMic: () => void;
  size?: 'md' | 'lg';
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  isSpeaking,
  isListening,
  onToggleMic,
  size = 'lg',
}) => {
  const diameter = size === 'lg' ? 'w-36 h-36 md:w-44 md:h-44' : 'w-24 h-24';

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <button
        onClick={onToggleMic}
        aria-label={isListening ? 'Stop listening' : 'Start speaking with Sahayak'}
        className={`relative ${diameter} rounded-full flex items-center justify-center cursor-pointer transition-all duration-700 shadow-xl select-none ${
          isSpeaking
            ? 'bg-gradient-to-tr from-indigoSoft-600 to-indigoSoft-400 text-white animate-pulse'
            : isListening
            ? 'bg-gradient-to-tr from-sage-600 to-sage-400 text-white animate-breathe ring-8 ring-sage-200'
            : 'bg-gradient-to-tr from-sage-200 via-indigoSoft-100 to-sage-100 text-sage-800 hover:shadow-2xl'
        }`}
      >
        <div className="absolute inset-2 rounded-full border-2 border-white/40 pointer-events-none" />
        
        {isSpeaking ? (
          <Volume2 className="w-14 h-14 md:w-16 md:h-16 animate-bounce" />
        ) : isListening ? (
          <Mic className="w-14 h-14 md:w-16 md:h-16 animate-pulse" />
        ) : (
          <Mic className="w-12 h-12 md:w-14 md:h-14 opacity-80" />
        )}
      </button>

      <div className="mt-4 text-center">
        <p className="text-xl md:text-2xl font-semibold text-stone-800">
          {isSpeaking
            ? 'Sahayak is speaking...'
            : isListening
            ? 'Sahayak is listening gently...'
            : 'Tap the circle or speak anytime'}
        </p>
        <p className="text-base text-stone-500 mt-1">
          {isListening ? 'Take your time, there is no hurry.' : 'I am always right here with you.'}
        </p>
      </div>
    </div>
  );
};
