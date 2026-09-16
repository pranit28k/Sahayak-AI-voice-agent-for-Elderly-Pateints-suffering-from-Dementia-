import React, { useState, useEffect } from 'react';
import { Volume2, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';

export const PatientFamilyTreePage: React.FC = () => {
  const navigate = useNavigate();
  const { familyMembers, currentLanguage, patient } = useAppStore();

  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [currentGreeting, setCurrentGreeting] = useState('');

  useEffect(() => {
    const welcome =
      currentLanguage === 'hi'
        ? `यह हमारा परिवार है, ${patient.preferredName || 'दादू'} जी। किसी भी तस्वीर को छूकर उनकी प्यार भरी आवाज़ सुनें।`
        : currentLanguage === 'as'
        ? `এয়া আমাৰ পৰিয়াল, ${patient.preferredName || 'দাদু'}। আপোনজনৰ মাত শুনিবলৈ ছবিত স্পৰ্শ কৰক।`
        : `This is our family, ${patient.preferredName || 'Dadu'}. Tap any photo to hear their warm greeting.`;

    setCurrentGreeting(welcome);
    voiceEngine.speak(welcome, currentLanguage);

    return () => voiceEngine.stop();
  }, [currentLanguage, patient.preferredName]);

  const handleMemberTap = (member: (typeof familyMembers)[0]) => {
    setActiveSpeakingId(member.id);
    setCurrentGreeting(member.greetingText);

    voiceEngine.speak(
      member.greetingText,
      currentLanguage,
      () => {},
      () => setActiveSpeakingId(null)
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <span>Our Loving Family</span>
        </span>
      </div>

      {/* Spoken Greeting Banner */}
      <div className="bg-white border-2 border-sage-200 rounded-3xl p-5 shadow-sm flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center shrink-0 text-sage-800">
          <Volume2 className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sage-600 block mb-0.5">
            Voice Greeting
          </span>
          <p className="text-2xl font-bold text-stone-900 leading-snug">
            {currentGreeting}
          </p>
        </div>
      </div>

      {/* Large Accessible Family Member Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {familyMembers.map((member) => {
          const isPlaying = activeSpeakingId === member.id;

          return (
            <button
              key={member.id}
              onClick={() => handleMemberTap(member)}
              aria-label={`Hear greeting from ${member.name}, your ${member.relation}`}
              className={`touch-target-large rounded-3xl border-4 overflow-hidden transition-all duration-300 text-left bg-white shadow-sm hover:shadow-xl cursor-pointer flex flex-col ${
                isPlaying
                  ? 'border-indigoSoft-600 ring-8 ring-indigoSoft-100 scale-[1.02]'
                  : 'border-stone-200 hover:border-sage-400'
              }`}
            >
              <div className="relative h-64 bg-stone-100 w-full overflow-hidden">
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-sm">
                    {member.name}
                  </h3>
                  <p className="text-base font-medium text-stone-200 drop-shadow-xs">
                    {member.relation}
                  </p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between bg-stone-50/80 border-t border-stone-200">
                <div className="flex items-center gap-2">
                  <Volume2 className={`w-6 h-6 ${isPlaying ? 'text-indigoSoft-600 animate-bounce' : 'text-stone-400'}`} />
                  <span className="text-base font-bold text-stone-700">
                    {isPlaying ? 'Speaking now...' : 'Tap to hear voice'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-rose-500 shadow-xs">
                  <Heart className="w-5 h-5 fill-rose-500/20" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
