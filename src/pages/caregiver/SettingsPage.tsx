import React, { useState } from 'react';
import { Settings, Shield, Globe, RotateCcw, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { SupportedLanguage } from '../../types';

export const SettingsPage: React.FC = () => {
  const {
    caregiver,
    patient,
    currentLanguage,
    setLanguage,
    updatePatientProfile,
    loginAsDemo,
  } = useAppStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [preferredName, setPreferredName] = useState(patient.preferredName);
  const [phone, setPhone] = useState(caregiver?.phone || '+91 98640 12345');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientProfile({ preferredName });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Settings className="w-7 h-7 text-sage-600" />
          <span>Caregiver Portal Settings</span>
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Adjust speech preferences, emergency call numbers, and demonstration data.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
        {/* Language Selection */}
        <div>
          <label className="text-sm font-bold text-stone-800 flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-sage-600" />
            <span>Default Companion Language</span>
          </label>
          <p className="text-xs text-stone-500 mb-2">
            Sets the primary speech synthesis and voice recognition language for Sahayak.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'en', label: 'English (Indian)' },
              { id: 'hi', label: 'Hindi (हिंदी)' },
              { id: 'as', label: 'Assamese (অসমীয়া)' },
            ].map((lang) => (
              <button
                type="button"
                key={lang.id}
                onClick={() => setLanguage(lang.id as SupportedLanguage)}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                  currentLanguage === lang.id
                    ? 'border-sage-600 bg-sage-50 text-sage-900 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-stone-400 mt-1.5 italic">
            *Note: Regional vernacular phrasing is draft machine translation for SIH 2026 pending native clinical validation.
          </p>
        </div>

        {/* Emergency Caregiver Phone */}
        <div className="border-t border-stone-100 pt-5">
          <label className="text-sm font-bold text-stone-800 flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-rose-600" />
            <span>Emergency Caregiver Phone (One-Touch Target)</span>
          </label>
          <p className="text-xs text-stone-500 mb-2">
            Connected when patient presses the prominent "Call Priya" button or triggers distress keywords.
          </p>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full max-w-sm p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none font-medium"
          />
        </div>

        {/* Patient Preferred Name */}
        <div className="border-t border-stone-100 pt-5">
          <label className="text-sm font-bold text-stone-800 block mb-1">
            Patient Preferred Call Name
          </label>
          <p className="text-xs text-stone-500 mb-2">
            The respectful moniker Sahayak uses when speaking with the patient (e.g. Dadu, Ramesh ji, Baba).
          </p>
          <input
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            className="w-full max-w-sm p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none font-medium"
          />
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-xs"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Demo Reset Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
            <RotateCcw className="w-4 h-4 text-indigoSoft-600" />
            <span>Reset Demo Family (Guwahati)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Resets all local state to the default pre-seeded presentation family (Dadu Ramesh Sharma, Priya, daily schedule, and tone logs).
          </p>
        </div>

        <button
          onClick={loginAsDemo}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-300 transition-colors cursor-pointer shrink-0"
        >
          Reload Demo Data
        </button>
      </div>
    </div>
  );
};
