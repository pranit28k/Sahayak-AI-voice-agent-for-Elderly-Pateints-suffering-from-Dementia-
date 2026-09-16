import React from 'react';
import { Phone, Heart, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface EmergencyCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyCallModal: React.FC<EmergencyCallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { caregiver, patient } = useAppStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border-4 border-rose-300 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 rounded-full bg-rose-100 border-4 border-rose-300 flex items-center justify-center mx-auto text-rose-600 mb-4 animate-pulse">
          <Phone className="w-12 h-12" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">
          Calling {caregiver?.name || 'Priya'}
        </h2>

        <p className="text-xl text-stone-600 mb-4 font-medium">
          {caregiver?.phone || '+91 98640 12345'}
        </p>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
          <Heart className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-lg text-rose-950">
            <strong>You are safe at home, {patient.preferredName || 'Dadu'}.</strong> {caregiver?.name || 'Priya'} has received your call and is right here with you.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full touch-target-large bg-sage-600 hover:bg-sage-700 text-white rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg cursor-pointer"
        >
          <Check className="w-8 h-8" />
          I Feel Safe Now
        </button>
      </div>
    </div>
  );
};
