import React from 'react';
import { Volume2, User } from 'lucide-react';

interface VoiceTranscriptProps {
  sahayakText: string;
  patientText?: string;
}

export const VoiceTranscript: React.FC<VoiceTranscriptProps> = ({
  sahayakText,
  patientText,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto my-3 bg-white/95 backdrop-blur border-2 border-sage-200 rounded-3xl p-5 shadow-sm">
      <div className="space-y-4">
        {sahayakText && (
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-sage-100 border border-sage-300 flex items-center justify-center shrink-0 text-sage-800">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-sage-600 block mb-0.5">
                Sahayak
              </span>
              <p className="text-xl md:text-2xl font-medium text-stone-900 leading-relaxed">
                {sahayakText}
              </p>
            </div>
          </div>
        )}

        {patientText && (
          <div className="flex items-start gap-3.5 border-t border-stone-100 pt-3">
            <div className="w-11 h-11 rounded-full bg-indigoSoft-100 border border-indigoSoft-300 flex items-center justify-center shrink-0 text-indigoSoft-800">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-indigoSoft-600 block mb-0.5">
                You Spoke
              </span>
              <p className="text-xl md:text-2xl font-medium text-indigoSoft-800 leading-relaxed italic">
                "{patientText}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
