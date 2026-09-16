import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Phone, Clock, Home, Brain, Users, CalendarCheck, BookOpen, Compass, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { EmergencyCallModal } from './EmergencyCallModal';
import { SupportedLanguage } from '../../types';

export const PatientLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { caregiver, currentLanguage, setLanguage, setMode } = useAppStore();

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isExitPinModalOpen, setIsExitPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(
        now.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExitPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '') {
      setMode('caregiver');
      navigate('/caregiver/dashboard');
    } else {
      setPinError(true);
    }
  };

  const navTabs = [
    { label: 'Home', path: '/patient', icon: Home },
    { label: 'Games', path: '/patient/games', icon: Brain },
    { label: 'Family', path: '/patient/family', icon: Users },
    { label: 'Routine', path: '/patient/routine', icon: CalendarCheck },
    { label: 'Journal', path: '/patient/journal', icon: BookOpen },
    { label: 'Home Map', path: '/patient/house-map', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col selection:bg-sage-200">
      {/* 1. Accessible Patient Top Bar */}
      <header className="bg-white border-b-2 border-stone-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Emergency Caregiver Button - Minimum 88x88 Touch Area */}
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            aria-label={`Call your caregiver ${caregiver?.name || 'Priya'}`}
            className="touch-target-large px-6 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl flex items-center gap-3 shadow-md transition-all cursor-pointer font-bold text-xl md:text-2xl"
          >
            <Phone className="w-8 h-8 animate-pulse shrink-0" />
            <span className="hidden sm:inline">Call {caregiver?.name?.split(' ')[0] || 'Priya'}</span>
            <span className="sm:hidden">Help</span>
          </button>

          {/* Large Easy-to-Read Date & Time */}
          <div className="flex items-center gap-2.5 text-stone-800 text-center">
            <Clock className="w-6 h-6 text-sage-600 hidden md:block" />
            <div>
              <p className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900 leading-none">
                {currentTime}
              </p>
              <p className="text-sm md:text-base font-semibold text-stone-500 mt-0.5">
                {currentDate}
              </p>
            </div>
          </div>

          {/* Language Selector & Caregiver Portal Exit */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex bg-stone-100 rounded-xl p-1 border border-stone-300">
              {(['en', 'hi', 'as'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1.5 rounded-lg text-sm font-bold uppercase transition-colors ${
                    currentLanguage === lang
                      ? 'bg-sage-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsExitPinModalOpen(true)}
              className="px-3 py-2 text-stone-500 hover:text-stone-800 text-sm font-medium border border-stone-200 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
              title="Exit to Caregiver Mode"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* 2. Patient Main Navigation Bar (Accessible high-contrast tabs) */}
      <nav aria-label="Patient navigation" className="bg-[#f2efe9] border-b border-stone-200 px-2 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-around gap-1 overflow-x-auto">
          {navTabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center min-w-[76px] sm:min-w-[100px] py-2 px-3 rounded-2xl font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sage-600 text-white shadow-md scale-105'
                    : 'bg-white/80 text-stone-700 hover:bg-white hover:text-stone-950 border border-stone-200'
                }`}
              >
                <Icon className="w-7 h-7 mb-1" />
                <span className="text-base sm:text-lg tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. Main Outlet Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        <Outlet />
      </main>

      {/* Emergency Call Modal */}
      <EmergencyCallModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Caregiver PIN Verification Modal */}
      {isExitPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-stone-200 text-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-stone-800">Caregiver Verification</h3>
              <button
                onClick={() => {
                  setIsExitPinModalOpen(false);
                  setPinError(false);
                  setPinInput('');
                }}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-stone-600 mb-4">
              Enter caregiver PIN (default: <strong>1234</strong>) to return to setup portal:
            </p>
            <form onSubmit={handleExitPinSubmit}>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="1234"
                className="w-full text-center text-3xl font-mono tracking-widest border-2 border-stone-300 rounded-xl p-3 mb-3 focus:border-sage-600 focus:outline-none"
                autoFocus
              />
              {pinError && (
                <p className="text-rose-600 text-sm font-semibold mb-3">
                  Incorrect PIN. Try 1234.
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-xl"
                >
                  Confirm Exit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExitPinModalOpen(false);
                    setPinError(false);
                    setPinInput('');
                  }}
                  className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
