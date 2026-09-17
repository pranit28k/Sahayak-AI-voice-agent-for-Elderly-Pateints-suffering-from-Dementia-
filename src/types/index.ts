export type SupportedLanguage = 'en' | 'hi' | 'as';

export interface CaregiverProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationToPatient: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  preferredName: string;
  age: number;
  city: string;
  language: SupportedLanguage;
  wakeTime: string;
  sleepTime: string;
  hobbies: string[];
  pastOccupation?: string;
  specialNotes?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  photoUrl: string;
  greetingText: string;
  phone?: string;
}

export interface RoutineItem {
  id: string;
  time: string; // e.g., "08:00 AM"
  title: string;
  category: 'medicine' | 'meal' | 'activity' | 'rest';
  dosage?: string;
  notes?: string;
  completed: boolean;
}

export interface AgitationTrigger {
  id: string;
  trigger: string;
  guidanceForSahayak: string;
}

export interface RoomLayout {
  id: string;
  name: string;
  direction: string;
  description: string;
  photoUrl: string;
  guidanceVoiceText: string;
}

export type ToneState = 'calm' | 'confused' | 'agitated' | 'withdrawn';

export interface ToneLog {
  id: string;
  timestamp: string; // ISO string
  tone: ToneState;
  context: string;
  triggerDetected?: string;
}

export interface GameResult {
  id: string;
  gameType:
    | 'memory_match'
    | 'face_recognition'
    | 'connect_dots'
    | 'spot_difference'
    | 'sequence_arranging'
    | 'object_naming'
    | 'photo_puzzle';
  timestamp: string;
  score: number;
  maxScore: number;
  difficulty: number;
  reactionTimeSec: number;
  completed: boolean;
  notes?: string;
}

export interface VoiceJournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  transcript: string;
  moodTag?: 'Peaceful' | 'Reflective' | 'Nostalgic' | 'Tired';
}

export interface ConsentRecord {
  consentGiven: boolean;
  consentDate: string;
  consentedBy: string;
}
