/**
 * Deterministic Seeded PRNG (Mulberry32)
 * Ensures reproducible runs: same seed + same inputs = same sequence.
 */

export class Rng {
  constructor(seed) {
    this.seed = typeof seed === 'number' ? seed : (seed ? Rng.hashString(String(seed)) : Math.floor(Math.random() * 0xffffffff));
    this.state = this.seed >>> 0;
  }

  static hashString(str) {
    let hash = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    return hash >>> 0;
  }

  // Returns float in [0, 1)
  random() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Alias for random()
  next() {
    return this.random();
  }

  // Float between [min, max)
  range(min, max) {
    return min + this.random() * (max - min);
  }

  // Integer between [min, max] inclusive
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  // Returns true with given probability [0..1]
  chance(prob) {
    return this.random() < prob;
  }

  // Pick random item from array
  pick(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(this.random() * arr.length)];
  }
}
