// Built-in Web Audio API synthesizer for sound effects - zero external audio asset dependencies!

class SoundManager {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  // Ticking sound for wheel peg collision
  playTick() {
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    } catch {
      // Audio playback might be blocked until user interacts
    }
  }

  // Dice rattling sound
  playDiceRattle() {
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      const now = ctx.currentTime
      osc.type = 'square'
      osc.frequency.setValueAtTime(180 + Math.random() * 80, now)
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.06)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.06)
    } catch {
      // Audio error ignored
    }
  }

  // Celebration fanfare sound
  playWin() {
    try {
      const ctx = this.getContext()
      if (!ctx) return
      const notes = [261.63, 329.63, 392.0, 523.25] // C4, E4, G4, C5

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const startTime = ctx.currentTime + idx * 0.1

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + 0.45)
      })
    } catch {
      // Audio error ignored
    }
  }
}

export const sound = new SoundManager()
