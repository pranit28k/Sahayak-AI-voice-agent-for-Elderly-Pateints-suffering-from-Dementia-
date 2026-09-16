// Web Speech API Voice Engine for Sahayak
// Provides speech synthesis (calm, slow cadence) and speech recognition (STT)

export interface VoiceEngineListener {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: string) => void;
}

class VoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  public isSynthesisSupported(): boolean {
    return this.synth !== null;
  }

  public speak(
    text: string,
    language: string = 'en',
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        onStart?.();
        setTimeout(() => {
          onEnd?.();
          resolve();
        }, 1500);
        return;
      }

      this.stop(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);

      // Dementia-friendly settings: calm, slightly slower pace
      utterance.rate = 0.84;
      utterance.pitch = 0.98;

      // Language tag selection
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (language === 'as') {
        utterance.lang = 'as-IN'; // Fallback will use Indian accent if as-IN missing
      } else {
        utterance.lang = 'en-IN';
      }

      // Voice selection (prefer natural Indian English or regional voice if available)
      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          (language === 'hi' && v.lang.startsWith('hi')) ||
          (language === 'as' && (v.lang.startsWith('as') || v.lang.startsWith('bn'))) ||
          (language === 'en' && (v.lang === 'en-IN' || v.name.includes('India')))
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        onEnd?.();
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        onEnd?.();
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  public startListening(
    language: string = 'en',
    callbacks: VoiceEngineListener
  ): boolean {
    if (!this.recognition) {
      callbacks.onError?.('Speech recognition is not supported in this browser.');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    if (language === 'hi') {
      this.recognition.lang = 'hi-IN';
    } else if (language === 'as') {
      this.recognition.lang = 'as-IN';
    } else {
      this.recognition.lang = 'en-IN';
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onSpeechStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const spokenText = finalTranscript || interim;
      if (spokenText) {
        callbacks.onTranscript?.(spokenText.trim(), Boolean(finalTranscript));
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      callbacks.onError?.(event.error || 'Speech recognition error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onSpeechEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('Recognition start failed:', err);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Recognition stop failed:', err);
      }
      this.isListening = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceEngine = new VoiceEngine();
