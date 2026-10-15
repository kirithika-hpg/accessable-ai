// Browser-based local head tracking & optical motion pointer service
// 100% local processing in browser; zero camera frames sent to any server.

export interface HeadTrackerState {
  isActive: boolean;
  isPaused: boolean;
  cursorX: number;
  cursorY: number;
  dwellProgress: number; // 0 to 100%
  hoveredElement: HTMLElement | null;
  status: 'idle' | 'requesting_permission' | 'calibrating' | 'tracking' | 'error' | 'unsupported';
  errorMessage?: string;
}

type StateListener = (state: HeadTrackerState) => void;

class HeadTrackerService {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;

  private state: HeadTrackerState = {
    isActive: false,
    isPaused: false,
    cursorX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    cursorY: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    dwellProgress: 0,
    hoveredElement: null,
    status: 'idle',
  };

  private listeners: Set<StateListener> = new Set();

  // Settings
  public sensitivity: number = 2.4;
  public deadZone: number = 2.0;
  public smoothing: number = 0.25;
  public dwellDelayMs: number = 1000;

  // Tracking reference positions
  private prevFrameData: Uint8ClampedArray | null = null;
  private originX: number = 160;
  private originY: number = 120;
  private currentOffsetX: number = 0;
  private currentOffsetY: number = 0;

  // Dwell management
  private dwellStartTime: number | null = null;
  private currentTargetElement: HTMLElement | null = null;

  public isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia
    );
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private emitState() {
    this.listeners.forEach((fn) => fn({ ...this.state }));
  }

  public async start(): Promise<void> {
    if (!this.isSupported()) {
      this.state.status = 'unsupported';
      this.state.errorMessage = 'Webcam access is not supported by your browser.';
      this.emitState();
      return;
    }

    if (this.state.isActive) return;

    this.state.status = 'requesting_permission';
    this.emitState();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
        },
        audio: false,
      });

      this.video = document.createElement('video');
      this.video.width = 320;
      this.video.height = 240;
      this.video.autoplay = true;
      this.video.playsInline = true;
      this.video.srcObject = this.stream;

      this.canvas = document.createElement('canvas');
      this.canvas.width = 320;
      this.canvas.height = 240;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      await new Promise<void>((resolve) => {
        if (!this.video) return resolve();
        this.video.onloadedmetadata = () => {
          this.video?.play().then(() => resolve()).catch(() => resolve());
        };
      });

      this.state.isActive = true;
      this.state.isPaused = false;
      this.state.status = 'tracking';
      this.state.cursorX = window.innerWidth / 2;
      this.state.cursorY = window.innerHeight / 2;
      this.emitState();

      // Begin tracking loop
      this.runProcessingLoop();
    } catch (err: any) {
      this.state.status = 'error';
      this.state.isActive = false;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.state.errorMessage = 'Webcam permission was denied. You can grant access in browser settings or use keyboard / voice mode.';
      } else {
        this.state.errorMessage = err.message || 'Could not connect to webcam.';
      }
      this.emitState();
    }
  }

  public calibrate(): void {
    // Re-center origin based on current optical centroid
    this.currentOffsetX = 0;
    this.currentOffsetY = 0;
    this.state.cursorX = window.innerWidth / 2;
    this.state.cursorY = window.innerHeight / 2;
    this.prevFrameData = null;
    this.emitState();
  }

  public pause(): void {
    this.state.isPaused = true;
    this.emitState();
  }

  public resume(): void {
    this.state.isPaused = false;
    this.emitState();
  }

  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video = null;
    }

    this.prevFrameData = null;
    this.currentTargetElement = null;
    this.dwellStartTime = null;

    this.state = {
      isActive: false,
      isPaused: false,
      cursorX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
      cursorY: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
      dwellProgress: 0,
      hoveredElement: null,
      status: 'idle',
    };
    this.emitState();
  }

  private runProcessingLoop = () => {
    if (!this.state.isActive) return;

    if (!this.state.isPaused && this.video && this.ctx && this.video.readyState >= 2) {
      this.processWebcamFrame();
    }

    this.animationFrameId = requestAnimationFrame(this.runProcessingLoop);
  };

  private processWebcamFrame() {
    if (!this.ctx || !this.video) return;

    this.ctx.drawImage(this.video, 0, 0, 320, 240);
    const frame = this.ctx.getImageData(0, 0, 320, 240);
    const data = frame.data;

    // Optical centroid motion detection in central region (face box 60..260 x 40..200)
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    if (this.prevFrameData) {
      for (let y = 40; y < 200; y += 4) {
        for (let x = 60; x < 260; x += 4) {
          const idx = (y * 320 + x) * 4;
          // Compute luminance delta
          const lumCurr = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const lumPrev =
            0.299 * this.prevFrameData[idx] +
            0.587 * this.prevFrameData[idx + 1] +
            0.114 * this.prevFrameData[idx + 2];

          const diff = Math.abs(lumCurr - lumPrev);
          if (diff > 18) {
            weightedX += x * diff;
            weightedY += y * diff;
            totalWeight += diff;
          }
        }
      }
    }

    this.prevFrameData = new Uint8ClampedArray(data);

    if (totalWeight > 400) {
      const avgX = weightedX / totalWeight;
      const avgY = weightedY / totalWeight;

      // Mirrored horizontal delta: moving head right means looking right
      const rawDeltaX = -(avgX - this.originX);
      const rawDeltaY = avgY - this.originY;

      // Dead-zone filter
      const dx = Math.abs(rawDeltaX) > this.deadZone ? rawDeltaX : 0;
      const dy = Math.abs(rawDeltaY) > this.deadZone ? rawDeltaY : 0;

      // Exponential moving average smoothing
      this.currentOffsetX = this.currentOffsetX * (1 - this.smoothing) + dx * this.sensitivity * this.smoothing;
      this.currentOffsetY = this.currentOffsetY * (1 - this.smoothing) + dy * this.sensitivity * this.smoothing;

      // Compute target cursor position
      const newX = Math.max(
        10,
        Math.min(window.innerWidth - 10, window.innerWidth / 2 + this.currentOffsetX * 20)
      );
      const newY = Math.max(
        10,
        Math.min(window.innerHeight - 10, window.innerHeight / 2 + this.currentOffsetY * 20)
      );

      this.state.cursorX = newX;
      this.state.cursorY = newY;
    }

    // Evaluate Dwell Selection on hovered interactive elements
    this.updateDwellSelection();
    this.emitState();
  }

  private updateDwellSelection() {
    const x = this.state.cursorX;
    const y = this.state.cursorY;

    if (typeof document === 'undefined') return;

    // Find element at current pointer coordinate
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const interactiveTarget = el?.closest('button, a, input, select, textarea, [role="button"], [tabindex="0"]') as HTMLElement | null;

    this.state.hoveredElement = interactiveTarget;

    if (interactiveTarget && interactiveTarget === this.currentTargetElement) {
      if (!this.dwellStartTime) {
        this.dwellStartTime = Date.now();
      }
      const elapsed = Date.now() - this.dwellStartTime;
      const progress = Math.min(100, Math.round((elapsed / this.dwellDelayMs) * 100));
      this.state.dwellProgress = progress;

      if (elapsed >= this.dwellDelayMs) {
        // Trigger Dwell Activation
        interactiveTarget.click();
        interactiveTarget.focus();
        this.dwellStartTime = null;
        this.state.dwellProgress = 0;
        // Brief pause after click to prevent duplicate trigger
        this.currentTargetElement = null;
      }
    } else {
      this.currentTargetElement = interactiveTarget;
      this.dwellStartTime = interactiveTarget ? Date.now() : null;
      this.state.dwellProgress = 0;
    }
  }
}

export const headTracker = new HeadTrackerService();
