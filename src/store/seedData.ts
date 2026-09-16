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
} from '../types';

export const SEED_CAREGIVER: CaregiverProfile = {
  id: 'cg-1',
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  phone: '+91 98640 12345',
  relationToPatient: 'Daughter',
};

export const SEED_PATIENT: PatientProfile = {
  id: 'pt-1',
  name: 'Ramesh Chandra Sharma',
  preferredName: 'Dadu',
  age: 76,
  city: 'Guwahati, Assam',
  language: 'en',
  wakeTime: '07:00 AM',
  sleepTime: '09:30 PM',
  hobbies: ['Gardening marigolds', 'Rabindra Sangeet & old radio', 'Chess', 'Assam tea tasting'],
  pastOccupation: 'Retired Chief Engineer, Northeast Frontier Railway',
  specialNotes: 'Prefers being spoken to respectfully as Dadu or Ramesh ji. Best focus during morning hours.',
};

export const SEED_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam-1',
    name: 'Priya Sharma',
    relation: 'Daughter & Primary Caregiver',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    greetingText: 'Namaste Baba, it is Priya. I am right here in the next room if you need anything. Have a peaceful day!',
    phone: '+91 98640 12345',
  },
  {
    id: 'fam-2',
    name: 'Aarav Sharma',
    relation: 'Grandson (Age 14)',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    greetingText: 'Hello Dadu! It is Aarav. After school let us sit on the balcony and look at the birds together!',
    phone: '+91 98640 12346',
  },
  {
    id: 'fam-3',
    name: 'Dr. Neha Sharma',
    relation: 'Daughter-in-law',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    greetingText: 'Pranam Baba, Neha here. Please remember to sip warm water through the day and rest after lunch.',
    phone: '+91 98640 12347',
  },
  {
    id: 'fam-4',
    name: 'Vikram Sharma',
    relation: 'Son (Living in Bengaluru)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    greetingText: 'Namaste Baba, Vikram here. I will video call you this Sunday evening. Love you always.',
    phone: '+91 98640 12348',
  },
];

export const SEED_ROUTINE: RoutineItem[] = [
  {
    id: 'rt-1',
    time: '07:30 AM',
    title: 'Morning Warm Water & BP Medicine',
    category: 'medicine',
    dosage: 'Amlodipine 5mg (1 tablet)',
    notes: 'Taken after brushing teeth',
    completed: true,
  },
  {
    id: 'rt-2',
    time: '08:30 AM',
    title: 'Nourishing Breakfast',
    category: 'meal',
    dosage: 'Soft porridge or idli with Assam tea',
    completed: true,
  },
  {
    id: 'rt-3',
    time: '10:30 AM',
    title: 'Cognitive Brain Games with Sahayak',
    category: 'activity',
    notes: 'Memory card matching and family photo recognition',
    completed: true,
  },
  {
    id: 'rt-4',
    time: '01:00 PM',
    title: 'Lunch & Multivitamin',
    category: 'medicine',
    dosage: 'Neuro-B Complex tablet with warm meal',
    completed: false,
  },
  {
    id: 'rt-5',
    time: '02:00 PM',
    title: 'Afternoon Rest & Soft Music',
    category: 'rest',
    notes: 'Calm instrumental music in the bedroom',
    completed: false,
  },
  {
    id: 'rt-6',
    time: '05:00 PM',
    title: 'Evening Tea & Garden Walk',
    category: 'activity',
    notes: '15-minute gentle stroll in the balcony garden with Priya',
    completed: false,
  },
  {
    id: 'rt-7',
    time: '08:00 PM',
    title: 'Dinner & Cognitive Health Medicine',
    category: 'medicine',
    dosage: 'Donepezil 5mg (1 tablet with warm milk)',
    completed: false,
  },
  {
    id: 'rt-8',
    time: '09:30 PM',
    title: 'Nighttime Sleep Routine',
    category: 'rest',
    notes: 'Dim lights and soothing bedtime story with Sahayak',
    completed: false,
  },
];

export const SEED_TRIGGERS: AgitationTrigger[] = [
  {
    id: 'tr-1',
    trigger: 'Sudden loud sounds (pressure cooker, construction)',
    guidanceForSahayak: 'Reassure that the sound is safe and outside. Suggest taking three slow deep breaths together.',
  },
  {
    id: 'tr-2',
    trigger: 'Asking repeatedly about deceased parents or childhood hometown',
    guidanceForSahayak: 'Never say "they passed away". Gently validate feelings: "You have such fond memories of them. Tell me what you loved doing most."',
  },
  {
    id: 'tr-3',
    trigger: 'Twilight confusion / sundowning around 6:00 PM',
    guidanceForSahayak: 'Turn on warm gentle lighting. Play peaceful Rabindra Sangeet melody and invite Priya over.',
  },
];

export const SEED_ROOMS: RoomLayout[] = [
  {
    id: 'rm-1',
    name: 'Bedroom',
    direction: 'End of the hallway',
    description: 'Quiet room with your favourite armchair and garden window.',
    photoUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=600&q=80',
    guidanceVoiceText: 'You are right next to your bedroom, Dadu. Your warm woollen shawl is resting on the armchair.',
  },
  {
    id: 'rm-2',
    name: 'Living Room',
    direction: 'Straight ahead',
    description: 'Spacious room with family portraits, radio, and comfortable sofa.',
    photoUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
    guidanceVoiceText: 'The living room is straight ahead. The radio is playing soothing instrumental music.',
  },
  {
    id: 'rm-3',
    name: 'Kitchen',
    direction: 'Turn right at the wooden dining table',
    description: 'Bright kitchen where Priya prepares fresh meals and warm Assam tea.',
    photoUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    guidanceVoiceText: 'The kitchen is just past the dining table to your right. Priya has fresh warm water ready for you.',
  },
  {
    id: 'rm-4',
    name: 'Balcony Garden',
    direction: 'Through the living room glass door',
    description: 'Open verandah filled with fragrant yellow marigolds and green tea plants.',
    photoUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
    guidanceVoiceText: 'The balcony garden is through the glass doors. The gentle afternoon breeze is lovely today.',
  },
];

export const SEED_TONE_LOGS: ToneLog[] = [
  {
    id: 'tl-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    tone: 'calm',
    context: 'Completed memory game with 100% accuracy and laughed with granddaughter',
  },
  {
    id: 'tl-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    tone: 'confused',
    context: 'Asked twice where his railway blueprint folder was; reassured gently by Sahayak',
    triggerDetected: 'Displaced personal item',
  },
  {
    id: 'tl-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    tone: 'calm',
    context: 'Enjoyed morning tea on the balcony while listening to morning birds',
  },
  {
    id: 'tl-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    tone: 'agitated',
    context: 'Sundowning discomfort around dusk; loud siren passed nearby',
    triggerDetected: 'Loud external noise & dusk shadow',
  },
  {
    id: 'tl-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    tone: 'calm',
    context: 'Recognized Aarav and Vikram on the family photo tree and smiled',
  },
  {
    id: 'tl-6',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    tone: 'withdrawn',
    context: 'Reluctant to speak during afternoon journal; Sahayak offered quiet pause',
  },
  {
    id: 'tl-7',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    tone: 'calm',
    context: 'Participated actively in memory matching game with Priya nearby',
  },
];

export const SEED_GAME_RESULTS: GameResult[] = [
  {
    id: 'gr-1',
    gameType: 'memory_match',
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    score: 100,
    maxScore: 100,
    difficulty: 2,
    reactionTimeSec: 3.8,
    completed: true,
    notes: 'Completed 6-card pair match in 45 seconds with calm focus',
  },
  {
    id: 'gr-2',
    gameType: 'face_recognition',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    score: 100,
    maxScore: 100,
    difficulty: 1,
    reactionTimeSec: 4.1,
    completed: true,
    notes: 'Instantly recognized daughter Priya and grandson Aarav',
  },
  {
    id: 'gr-3',
    gameType: 'memory_match',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    score: 80,
    maxScore: 100,
    difficulty: 2,
    reactionTimeSec: 4.9,
    completed: true,
    notes: 'Needed one gentle hint from Sahayak on card 4',
  },
  {
    id: 'gr-4',
    gameType: 'face_recognition',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    score: 90,
    maxScore: 100,
    difficulty: 1,
    reactionTimeSec: 4.5,
    completed: true,
    notes: 'Smiled warmly when seeing daughter-in-law Neha',
  },
  {
    id: 'gr-5',
    gameType: 'memory_match',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    score: 85,
    maxScore: 100,
    difficulty: 1,
    reactionTimeSec: 5.2,
    completed: true,
    notes: 'Played in the morning before breakfast',
  },
];

export const SEED_JOURNAL_ENTRIES: VoiceJournalEntry[] = [
  {
    id: 'vj-1',
    date: new Date().toISOString().slice(0, 10),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    transcript: 'Today Aarav showed me his science drawing of the Brahmaputra river. It had big green hills. We sat together and had sweet yellow papaya. The breeze was very nice.',
    moodTag: 'Peaceful',
  },
  {
    id: 'vj-2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
    timestamp: '06:15 PM',
    transcript: 'Priya made ginger cardamom tea for us. I watered the yellow marigolds on the verandah. I remembered the old railway station at Lumding where I worked many years ago.',
    moodTag: 'Nostalgic',
  },
  {
    id: 'vj-3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().slice(0, 10),
    timestamp: '05:45 PM',
    transcript: 'We listened to a lovely morning flute song. Sahayak helped me remember where my glasses were. I felt peaceful and rested well in the afternoon.',
    moodTag: 'Peaceful',
  },
];
