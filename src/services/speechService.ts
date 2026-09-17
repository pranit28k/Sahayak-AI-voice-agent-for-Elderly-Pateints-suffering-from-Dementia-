// Unified Speech Service for Sahayak
// Integrates Sarvam AI for Indian regional languages (Hindi, Assamese, Bengali)
// with graceful browser Web Speech API fallback for English & offline scenarios.

const SARVAM_API_KEY = (import.meta as any)?.env?.VITE_SARVAM_API_KEY || '';

export interface SpeechService {
  transcribe(audioBlob: Blob, lang: string): Promise<string>;
  synthesize(text: string, lang: string, onStart?: () => void, onEnd?: () => void): Promise<void>;
}

class UniversalSpeechService implements SpeechService {
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Synthesize text to speech using Sarvam AI (for Indian languages) or browser Web Speech (for English)
   */
  public async synthesize(
    text: string,
    lang: string = 'en',
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stopAudio();

    // English uses the free, low-latency browser Web Speech API
    if (lang === 'en' || !SARVAM_API_KEY) {
      return this.synthesizeWithBrowser(text, lang, onStart, onEnd);
    }

    // Map language to Sarvam supported codes
    // Sarvam uses hi-IN for Hindi, and bn-IN for Assamese/Bengali Eastern Indic branch
    const sarvamLang = lang === 'hi' ? 'hi-IN' : 'bn-IN';

    try {
      onStart?.();
      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: sarvamLang,
          speaker: 'priya',
          model: 'bulbul:v3',
          pace: 0.85, // Dementia-friendly calm, slightly slow cadence
        }),
      });

      if (!response.ok) {
        throw new Error(`Sarvam TTS error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.audios && data.audios.length > 0) {
        await this.playBase64Audio(data.audios[0], onEnd);
      } else {
        throw new Error('No audio returned from Sarvam');
      }
    } catch (err) {
      console.warn('Sarvam TTS failed, falling back to browser synthesis:', err);
      return this.synthesizeWithBrowser(text, lang, onStart, onEnd);
    }
  }

  /**
   * Transcribe audio blob to text via Sarvam AI STT or browser fallback
   */
  public async transcribe(audioBlob: Blob, lang: string = 'en'): Promise<string> {
    if (lang === 'en' || !SARVAM_API_KEY) {
      // Browser STT handled via recognition stream
      return '';
    }

    const sarvamLang = lang === 'hi' ? 'hi-IN' : 'bn-IN';

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'speech.wav');
      formData.append('model', 'saaras:v1');
      formData.append('language_code', sarvamLang);

      const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Sarvam STT error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.transcript?.trim() || '';
    } catch (err) {
      console.warn('Sarvam STT failed:', err);
      return '';
    }
  }

  /**
   * Get graceful spoken retry prompt when speech is mumbled or empty
   */
  public getRetryPrompt(lang: string = 'en'): string {
    if (lang === 'hi') {
      return 'मैं ठीक से सुन नहीं पाई, क्या आप दोबारा कह सकते हैं?';
    } else if (lang === 'as') {
      return 'মই ভালদৰে ধৰিব নোৱাৰিলোঁ, অনুগ্ৰহ কৰি আকৌ এবাৰ ক’ব পাৰিবনে?';
    }
    return "I didn't quite catch that, could you say it again, please?";
  }

  private playBase64Audio(base64: string, onEnd?: () => void): Promise<void> {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(`data:audio/wav;base64,${base64}`);
        this.currentAudio = audio;

        audio.onended = () => {
          this.currentAudio = null;
          onEnd?.();
          resolve();
        };

        audio.onerror = () => {
          this.currentAudio = null;
          onEnd?.();
          resolve();
        };

        audio.play().catch((err) => {
          console.warn('Audio play failed:', err);
          onEnd?.();
          resolve();
        });
      } catch (err) {
        onEnd?.();
        resolve();
      }
    });
  }

  private synthesizeWithBrowser(
    text: string,
    lang: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onStart?.();
        setTimeout(() => {
          onEnd?.();
          resolve();
        }, 1200);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.84; // Calm, unhurried
      utterance.pitch = 0.98;

      if (lang === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (lang === 'as') {
        utterance.lang = 'bn-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      utterance.onstart = () => onStart?.();
      utterance.onend = () => {
        onEnd?.();
        resolve();
      };
      utterance.onerror = () => {
        onEnd?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new UniversalSpeechService();
