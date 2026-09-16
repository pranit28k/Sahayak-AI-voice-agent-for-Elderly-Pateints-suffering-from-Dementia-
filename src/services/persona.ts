// Sahayak Persona & Dementia Dialogue Engine
// Implements gentle demeanor, distress detection, calm reassurance, and voice intent routing

export interface PersonaResponse {
  spokenReply: string;
  detectedTone?: 'calm' | 'confused' | 'agitated' | 'withdrawn';
  isDistress: boolean;
  navigateTo?: string;
  triggerCallCaregiver?: boolean;
}

// Distress keywords across English, Hindi, and Assamese transliterations
const DISTRESS_KEYWORDS = [
  'help',
  'scared',
  'afraid',
  'fear',
  'lost',
  'who are you',
  'where am i',
  'where is my mother',
  'i want to go home',
  'pain',
  'hurt',
  'leaving me',
  'alone',
  'मदद',
  'डर',
  'कहाँ हूँ',
  'घर जाना है',
  'সহায়',
  'ভয়',
  'ক’ত আছোঁ',
];

export function evaluatePatientVoiceInput(
  rawInput: string,
  patientName: string = 'Dadu',
  caregiverName: string = 'Priya',
  language: string = 'en'
): PersonaResponse {
  const text = rawInput.toLowerCase().trim();

  // 1. Distress & Disorientation Check
  const hasDistress = DISTRESS_KEYWORDS.some((kw) => text.includes(kw));
  if (hasDistress) {
    if (language === 'hi') {
      return {
        spokenReply: `आप अपने प्यारे घर में बिल्कुल सुरक्षित हैं, ${patientName} जी। ${caregiverName} आपके साथ ही हैं। क्या मैं ${caregiverName} को अभी बुलाऊं?`,
        detectedTone: 'agitated',
        isDistress: true,
        triggerCallCaregiver: true,
      };
    } else if (language === 'as') {
      return {
        spokenReply: `আপুনি আপোনাৰ ঘৰতেই সম্পূৰ্ণ সুৰক্ষিত হৈ আছে, ${patientName}। ${caregiverName} আপোনাৰ কাষতেই আছে। মই ${caregiverName}ক মাতিম নেকি?`,
        detectedTone: 'agitated',
        isDistress: true,
        triggerCallCaregiver: true,
      };
    } else {
      return {
        spokenReply: `You are safe and warm at home, ${patientName}. ${caregiverName} is right here with you. Would you like me to call ${caregiverName} now?`,
        detectedTone: 'agitated',
        isDistress: true,
        triggerCallCaregiver: true,
      };
    }
  }

  // 2. Navigation Intent Check
  if (text.includes('game') || text.includes('puzzle') || text.includes('memory') || text.includes('खेल')) {
    return {
      spokenReply: `Let us play a gentle game together, ${patientName}.`,
      detectedTone: 'calm',
      isDistress: false,
      navigateTo: '/patient/games',
    };
  }

  if (text.includes('family') || text.includes('priya') || text.includes('aarav') || text.includes('daughter') || text.includes('परिवार')) {
    return {
      spokenReply: `Here is our loving family photo tree.`,
      detectedTone: 'calm',
      isDistress: false,
      navigateTo: '/patient/family',
    };
  }

  if (text.includes('routine') || text.includes('medicine') || text.includes('schedule') || text.includes('दवा') || text.includes('समय')) {
    return {
      spokenReply: `Let us look at today's schedule together.`,
      detectedTone: 'calm',
      isDistress: false,
      navigateTo: '/patient/routine',
    };
  }

  if (text.includes('journal') || text.includes('diary') || text.includes('day') || text.includes('डायरी')) {
    return {
      spokenReply: `I would love to hear how your day went.`,
      detectedTone: 'calm',
      isDistress: false,
      navigateTo: '/patient/journal',
    };
  }

  if (text.includes('house') || text.includes('kitchen') || text.includes('room') || text.includes('balcony') || text.includes('घर') || text.includes('रसोई')) {
    return {
      spokenReply: `Here is our home map. Tap any room and I will guide you.`,
      detectedTone: 'calm',
      isDistress: false,
      navigateTo: '/patient/house-map',
    };
  }

  if (text.includes('call') || text.includes('phone') || text.includes('फोन')) {
    return {
      spokenReply: `Connecting you with ${caregiverName} right away.`,
      detectedTone: 'calm',
      isDistress: false,
      triggerCallCaregiver: true,
    };
  }

  // 3. Repeated Questions or Gentle General Conversation
  // Persona rule: NEVER say "you already asked that" or show impatience.
  if (text.includes('who are you') || text.includes('what is your name')) {
    return {
      spokenReply: `I am Sahayak, your personal companion. I am always right here beside you, ${patientName}.`,
      detectedTone: 'calm',
      isDistress: false,
    };
  }

  if (text.includes('what time') || text.includes('what day') || text.includes('time is it')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      spokenReply: `It is ${timeStr} in the pleasant afternoon, ${patientName}. Everything is peaceful.`,
      detectedTone: 'calm',
      isDistress: false,
    };
  }

  // 4. Fallback Gentle Response
  if (language === 'hi') {
    return {
      spokenReply: `मैं आपकी बात ध्यान से सुन रहा हूँ, ${patientName} जी। आराम से बताइए।`,
      detectedTone: 'calm',
      isDistress: false,
    };
  } else if (language === 'as') {
    return {
      spokenReply: `মই আপোনাৰ কথা শুনি আছোঁ, ${patientName}। ধীৰে ধীৰে কওক।`,
      detectedTone: 'calm',
      isDistress: false,
    };
  } else {
    return {
      spokenReply: `I am right here with you, ${patientName}. Take your time, there is no hurry at all.`,
      detectedTone: 'calm',
      isDistress: false,
    };
  }
}
