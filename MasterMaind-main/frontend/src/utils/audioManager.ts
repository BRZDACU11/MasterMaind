export class AudioManager {
    private static instance: AudioManager;
    private audioContext: AudioContext | null = null;
    private isMuted: boolean = false;

    private constructor() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
        if (!this.audioContext || this.isMuted) return;

        // Resume context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + startTime);

        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(this.audioContext.currentTime + startTime);
        osc.stop(this.audioContext.currentTime + startTime + duration);
    }

    public playSound(name: 'click' | 'win' | 'lose' | 'error') {
        if (this.isMuted || !this.audioContext) return;

        switch (name) {
            case 'click':
                this.playTone(800, 'sine', 0.1);
                break;
            case 'error':
                this.playTone(150, 'sawtooth', 0.3);
                this.playTone(100, 'sawtooth', 0.3, 0.1);
                break;
            case 'win':
                // C Major Arpeggio
                this.playTone(523.25, 'sine', 0.2, 0);    // C5
                this.playTone(659.25, 'sine', 0.2, 0.2);  // E5
                this.playTone(783.99, 'sine', 0.2, 0.4);  // G5
                this.playTone(1046.50, 'sine', 0.4, 0.6); // C6
                break;
            case 'lose':
                // Sad descending tones
                this.playTone(392.00, 'triangle', 0.4, 0);   // G4
                this.playTone(369.99, 'triangle', 0.4, 0.4); // F#4
                this.playTone(349.23, 'triangle', 0.6, 0.8); // F4
                break;
        }
    }

    public toggleBGM(play: boolean) {
        // BGM disabled for synthesized version to avoid annoyance/complexity
        // Could implement a loop later if requested
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
}
