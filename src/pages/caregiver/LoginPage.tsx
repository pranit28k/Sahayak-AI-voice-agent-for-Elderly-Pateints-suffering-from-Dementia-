import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemo, login } = useAppStore();

  const [name, setName] = useState('Priya Sharma');
  const [email, setEmail] = useState('priya.sharma@example.com');

  const handleDemoClick = () => {
    loginAsDemo();
    navigate('/caregiver/dashboard');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(name, email);
    navigate('/caregiver/dashboard');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-sage-600 flex items-center justify-center text-white mx-auto shadow-lg mb-4">
          <HeartHandshake className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Sahayak
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          AI-Powered Cognitive Gaming & Memory Companion for Dementia Care
        </p>
        <span className="inline-block mt-2 px-3 py-1 bg-sage-100 text-sage-800 text-xs font-semibold rounded-full border border-sage-200">
          Smart India Hackathon 2026 • PS 26003
        </span>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl sm:px-10 border border-stone-200">
          
          {/* 1-Click Fast Walkthrough Recommendation */}
          <div className="mb-6 p-4 bg-sage-50 border-2 border-sage-300 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-sage-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-sage-600" />
              <span>Recommended for Evaluators & Juries</span>
            </div>
            <p className="text-xs text-stone-600 mb-3">
              Instantly loads the complete Guwahati family scenario: Dadu Ramesh Sharma (Age 76), daily routines, tone logs, and family members.
            </p>
            <button
              onClick={handleDemoClick}
              className="w-full py-3 px-4 bg-sage-600 hover:bg-sage-700 active:scale-98 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Load Demo Family (Guwahati)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-400 font-semibold">Or enter as new caregiver</span>
            </div>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Caregiver Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-sage-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="caregiver@example.com"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-sage-500 focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Sign In to Portal
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-sage-600" />
            <span>Local private storage. Non-clinical MVP.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
