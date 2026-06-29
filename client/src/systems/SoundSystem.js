/**
 * SoundSystem.js — M18 程序化音效 + 群系 BGM
 *
 * 完全基于 Web Audio API 实时合成，零外部音频素材：
 *   • SFX：挖矿 / 拾取 / 命中 / 怪物死亡 / 升级 / 技能 / 受伤 / 玩家死亡 / 采集 / 炼金
 *   • BGM：按群系元素挑选音阶与音色，调度循环琶音 + 低频铺底 pad
 *
 * AudioContext 必须由用户手势激活（浏览器自动播放限制）：
 *   首次 keydown / pointerdown 后调用 resume()。
 *
 * 静音切换：M 键 → toggleMute()
 */

// 群系元素 → 音乐基调（根音半音偏移 + 音阶 + 音色波形 + 速度）
const BIOME_MUSIC = {
  fire:    { root: -3, scale: [0, 3, 5, 7, 10],  wave: 'sawtooth', bpm: 96, mood: 0.85 },
  ice:     { root:  4, scale: [0, 2, 4, 7, 9],   wave: 'triangle', bpm: 64, mood: 0.55 },
  thunder: { root:  0, scale: [0, 2, 5, 7, 9],   wave: 'square',   bpm: 110, mood: 0.9 },
  poison:  { root: -5, scale: [0, 1, 5, 6, 10],  wave: 'sawtooth', bpm: 72, mood: 0.5 },
  dark:    { root: -7, scale: [0, 1, 3, 7, 8],   wave: 'triangle', bpm: 58, mood: 0.4 },
  holy:    { root:  7, scale: [0, 2, 4, 7, 11],  wave: 'sine',     bpm: 76, mood: 0.7 },
  water:   { root:  2, scale: [0, 2, 4, 7, 9],   wave: 'sine',     bpm: 68, mood: 0.6 },
  nature:  { root:  0, scale: [0, 2, 4, 5, 7, 9], wave: 'triangle', bpm: 80, mood: 0.65 },
  default: { root:  0, scale: [0, 2, 4, 7, 9],   wave: 'triangle', bpm: 78, mood: 0.6 },
}

// 群系 id → 元素（与 BiomeSystem 配色推断一致）
const BIOME_ELEMENT = {
  0: 'nature', 1: 'nature', 2: 'nature', 3: 'water', 4: 'fire', 5: 'ice',
  6: 'nature', 7: 'fire', 8: 'ice', 9: 'poison', 10: 'thunder', 11: 'dark',
  12: 'holy', 13: 'water', 14: 'water', 15: 'poison', 16: 'fire', 17: 'thunder',
  18: 'dark', 19: 'holy', 20: 'dark',
}

export class SoundSystem {
  constructor() {
    this.ctx = null
    this.master = null
    this.musicGain = null
    this.sfxGain = null
    this.muted = false
    this.started = false

    this._curElement = null
    this._beatTimer = null
    this._beatIdx = 0
    this._padNodes = []
  }

  /** 懒初始化 AudioContext — 必须在用户手势中调用 */
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return
    }
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 0.9
    this.master.connect(this.ctx.destination)

    this.musicGain = this.ctx.createGain()
    this.musicGain.gain.value = 0.10           // BGM 保持很轻
    this.musicGain.connect(this.master)

    this.sfxGain = this.ctx.createGain()
    this.sfxGain.gain.value = 0.55
    this.sfxGain.connect(this.master)

    this.started = true
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.master) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime, 0.05)
    }
    return this.muted
  }

  // ── 低层合成原语 ─────────────────────────────────────────────────────────

  /** 单个振荡器音符 */
  _tone(freq, dur, { wave = 'sine', gain = 0.3, attack = 0.005, dest = null, detune = 0, slideTo = null } = {}) {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = wave
    osc.frequency.setValueAtTime(freq, t)
    if (detune) osc.detune.setValueAtTime(detune, t)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(gain, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g)
    g.connect(dest || this.sfxGain)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  /** 噪声爆发（命中 / 挖矿质感） */
  _noise(dur, { gain = 0.3, type = 'highpass', freq = 800, dest = null } = {}) {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const len = Math.floor(this.ctx.sampleRate * dur)
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const filt = this.ctx.createBiquadFilter()
    filt.type = type
    filt.frequency.value = freq
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(filt); filt.connect(g); g.connect(dest || this.sfxGain)
    src.start(t)
    src.stop(t + dur + 0.02)
  }

  _arp(freqs, step, opts = {}) {
    if (!this.ctx) return
    freqs.forEach((f, i) => {
      setTimeout(() => this._tone(f, opts.dur ?? 0.18, opts), i * step * 1000)
    })
  }

  // ── SFX 事件 ─────────────────────────────────────────────────────────────

  mine()        { if (this.started) { this._noise(0.10, { gain: 0.4, type: 'bandpass', freq: 400 }); this._tone(160, 0.12, { wave: 'square', gain: 0.18, slideTo: 90 }) } }
  pickup()      { if (this.started) this._arp([660, 880], 0.06, { wave: 'sine', gain: 0.25, dur: 0.12 }) }
  hit()         { if (this.started) { this._noise(0.07, { gain: 0.35, freq: 1200 }); this._tone(220, 0.08, { wave: 'sawtooth', gain: 0.2, slideTo: 140 }) } }
  monsterDeath(){ if (this.started) { this._noise(0.22, { gain: 0.4, type: 'lowpass', freq: 600 }); this._tone(180, 0.35, { wave: 'triangle', gain: 0.25, slideTo: 50 }) } }
  levelUp()     { if (this.started) this._arp([523, 659, 784, 1047], 0.09, { wave: 'triangle', gain: 0.3, dur: 0.28 }) }
  skill()       { if (this.started) { this._tone(300, 0.3, { wave: 'sawtooth', gain: 0.28, slideTo: 900 }); this._noise(0.18, { gain: 0.2, type: 'highpass', freq: 2000 }) } }
  hurt()        { if (this.started) { this._tone(140, 0.18, { wave: 'sawtooth', gain: 0.32, slideTo: 70 }); this._noise(0.10, { gain: 0.18, type: 'lowpass', freq: 400 }) } }
  playerDeath() { if (this.started) this._arp([330, 262, 196, 131], 0.14, { wave: 'triangle', gain: 0.35, dur: 0.5 }) }
  harvest()     { if (this.started) this._arp([440, 587], 0.05, { wave: 'sine', gain: 0.22, dur: 0.14 }) }
  craft()       { if (this.started) { this._tone(440, 0.5, { wave: 'sine', gain: 0.22, slideTo: 660 }); this._arp([660, 880, 1100], 0.12, { wave: 'triangle', gain: 0.2, dur: 0.2 }) } }
  status()      { if (this.started) this._tone(200, 0.25, { wave: 'sawtooth', gain: 0.22, slideTo: 120 }) }
  bossRoar()    { if (this.started) { this._tone(90, 0.7, { wave: 'sawtooth', gain: 0.4, slideTo: 55 }); this._noise(0.5, { gain: 0.3, type: 'lowpass', freq: 300 }) } }

  // ── 群系 BGM ─────────────────────────────────────────────────────────────

  /** 玩家进入新群系时切换 BGM */
  setBiome(biomeId) {
    const element = BIOME_ELEMENT[biomeId] ?? 'default'
    if (element === this._curElement) return
    this._curElement = element
    if (this.started) this._startMusic(element)
  }

  _midiToFreq(semis) { return 220 * Math.pow(2, semis / 12) }

  _startMusic(element) {
    this._stopMusic()
    const cfg = BIOME_MUSIC[element] || BIOME_MUSIC.default
    const beatMs = 60000 / cfg.bpm / 2   // 八分音符

    // 低频铺底 pad（两个略微失谐的振荡器持续音）
    const padRoot = this._midiToFreq(cfg.root - 12)
    ;[0, 0.4].forEach((det) => {
      const osc = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = padRoot
      osc.detune.value = det * 12
      g.gain.value = 0.12 * cfg.mood
      osc.connect(g); g.connect(this.musicGain)
      osc.start()
      this._padNodes.push(osc, g)
    })

    // 琶音调度器
    this._beatIdx = 0
    const scale = cfg.scale
    this._beatTimer = setInterval(() => {
      if (!this.ctx || this.muted) return
      const i = this._beatIdx++
      // 每拍按节奏取音；偶尔跳过制造呼吸感
      if (i % 4 === 3 && Math.random() < 0.5) return
      const octave = (Math.random() < 0.25 ? 12 : 0)
      const semi = cfg.root + scale[i % scale.length] + octave
      this._tone(this._midiToFreq(semi), beatMs / 1000 * 1.6, {
        wave: cfg.wave, gain: 0.16 * cfg.mood, attack: 0.02, dest: this.musicGain,
      })
    }, beatMs)
  }

  _stopMusic() {
    if (this._beatTimer) { clearInterval(this._beatTimer); this._beatTimer = null }
    const t = this.ctx ? this.ctx.currentTime : 0
    this._padNodes.forEach((n) => {
      try {
        if (n.stop) { n.gain ? null : n.stop(t + 0.1) }
        else if (n.gain) n.gain.setTargetAtTime(0, t, 0.1)
      } catch (e) { /* node already stopped */ }
    })
    // 显式停止振荡器
    this._padNodes.forEach((n) => { try { if (n.stop) n.stop((this.ctx?.currentTime ?? 0) + 0.15) } catch (e) {} })
    this._padNodes = []
  }

  destroy() {
    this._stopMusic()
    if (this.ctx) { try { this.ctx.close() } catch (e) {} this.ctx = null }
    this.started = false
  }
}

// 全局单例（跨场景共享同一 AudioContext）
let _instance = null
export function getSound() {
  if (!_instance) _instance = new SoundSystem()
  return _instance
}
