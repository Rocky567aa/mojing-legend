/**
 * SimplexNoise.js — 2D/3D Simplex Noise
 *
 * 基于 Stefan Gustavson 的经典实现，支持种子初始化。
 * 返回值范围约 [-1, 1]。
 *
 * 用法：
 *   const noise = new SimplexNoise(seed)
 *   const v = noise.noise2D(x, y)   // -1 ~ 1
 *   const v = noise.noise3D(x, y, z)
 */
export class SimplexNoise {
  constructor(seed = 0) {
    this.p = new Uint8Array(256)
    // 用种子生成置换表
    let s = seed
    for (let i = 0; i < 256; i++) {
      s = (s * 1664525 + 1013904223) & 0xffffffff
      this.p[i] = (s >>> 24) & 0xff
    }
    // 扩展到 512，避免越界
    this.perm = new Uint8Array(512)
    this.permMod12 = new Uint8Array(512)
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255]
      this.permMod12[i] = this.perm[i] % 12
    }
  }

  // 2D Simplex Noise [-1, 1]
  noise2D(xin, yin) {
    const G2 = (3 - Math.sqrt(3)) / 6
    const F2 = 0.5 * (Math.sqrt(3) - 1)
    const grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ]
    const pm12 = this.permMod12
    const perm = this.perm

    const dot = (g, x, y) => g[0] * x + g[1] * y

    const s = (xin + yin) * F2
    const i = Math.floor(xin + s)
    const j = Math.floor(yin + s)
    const t = (i + j) * G2
    const X0 = i - t
    const Y0 = j - t
    const x0 = xin - X0
    const y0 = yin - Y0

    let i1, j1
    if (x0 > y0) { i1 = 1; j1 = 0 }
    else { i1 = 0; j1 = 1 }

    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1 + 2 * G2
    const y2 = y0 - 1 + 2 * G2

    const ii = i & 255
    const jj = j & 255
    const gi0 = pm12[ii + perm[jj]]
    const gi1 = pm12[ii + i1 + perm[jj + j1]]
    const gi2 = pm12[ii + 1 + perm[jj + 1]]

    let t0 = 0.5 - x0 * x0 - y0 * y0
    const n0 = t0 < 0 ? 0 : (t0 *= t0, t0 * t0 * dot(grad3[gi0], x0, y0))

    let t1 = 0.5 - x1 * x1 - y1 * y1
    const n1 = t1 < 0 ? 0 : (t1 *= t1, t1 * t1 * dot(grad3[gi1], x1, y1))

    let t2 = 0.5 - x2 * x2 - y2 * y2
    const n2 = t2 < 0 ? 0 : (t2 *= t2, t2 * t2 * dot(grad3[gi2], x2, y2))

    return 70 * (n0 + n1 + n2)
  }

  // 叠加多频噪声（分形布朗运动，FBM）
  // octaves: 叠加层数；lacunarity: 频率倍增比；persistence: 振幅衰减比
  fbm(x, y, octaves = 4, lacunarity = 2.0, persistence = 0.5) {
    let value = 0, amplitude = 1, frequency = 1, max = 0
    for (let i = 0; i < octaves; i++) {
      value += this.noise2D(x * frequency, y * frequency) * amplitude
      max += amplitude
      amplitude *= persistence
      frequency *= lacunarity
    }
    return value / max // 归一化到 [-1, 1]
  }
}
