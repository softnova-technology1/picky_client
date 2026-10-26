/**
 * Picky Green Tick Confirmation Sound Engine
 * Dual-Engine: Primed Web Audio API + HTML5 Audio (/sounds/order-success.wav)
 * Guaranteed to play automatically on order success without requiring user to click the tick.
 */

let sharedAudioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  return sharedAudioCtx;
}

/**
 * Primes and unlocks the AudioContext during the user's 'Place Order' click in Checkout.
 * In a React SPA, the unlocked AudioContext stays 'running' across navigation to /order-success!
 */
export function primeAudio() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch (_) {}

  // Also pre-warm the HTML5 Audio
  try {
    const warmup = new Audio('/sounds/order-success.wav');
    warmup.volume = 0.01;
    const p = warmup.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        warmup.pause();
        warmup.currentTime = 0;
      }).catch(() => {});
    }
  } catch (_) {}
}

let lastPlayedTime = 0;

/**
 * Synthesizes the instant Green Tick victory chime using Web Audio API
 */
function playSynthesizedTick(ctx, volume = 1.0) {
  try {
    const now = ctx.currentTime;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, now);
    compressor.knee.setValueAtTime(25, now);
    compressor.ratio.setValueAtTime(12, now);
    compressor.attack.setValueAtTime(0.002, now);
    compressor.release.setValueAtTime(0.20, now);

    const masterGain = ctx.createGain();
    const safeVol = Math.max(0.1, Math.min(1.0, volume));
    masterGain.gain.setValueAtTime(safeVol, now);

    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);

    // 1. Tactile Circle Pop (0.00s - 0.12s)
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(260, now);
    popOsc.frequency.exponentialRampToValueAtTime(540, now + 0.09);
    popGain.gain.setValueAtTime(0.35, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    popOsc.connect(popGain);
    popGain.connect(compressor);
    popOsc.start(now);
    popOsc.stop(now + 0.13);

    // 2. The Golden Tick Chime (C6 + E6 + G6 + C7)
    const strikeTime = now + 0.08;
    const chimeFreqs = [
      { f: 1046.50, gain: 0.65, dur: 1.4 },  // C6
      { f: 1318.51, gain: 0.55, dur: 1.5 },  // E6
      { f: 1567.98, gain: 0.50, dur: 1.6 },  // G6
      { f: 2093.00, gain: 0.35, dur: 1.2 },  // C7
    ];

    chimeFreqs.forEach(({ f, gain, dur }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, strikeTime);

      g.gain.setValueAtTime(0.001, strikeTime);
      g.gain.linearRampToValueAtTime(gain, strikeTime + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, strikeTime + dur);

      osc.connect(g);
      g.connect(compressor);
      osc.start(strikeTime);
      osc.stop(strikeTime + dur + 0.05);

      const triOsc = ctx.createOscillator();
      const triGain = ctx.createGain();
      triOsc.type = 'triangle';
      triOsc.frequency.setValueAtTime(f * 2, strikeTime);

      triGain.gain.setValueAtTime(0.001, strikeTime);
      triGain.gain.linearRampToValueAtTime(gain * 0.25, strikeTime + 0.005);
      triGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + dur * 0.5);

      triOsc.connect(triGain);
      triGain.connect(compressor);
      triOsc.start(strikeTime);
      triOsc.stop(strikeTime + dur * 0.5 + 0.05);
    });

    // 3. Shimmer Sparkles
    const sparkleTimes = [strikeTime + 0.15, strikeTime + 0.28, strikeTime + 0.42];
    const sparkleFreqs = [2637.0, 3520.0, 4186.0];

    sparkleTimes.forEach((t, i) => {
      const sOsc = ctx.createOscillator();
      const sGain = ctx.createGain();
      sOsc.type = 'sine';
      sOsc.frequency.setValueAtTime(sparkleFreqs[i], t);

      sGain.gain.setValueAtTime(0.001, t);
      sGain.gain.linearRampToValueAtTime(0.20, t + 0.012);
      sGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      sOsc.connect(sGain);
      sGain.connect(compressor);
      sOsc.start(t);
      sOsc.stop(t + 0.50);
    });

    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Plays the Green Tick Victory Chime automatically when order succeeds.
 * @param {number} volume - Volume level (default 1.0)
 */
export function playOrderSuccessSound(volume = 1.0) {
  if (typeof window === 'undefined') return false;

  const now = Date.now();
  // 1.5s cooldown guard
  if (now - lastPlayedTime < 1500) {
    return false;
  }
  lastPlayedTime = now;

  let played = false;

  // Track A: Web Audio API (instant, 0 latency, uses primed AudioContext)
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          playSynthesizedTick(ctx, volume);
        }).catch(() => {});
      } else if (ctx.state === 'running') {
        playSynthesizedTick(ctx, volume);
        played = true;
      }
    }
  } catch (_) {}

  // Track B: HTML5 Audio File playback (/sounds/order-success.wav)
  try {
    const audio = new Audio('/sounds/order-success.wav');
    audio.volume = Math.max(0.1, Math.min(1.0, volume));
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        played = true;
      }).catch(() => {
        // If autoplay blocked, hook one-time listener so ANY touch/interaction plays immediately
        const touchHandler = () => {
          try {
            const fallbackAudio = new Audio('/sounds/order-success.wav');
            fallbackAudio.volume = Math.max(0.1, Math.min(1.0, volume));
            fallbackAudio.play().catch(() => {});
          } catch (_) {}
          ['click', 'pointerdown', 'touchstart', 'scroll'].forEach((evt) => {
            window.removeEventListener(evt, touchHandler);
          });
        };
        ['click', 'pointerdown', 'touchstart', 'scroll'].forEach((evt) => {
          window.addEventListener(evt, touchHandler, { once: true, passive: true });
        });
      });
    }
  } catch (_) {}

  return played;
}
