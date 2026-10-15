// Live Speech-to-Text Transcription Service for Deaf & Hard-of-Hearing Users
// Real-time caption generation using browser Web Speech API.

type CaptionCallback = (caption: { text: string; isFinal: boolean; timestamp: string }) => void;

class LiveTranscriptionService {
  private recognition: any = null;
  public isListening: boolean = false;
  private listeners: Set<(isListening: boolean) => void> = new Set();
  private captionCallbacks: Set<CaptionCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.notifyState();
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.notifyState();
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Transcription error:', event.error);
          this.isListening = false;
          this.notifyState();
        };

        this.recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            const isFinal = event.results[i].isFinal;
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            this.captionCallbacks.forEach((cb) =>
              cb({ text: transcript, isFinal, timestamp: now })
            );
          }
        };
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public subscribeState(listener: (isListening: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isListening);
    return () => this.listeners.delete(listener);
  }

  public onCaption(callback: CaptionCallback): () => void {
    this.captionCallbacks.add(callback);
    return () => this.captionCallbacks.delete(callback);
  }

  private notifyState() {
    this.listeners.forEach((fn) => fn(this.isListening));
  }

  public start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error('Failed to start live transcription:', e);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Failed to stop live transcription:', e);
      }
    }
  }
}

export const liveTranscription = new LiveTranscriptionService();
