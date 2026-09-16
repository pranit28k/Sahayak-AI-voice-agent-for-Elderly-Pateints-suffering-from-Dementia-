import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CaregiverLayout } from './components/caregiver/CaregiverLayout';
import { PatientLayout } from './components/patient/PatientLayout';

// Caregiver Pages
import { LoginPage } from './pages/caregiver/LoginPage';
import { AnalyticsDashboard } from './pages/caregiver/AnalyticsDashboard';
import { OnboardingWizard } from './pages/caregiver/OnboardingWizard';
import { FamilyTreeBuilder } from './pages/caregiver/FamilyTreeBuilder';
import { DoctorReportPage } from './pages/caregiver/DoctorReportPage';
import { SettingsPage } from './pages/caregiver/SettingsPage';

// Patient Pages
import { PatientHomePage } from './pages/patient/PatientHomePage';
import { GamesHubPage } from './pages/patient/GamesHubPage';
import { MemoryGamePage } from './pages/patient/MemoryGamePage';
import { FaceRecognitionGame } from './pages/patient/FaceRecognitionGame';
import { PatientFamilyTreePage } from './pages/patient/PatientFamilyTreePage';
import { VoiceJournalPage } from './pages/patient/VoiceJournalPage';
import { RoutineTimelinePage } from './pages/patient/RoutineTimelinePage';
import { HouseMapPage } from './pages/patient/HouseMapPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Caregiver Portal Shell */}
        <Route path="/caregiver" element={<CaregiverLayout />}>
          <Route index element={<Navigate to="/caregiver/dashboard" replace />} />
          <Route path="dashboard" element={<AnalyticsDashboard />} />
          <Route path="onboarding" element={<OnboardingWizard />} />
          <Route path="family-tree" element={<FamilyTreeBuilder />} />
          <Route path="doctor-report" element={<DoctorReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Patient Companion Accessible Shell */}
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientHomePage />} />
          <Route path="games" element={<GamesHubPage />} />
          <Route path="games/memory" element={<MemoryGamePage />} />
          <Route path="games/faces" element={<FaceRecognitionGame />} />
          <Route path="family" element={<PatientFamilyTreePage />} />
          <Route path="journal" element={<VoiceJournalPage />} />
          <Route path="routine" element={<RoutineTimelinePage />} />
          <Route path="house-map" element={<HouseMapPage />} />
        </Route>

        {/* Root Redirect to Caregiver Portal */}
        <Route path="*" element={<Navigate to="/caregiver/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
