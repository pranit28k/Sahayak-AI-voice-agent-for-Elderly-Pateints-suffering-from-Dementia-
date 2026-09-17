// Dynamic Multilingual Dialogue Generation via LLM for Sahayak
// Strictly enforces the calm, respectful dementia-care persona across all languages.

const GEMINI_API_KEY = (import.meta as any)?.env?.VITE_GEMINI_API_KEY || '';

export interface LLMResponse {
  spokenReply: string;
  isDistress: boolean;
  detectedTone: 'calm' | 'confused' | 'agitated' | 'withdrawn';
  suggestedAction?: 'call_caregiver' | 'navigate_games' | 'navigate_family' | 'navigate_routine' | 'navigate_journal' | 'navigate_house';
}

const DISTRESS_KEYWORDS = [
  'help', 'scared', 'afraid', 'fear', 'lost', 'who are you', 'where am i',
  'where is my mother', 'i want to go home', 'pain', 'hurt', 'alone',
  'मदद', 'डर', 'कहाँ हूँ', 'घर जाना है', 'সহায়', 'ভয়', 'ক’ত আছোঁ',
];

export async function generateDialogueWithLLM(
  userInput: string,
  patientName: string = 'Dadu',
  caregiverName: string = 'Priya',
  language: 'en' | 'hi' | 'as' = 'en'
): Promise<LLMResponse> {
  const text = userInput.toLowerCase().trim();

  // 1. Immediate Safety Distress Check
  const hasDistress = DISTRESS_KEYWORDS.some((kw) => text.includes(kw));
  if (hasDistress) {
    let reply = `You are safe and warm at home, ${patientName}. ${caregiverName} is right here with you. Would you like me to call ${caregiverName}?`;
    if (language === 'hi') {
      reply = `आप अपने प्यारे घर में बिल्कुल सुरक्षित हैं, ${patientName} जी। ${caregiverName} आपके साथ ही हैं। क्या मैं ${caregiverName} को अभी बुलाऊं?`;
    } else if (language === 'as') {
      reply = `আপুনি আপোনাৰ ঘৰতেই সম্পূৰ্ণ সুৰক্ষিত হৈ আছে, ${patientName}। ${caregiverName} আপোনাৰ কাষতেই আছে। মই ${caregiverName}ক মাতিম নেকি?`;
    }

    return {
      spokenReply: reply,
      isDistress: true,
      detectedTone: 'agitated',
      suggestedAction: 'call_caregiver',
    };
  }

  // 2. Navigation Intent Quick Check
  if (text.includes('game') || text.includes('puzzle') || text.includes('खेल') || text.includes('খেল') || text.includes('dots')) {
    let reply = `Let us play a gentle game together, ${patientName}.`;
    if (language === 'hi') reply = `आइए मस्तिष्क खेल खेलते हैं, ${patientName} जी।`;
    if (language === 'as') reply = `আহক আমি একেলগে এটা শান্ত খেল খেলোঁ, ${patientName}।`;
    return {
      spokenReply: reply,
      isDistress: false,
      detectedTone: 'calm',
      suggestedAction: 'navigate_games',
    };
  }
  if (text.includes('family') || text.includes('priya') || text.includes('aarav') || text.includes('परिवार') || text.includes('পৰিয়াল')) {
    let reply = `Here is our loving family photo tree, ${patientName}.`;
    if (language === 'hi') reply = `यह रहा हमारा परिवार फोटो वृक्ष, ${patientName} जी।`;
    if (language === 'as') reply = `এইয়া আমাৰ মৰমৰ পৰিয়ালৰ ফটো, ${patientName}।`;
    return {
      spokenReply: reply,
      isDistress: false,
      detectedTone: 'calm',
      suggestedAction: 'navigate_family',
    };
  }
  if (text.includes('routine') || text.includes('medicine') || text.includes('schedule') || text.includes('दवा') || text.includes('ঔষধ') || text.includes('দৰব')) {
    let reply = `Let us look at today's schedule and medicines together, ${patientName}.`;
    if (language === 'hi') reply = `आइए आज की दिनचर्या और दवाएं देखते हैं।`;
    if (language === 'as') reply = `আহক আজিৰ সময়সূচী আৰু ঔষধবোৰ একেলগে চাওঁ, ${patientName}।`;
    return {
      spokenReply: reply,
      isDistress: false,
      detectedTone: 'calm',
      suggestedAction: 'navigate_routine',
    };
  }
  if (text.includes('journal') || text.includes('diary') || text.includes('डायरी') || text.includes('দিনলিপি')) {
    let reply = `I would love to hear how your day went, ${patientName}.`;
    if (language === 'hi') reply = `मुझे अपने दिन के बारे में बताइए, मैं सुन रहा हूँ।`;
    if (language === 'as') reply = `আপোনাৰ দিনটো কেনেকুৱা গ’ল কওক, মই শুনি আছোঁ, ${patientName}।`;
    return {
      spokenReply: reply,
      isDistress: false,
      detectedTone: 'calm',
      suggestedAction: 'navigate_journal',
    };
  }
  if (text.includes('house') || text.includes('kitchen') || text.includes('room') || text.includes('घर') || text.includes('ৰান্ধনিশাল') || text.includes('কোঠা')) {
    let reply = `Here is our home guide. Tap any room and I will direct you.`;
    if (language === 'hi') reply = `यह हमारे घर का नक़्शा है। किसी भी कमरे को छुएं।`;
    if (language === 'as') reply = `এইয়া আমাৰ ঘৰৰ নিৰ্দেশনা। যিকোনো কোঠাত টিপক, মই সহায় কৰিম।`;
    return {
      spokenReply: reply,
      isDistress: false,
      detectedTone: 'calm',
      suggestedAction: 'navigate_house',
    };
  }

  // 3. Real LLM Call via Gemini API if API key is present
  if (GEMINI_API_KEY) {
    const langInstructions = {
      en: 'English (warm Indian English phrasing)',
      hi: 'Hindi (हिंदी script only)',
      as: 'Assamese (অসমীয়া script only)',
    };

    const systemInstruction = `You are "Sahayak", a calm, unhurried, gentle, and respectful AI voice companion for an elderly person (${patientName}) with mild cognitive impairment/dementia in Guwahati, Assam.
Strict Persona Rules:
1. Speak in short, single-instruction, gentle sentences (1-2 sentences maximum, under 25 words).
2. Never give medical advice, diagnoses, or clinical terms.
3. If the user asks a repetitive question (e.g. "what time is it", "who are you"), respond with the exact same unhurried warmth. Never say "you already asked that" or show impatience.
4. You MUST respond ONLY in ${langInstructions[language]}. Do not mix languages.`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nPatient says: "${userInput}"\n\nSahayak's gentle reply:` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 60,
            temperature: 0.3,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (generatedText) {
          return {
            spokenReply: generatedText,
            isDistress: false,
            detectedTone: 'calm',
          };
        }
      }
    } catch (err) {
      console.warn('Gemini LLM call failed, falling back to persona generator:', err);
    }
  }

  // 4. Empathetic Multi-turn Fallback Persona Generator (Equally rich across all languages)
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (text.includes('time') || text.includes('समय') || text.includes('সময়') || text.includes('বজা') || text.includes('বাজি') || text.includes('day') || text.includes('दिन') || text.includes('দিন')) {
    if (language === 'hi') {
      return {
        spokenReply: `अभी दोपहर के ${timeStr} बजे हैं, ${patientName} जी। बाहर मौसम बहुत सुहावना है।`,
        isDistress: false,
        detectedTone: 'calm',
      };
    } else if (language === 'as') {
      return {
        spokenReply: `এতিয়া সময় ${timeStr}, ${patientName}। দিনটো বৰ শান্ত আৰু ধুনীয়া হৈ আছে।`,
        isDistress: false,
        detectedTone: 'calm',
      };
    } else {
      return {
        spokenReply: `It is ${timeStr} right now, ${patientName}. Everything is calm and peaceful.`,
        isDistress: false,
        detectedTone: 'calm',
      };
    }
  }

  if (text.includes('who are you') || text.includes('तुम कौन हो') || text.includes('আপুনি কোন')) {
    if (language === 'hi') {
      return {
        spokenReply: `मैं सहायक हूँ, आपका देखभाल साथी। मैं हमेशा आपके साथ ही हूँ, ${patientName} जी।`,
        isDistress: false,
        detectedTone: 'calm',
      };
    } else if (language === 'as') {
      return {
        spokenReply: `মই আপোনাৰ বন্ধু সহায়ক। মই সদায় আপোনাৰ কাষতেই আছোঁ, ${patientName}।`,
        isDistress: false,
        detectedTone: 'calm',
      };
    } else {
      return {
        spokenReply: `I am Sahayak, your personal memory companion. I am always right here beside you, ${patientName}.`,
        isDistress: false,
        detectedTone: 'calm',
      };
    }
  }

  // General warm acknowledgement
  if (language === 'hi') {
    return {
      spokenReply: `मैं आपकी बात प्यार से सुन रहा हूँ, ${patientName} जी। आराम से बताइए।`,
      isDistress: false,
      detectedTone: 'calm',
    };
  } else if (language === 'as') {
    return {
      spokenReply: `মই আপোনাৰ কথা শুনি আছোঁ, ${patientName}। ধীৰে ধীৰে কওক, কোনো খৰখেদা নাই।`,
      isDistress: false,
      detectedTone: 'calm',
    };
  }

  return {
    spokenReply: `I am right here listening to you, ${patientName}. Take all the time you need.`,
    isDistress: false,
    detectedTone: 'calm',
  };
}
