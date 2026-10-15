// Web Speech Recognition (Voice Commands) Service
// Handles microphone permissions, recognition lifecycle, and state reporting.

export type SpeechRecognitionStatus =
  | 'idle'
  | 'requesting'
  | 'listening'
  | 'processing'
  | 'error'
  | 'unsupported';

type CommandCallback = (command: string, rawTranscript: string) => void;
type StateCallback = (isListening: boolean, status: SpeechRecognitionStatus, errorMsg?: string) => void;

class SpeechRecognitionService {
  private recognition: any = null;
  public isListening: boolean = false;
  public isContinuousActive: boolean = false;
  public status: SpeechRecognitionStatus = 'idle';
  public currentLanguage: string = 'en-US';
  public lastErrorMessage: string = '';

  private autoRestartTimer: any = null;
  private stateListeners: Set<StateCallback> = new Set();
  private commandCallbacks: Set<CommandCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = this.currentLanguage;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.status = 'listening';
          this.lastErrorMessage = '';
          this.notifyState();
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.status !== 'error') {
            this.status = 'idle';
          }
          this.notifyState();

          // Auto keep-alive restart if continuous hands-free mode is enabled
          if (this.isContinuousActive && this.status !== 'error') {
            clearTimeout(this.autoRestartTimer);
            this.autoRestartTimer = setTimeout(() => {
              if (this.isContinuousActive && !this.isListening) {
                try {
                  this.recognition.start();
                } catch (e) {
                  // Already starting or active
                }
              }
            }, 300);
          }
        };

        this.recognition.onerror = (event: any) => {
          this.isListening = false;
          this.status = 'error';

          switch (event.error) {
            case 'not-allowed':
            case 'service-not-allowed':
              this.isContinuousActive = false;
              this.lastErrorMessage =
                'Microphone access was denied. Please allow microphone permissions in your browser address bar.';
              break;
            case 'no-speech':
              this.lastErrorMessage = 'No speech detected. Listening continues...';
              if (this.isContinuousActive) {
                this.status = 'idle';
                clearTimeout(this.autoRestartTimer);
                this.autoRestartTimer = setTimeout(() => {
                  if (this.isContinuousActive && !this.isListening) {
                    try {
                      this.recognition.start();
                    } catch (e) {}
                  }
                }, 400);
              }
              break;
            case 'network':
              this.lastErrorMessage =
                'Speech recognition service network error. Please check your internet connection.';
              break;
            case 'audio-capture':
              this.isContinuousActive = false;
              this.lastErrorMessage = 'No microphone device was detected on your computer or headset.';
              break;
            case 'aborted':
              this.lastErrorMessage = 'Speech listening was cancelled.';
              break;
            default:
              this.lastErrorMessage = `Speech recognition error: ${event.error || 'Unknown'}`;
              break;
          }

          console.warn('[SpeechRecognition]', this.lastErrorMessage);
          this.notifyState();
        };

        this.recognition.onresult = (event: any) => {
          const lastIndex = event.results.length - 1;
          const transcript = event.results[lastIndex][0].transcript.trim();
          this.dispatchCommand(transcript);
        };
      } else {
        this.status = 'unsupported';
        this.lastErrorMessage =
          'Web Speech Recognition is not supported by your browser. Please try Chrome, Edge, or Safari.';
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public setLanguage(lang: 'en-US' | 'ta-IN'): void {
    this.currentLanguage = lang;
    if (this.recognition) {
      const wasListening = this.isListening;
      if (wasListening) {
        this.stop();
      }
      this.recognition.lang = lang;
      if (wasListening) {
        setTimeout(() => this.start(), 200);
      }
    }
  }

  public subscribeState(listener: StateCallback): () => void {
    this.stateListeners.add(listener);
    listener(this.isListening, this.status, this.lastErrorMessage);
    return () => this.stateListeners.delete(listener);
  }

  public onCommand(callback: CommandCallback): () => void {
    this.commandCallbacks.add(callback);
    return () => this.commandCallbacks.delete(callback);
  }

  private notifyState() {
    this.stateListeners.forEach((fn) =>
      fn(this.isListening, this.status, this.lastErrorMessage)
    );
  }

  private dispatchCommand(transcript: string) {
    this.commandCallbacks.forEach((cb) => cb(transcript, transcript));
  }

  public start(continuous: boolean = true): void {
    if (!this.isSupported()) {
      this.status = 'unsupported';
      this.lastErrorMessage = 'Speech recognition is not supported in this browser.';
      this.notifyState();
      return;
    }

    if (continuous) {
      this.isContinuousActive = true;
    }

    if (!this.isListening) {
      try {
        this.status = 'requesting';
        this.notifyState();
        this.recognition.start();
      } catch (e: any) {
        if (e.name === 'InvalidStateError') {
          return;
        }
        console.error('Failed to start speech recognition:', e);
        this.status = 'error';
        this.lastErrorMessage = e.message || 'Failed to start microphone. Please check microphone permissions.';
        this.notifyState();
      }
    }
  }

  public stop(): void {
    this.isContinuousActive = false;
    clearTimeout(this.autoRestartTimer);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }
    this.isListening = false;
    this.status = 'idle';
    this.notifyState();
  }
}

export const speechRecognition = new SpeechRecognitionService();
