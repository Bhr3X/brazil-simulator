/**
 * RunClock: 15-Minute Roguelite Day Cycle
 * 900 sim-seconds = 24 in-game hours from 06:00 to 06:00.
 * Exactly 1 in-game hour = 37.5 sim-seconds.
 */

export class RunClock {
  constructor(durationSeconds = 900, startHour = 6.0) {
    this.duration = durationSeconds; // 900s (15 minutes)
    this.startHour = startHour;       // 06:00
    this.elapsed = 0;                 // sim-seconds elapsed
    this.isPaused = false;
    this.hasEnded = false;
    this.onRunEnd = null;

    // Pause sim time on hidden tab to avoid delta bursts
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isPaused = true;
        } else {
          this.isPaused = false;
        }
      });
    }
  }

  update(delta) {
    if (this.isPaused || this.hasEnded) return;

    const clampedDelta = Math.min(Math.max(delta, 0), 0.1);
    this.elapsed += clampedDelta;

    if (this.elapsed >= this.duration) {
      this.elapsed = this.duration;
      this.hasEnded = true;
      if (this.onRunEnd) {
        this.onRunEnd();
      }
    }
  }

  get remaining() {
    return Math.max(0, this.duration - this.elapsed);
  }

  // Current in-game hour as a float [0..24)
  get inGameHour() {
    const hoursElapsed = (this.elapsed / this.duration) * 24.0;
    return (this.startHour + hoursElapsed) % 24.0;
  }

  // Setter for inGameHour to synchronize time of day
  set inGameHour(targetHour) {
    this.setHour(targetHour, false);
  }

  // Explicit method to set in-game hour, supporting forward-only during active runs
  setHour(targetHour, forwardOnly = false) {
    if (forwardOnly) {
      const currentHour = this.inGameHour;
      let diff = ((targetHour - currentHour) % 24.0 + 24.0) % 24.0;
      if (diff > 23.999 || diff < 0.001) {
        diff = 0;
      }
      const addSeconds = (diff / 24.0) * this.duration;
      this.elapsed = Math.min(this.duration, this.elapsed + addSeconds);
      if (this.elapsed >= this.duration && !this.hasEnded) {
        this.hasEnded = true;
        if (this.onRunEnd) this.onRunEnd();
      }
    } else {
      const normTarget = ((targetHour % 24) + 24) % 24;
      const hoursFromStart = ((normTarget - (this.startHour % 24)) + 24) % 24;
      this.elapsed = (hoursFromStart / 24.0) * this.duration;
    }
  }

  // Integer hour and minute
  get inGameTime() {
    const rawH = this.inGameHour;
    const h = Math.floor(rawH);
    const m = Math.floor((rawH - h) * 60);
    return { hour: h, minute: m };
  }

  // Format real-time remaining (e.g. "09:45")
  formatRemaining() {
    const rem = Math.ceil(this.remaining);
    const m = Math.floor(rem / 60);
    const s = rem % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // Format in-game 24h clock (e.g. "14:30")
  formatInGameTime() {
    const { hour, minute } = this.inGameTime;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  get formattedTime() {
    return this.formatInGameTime();
  }

  // Time-of-day phases for visuals and encounter logic
  get phase() {
    const h = this.inGameHour;
    if (h >= 5.5 && h < 11.5) return 'MANHA';
    if (h >= 11.5 && h < 16.5) return 'ALMOCO';
    if (h >= 16.5 && h < 19.5) return 'ENTARDECER';
    if (h >= 19.5 && h < 23.5) return 'NOITE';
    return 'MADRUGADA';
  }
}
