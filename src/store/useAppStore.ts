import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CaregiverProfile,
  PatientProfile,
  FamilyMember,
  RoutineItem,
  AgitationTrigger,
  RoomLayout,
  ToneLog,
  GameResult,
  VoiceJournalEntry,
  ConsentRecord,
  SupportedLanguage,
} from '../types';
import {
  SEED_CAREGIVER,
  SEED_PATIENT,
  SEED_FAMILY_MEMBERS,
  SEED_ROUTINE,
  SEED_TRIGGERS,
  SEED_ROOMS,
  SEED_TONE_LOGS,
  SEED_GAME_RESULTS,
  SEED_JOURNAL_ENTRIES,
} from './seedData';

interface AppState {
  isAuthenticated: boolean;
  activeMode: 'caregiver' | 'patient';
  currentLanguage: SupportedLanguage;
  caregiver: CaregiverProfile | null;
  patient: PatientProfile;
  familyMembers: FamilyMember[];
  routine: RoutineItem[];
  triggers: AgitationTrigger[];
  rooms: RoomLayout[];
  toneLogs: ToneLog[];
  gameResults: GameResult[];
  journalEntries: VoiceJournalEntry[];
  consent: ConsentRecord | null;
  isGamePaused: boolean;

  // Actions
  loginAsDemo: () => void;
  login: (name: string, email: string) => void;
  logout: () => void;
  setMode: (mode: 'caregiver' | 'patient') => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setGamePaused: (paused: boolean) => void;
  updatePatientProfile: (updates: Partial<PatientProfile>) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;
  toggleRoutineCompleted: (id: string) => void;
  addRoutineItem: (item: Omit<RoutineItem, 'id'>) => void;
  addToneLog: (log: Omit<ToneLog, 'id' | 'timestamp'>) => void;
  addGameResult: (result: Omit<GameResult, 'id' | 'timestamp'>) => void;
  addJournalEntry: (transcript: string, moodTag?: VoiceJournalEntry['moodTag']) => void;
  setConsent: (consent: ConsentRecord) => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: true, // Default true so user can navigate directly
      activeMode: 'caregiver',
      currentLanguage: 'en',
      caregiver: SEED_CAREGIVER,
      patient: SEED_PATIENT,
      familyMembers: SEED_FAMILY_MEMBERS,
      routine: SEED_ROUTINE,
      triggers: SEED_TRIGGERS,
      rooms: SEED_ROOMS,
      toneLogs: SEED_TONE_LOGS,
      gameResults: SEED_GAME_RESULTS,
      journalEntries: SEED_JOURNAL_ENTRIES,
      consent: {
        consentGiven: true,
        consentDate: new Date().toISOString(),
        consentedBy: 'Priya Sharma (Primary Caregiver)',
      },
      isGamePaused: false,

      loginAsDemo: () => {
        set({
          isAuthenticated: true,
          caregiver: SEED_CAREGIVER,
          patient: SEED_PATIENT,
          familyMembers: SEED_FAMILY_MEMBERS,
          routine: SEED_ROUTINE,
          triggers: SEED_TRIGGERS,
          rooms: SEED_ROOMS,
          toneLogs: SEED_TONE_LOGS,
          gameResults: SEED_GAME_RESULTS,
          journalEntries: SEED_JOURNAL_ENTRIES,
          currentLanguage: 'en',
          isGamePaused: false,
        });
      },

      login: (name: string, email: string) => {
        set({
          isAuthenticated: true,
          caregiver: {
            id: 'cg-' + Date.now(),
            name,
            email,
            phone: '+91 98765 43210',
            relationToPatient: 'Family Caregiver',
          },
        });
      },

      logout: () => {
        set({ isAuthenticated: false, activeMode: 'caregiver', isGamePaused: false });
      },

      setMode: (mode: 'caregiver' | 'patient') => {
        set({ activeMode: mode });
      },

      setLanguage: (lang: SupportedLanguage) => {
        set((state) => ({
          currentLanguage: lang,
          patient: { ...state.patient, language: lang },
        }));
      },

      setGamePaused: (paused: boolean) => {
        set({ isGamePaused: paused });
      },

      updatePatientProfile: (updates) => {
        set((state) => ({
          patient: { ...state.patient, ...updates },
        }));
      },

      addFamilyMember: (member) => {
        const newMember: FamilyMember = {
          ...member,
          id: 'fam-' + Date.now(),
        };
        set((state) => ({
          familyMembers: [...state.familyMembers, newMember],
        }));
      },

      updateFamilyMember: (id, updates) => {
        set((state) => ({
          familyMembers: state.familyMembers.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      deleteFamilyMember: (id) => {
        set((state) => ({
          familyMembers: state.familyMembers.filter((m) => m.id !== id),
        }));
      },

      toggleRoutineCompleted: (id) => {
        set((state) => ({
          routine: state.routine.map((r) =>
            r.id === id ? { ...r, completed: !r.completed } : r
          ),
        }));
      },

      addRoutineItem: (item) => {
        const newItem: RoutineItem = {
          ...item,
          id: 'rt-' + Date.now(),
        };
        set((state) => ({
          routine: [...state.routine, newItem],
        }));
      },

      addToneLog: (log) => {
        const newLog: ToneLog = {
          ...log,
          id: 'tl-' + Date.now(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          toneLogs: [newLog, ...state.toneLogs],
        }));
      },

      addGameResult: (result) => {
        const newResult: GameResult = {
          ...result,
          id: 'gr-' + Date.now(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          gameResults: [newResult, ...state.gameResults],
        }));
      },

      addJournalEntry: (transcript, moodTag = 'Peaceful') => {
        const newEntry: VoiceJournalEntry = {
          id: 'vj-' + Date.now(),
          date: new Date().toISOString().slice(0, 10),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          transcript,
          moodTag,
        };
        set((state) => ({
          journalEntries: [newEntry, ...state.journalEntries],
        }));
      },

      setConsent: (consent) => {
        set({ consent });
      },

      resetAll: () => {
        get().loginAsDemo();
      },
    }),
    {
      name: 'sahayak_app_storage',
    }
  )
);
