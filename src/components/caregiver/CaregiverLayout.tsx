import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  ClipboardList,
  Users,
  FileText,
  Settings,
  HeartHandshake,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const CaregiverLayout: React.FC = () => {
  const navigate = useNavigate();
  const { patient, loginAsDemo, setMode } = useAppStore();

  const handleLaunchPatientMode = () => {
    setMode('patient');
    navigate('/patient');
  };

  const navLinks = [
    { label: 'Analytics Dashboard', path: '/caregiver/dashboard', icon: Activity },
    { label: 'Onboarding Wizard', path: '/caregiver/onboarding', icon: ClipboardList },
    { label: 'Family Tree Builder', path: '/caregiver/family-tree', icon: Users },
    { label: 'Doctor Report', path: '/caregiver/doctor-report', icon: FileText },
    { label: 'Settings', path: '/caregiver/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col selection:bg-sage-200">
      {/* Caregiver Portal Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Portal Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-600 flex items-center justify-center text-white font-bold text-xl shadow-xs">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl tracking-tight text-stone-900">Sahayak</span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sage-100 text-sage-800 border border-sage-200">
                    Caregiver Portal
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Patient: <span className="font-medium text-stone-800">{patient.name}</span> ({patient.preferredName})
                </p>
              </div>
            </div>

            {/* Quick Actions & Mode Switcher */}
            <div className="flex items-center gap-3">
              <button
                onClick={loginAsDemo}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigoSoft-800 bg-indigoSoft-50 hover:bg-indigoSoft-100 border border-indigoSoft-200 rounded-lg transition-colors cursor-pointer"
                title="Reload the Guwahati Demo Family dataset"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigoSoft-600" />
                Reset Demo (Guwahati)
              </button>

              {/* High-Visibility Switch to Patient Mode */}
              <button
                onClick={handleLaunchPatientMode}
                className="flex items-center gap-2 px-4 py-2 bg-sage-600 hover:bg-sage-700 active:scale-98 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <span>Launch Patient Mode</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <nav className="flex space-x-1 sm:space-x-4 border-t border-stone-100 py-1 overflow-x-auto">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-stone-100 text-sage-800 font-semibold border-b-2 border-sage-600'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        <p>
          Sahayak AI • Smart India Hackathon 2026 (Problem Statement 26003: Cognitive Gaming & Memory Assistance)
        </p>
      </footer>
    </div>
  );
};
