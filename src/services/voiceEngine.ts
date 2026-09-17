// Voice Engine for Sahayak
// Coordinates speechService (Sarvam AI for Indic languages, browser fallback for English)
// and handles audio listeners with graceful retry handling.

import { speechService } from './speechService';

export interface VoiceEngineListener {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: string) => void;
}

class VoiceEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private hadSpeechInSession: boolean = false;

  constructor() {
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

  public speak(
    text: string,
    language: string = 'en',
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.isSpeaking = true;
    return speechService.synthesize(
      text,
      language,
      () => {
        this.isSpeaking = true;
        onStart?.();
      },
      () => {
        this.isSpeaking = false;
        onEnd?.();
      }
    );
  }

  public stop(): void {
    speechService.stopAudio();
    this.isSpeaking = false;
  }

  private wasCancelledManually: boolean = false;

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

    this.hadSpeechInSession = false;
    this.wasCancelledManually = false;

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
      if (spokenText.trim()) {
        this.hadSpeechInSession = true;
        callbacks.onTranscript?.(spokenText.trim(), Boolean(finalTranscript));
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      // If error was no-speech or network and no speech was captured, handle gracefully with a spoken retry prompt
      if (!this.hadSpeechInSession && !this.isSpeaking && event.error !== 'aborted') {
        const retryText = speechService.getRetryPrompt(language);
        this.speak(retryText, language);
      }
      callbacks.onError?.(event.error || 'Speech recognition error');
    };

    this.recognition.onend = () => {
      const hadSpeech = this.hadSpeechInSession;
      const wasCancelled = this.wasCancelledManually;
      this.isListening = false;
      callbacks.onSpeechEnd?.();

      if (!hadSpeech && !wasCancelled && !this.isSpeaking) {
        const retryText = speechService.getRetryPrompt(language);
        this.speak(retryText, language);
      }
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
    this.wasCancelledManually = true;
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
