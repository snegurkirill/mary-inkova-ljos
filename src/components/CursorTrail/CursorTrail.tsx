import { useEffect, useRef } from 'react'

/**
 * Neon dot trail that follows the cursor — an organic "Spoken-word"-style
 * scatter brush stamped along the actual pointer path: dots vary in size
 * and scatter a little to either side of the path (not a uniform dashed
 * line), building up a dense, mottled cloud like the Figma brush reference.
 * Each dot is stamped once, at the point on the path it was born, and never
 * moves again — it only ages: colour shifts from a cool deep-blue (just
 * stamped) through the site's own green/yellow/orange gradient-map stops
 * into a true red as it dies, easing so it lingers in the warm end rather
 * than spending equal time in every stop, fading out in opacity. So "tail"
 * describes the fading *look*, not physics — nothing drifts from where the
 * cursor actually was.
 *
 * The stroke itself is smoothed (a Catmull-Rom spline through the last four
 * raw pointer points, resampled finely) before dots are stamped along it —
 * raw mouse input has sharp kinks at direction changes; this rounds them
 * into the smooth curve the brush reference has.
 *
 * Dots are spaced by path *distance*, not by input event — pointermove
 * fires less often the faster the cursor moves, so spawning per event
 * would leave visible gaps on a fast swipe. Interpolating along the
 * (smoothed) path at a fixed spacing keeps density constant regardless of
 * speed, same as a real brush engine stamping along a stroke.
 *
 * Desktop-only (skips entirely without a fine pointer, i.e. touch devices)
 * and skips entirely under prefers-reduced-motion — this is a decorative
 * flourish, not core UI, so it should never fight mobile scrolling or
 * override a user's motion preference.
 *
 * Mount once, near the app root (see Layout.tsx) — it stays alive across
 * route changes rather than resetting per page.
 *
 * Rendering leans "optical" rather than "paint", fitting a site for an
 * artist who works with lens/light distortion: each dot is a radial
 * gradient (a bright near-white core fading through its colour to
 * transparent) instead of a flat fill, so it reads as a glint of light
 * rather than a dab of pigment; brighter dots also get a thin four-point
 * flare, like a small lens sparkle. The whole trail draws with additive
 * ("lighter") blending, so overlapping dots brighten each other instead of
 * just stacking flat colour — the same way light actually concentrates
 * into bright filaments in a real caustic pattern.
 */

// Blue → warm → true-red gradient stops (site palette, + one added red so
// the tail actually reaches red rather than stopping at peach/orange).
const STOPS = ['#1a438f', '#809eff', '#99ac29', '#fffa67', '#ffa474', '#e5503a'] as const

const STOP_RGB = STOPS.map((hex) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
})

function colorAt(t: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t))
  const scaled = clamped * (STOP_RGB.length - 1)
  const i = Math.min(STOP_RGB.length - 2, Math.floor(scaled))
  const f = scaled - i
  const [r1, g1, b1] = STOP_RGB[i]
  const [r2, g2, b2] = STOP_RGB[i + 1]
  return [r1 + (r2 - r1) * f, g1 + (g2 - g1) * f, b1 + (b2 - b1) * f]
}

type Dot = { x: number; y: number; r: number; born: number; sparkle: boolean }
type Pt = { x: number; y: number }

const LIFE = 2200 // ms — a dot's full age→fade duration (longer line, longer fade)
const SPACING = 4 // px between stamp points along the (smoothed) path
const DOTS_PER_STAMP = [1, 1, 2, 2, 3] // weighted random cluster size
const SCATTER = 7 // px, max perpendicular jitter off the path centreline
const MIN_R = 0.7
const MAX_R = 3.6
const SPARKLE_MIN_R = 2.6 // only the larger dots get a flare
const SPARKLE_CHANCE = 0.35
const MAX_DOTS = 2200
const CURVE_STEPS = 14 // spline resample density between two raw points

function catmullRom(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const t2 = t * t
  const t3 = t2 * t
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  }
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      // Explicit CSS size, not just the position:fixed/inset:0 on the
      // element — a <canvas> is a replaced element, and without this its
      // CSS box defaults to its width/height *attributes* (the dpr-scaled
      // drawing-buffer size below) instead of the viewport, which visibly
      // misaligns every drawn point from the real cursor position.
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let dots: Dot[] = []
    let carry = 0 // distance since the last stamped point, along the path
    const recent: Pt[] = [] // last 4 raw pointer points, for the spline

    const stampCluster = (x: number, y: number, ux: number, uy: number) => {
      const n = DOTS_PER_STAMP[(Math.random() * DOTS_PER_STAMP.length) | 0]
      const px = -uy
      const py = ux
      for (let i = 0; i < n; i++) {
        const off = (Math.random() - 0.5) * 2 * SCATTER
        const r = MIN_R + Math.pow(Math.random(), 2) * (MAX_R - MIN_R)
        const sparkle = r > SPARKLE_MIN_R && Math.random() < SPARKLE_CHANCE
        dots.push({ x: x + px * off, y: y + py * off, r, born: performance.now(), sparkle })
      }
      if (dots.length > MAX_DOTS) dots.splice(0, dots.length - MAX_DOTS)
    }

    const stampSegment = (x0: number, y0: number, x1: number, y1: number) => {
      const dx = x1 - x0
      const dy = y1 - y0
      const dist = Math.hypot(dx, dy)
      if (dist === 0) return
      const ux = dx / dist
      const uy = dy / dist
      let d = SPACING - carry
      while (d <= dist) {
        stampCluster(x0 + ux * d, y0 + uy * d, ux, uy)
        d += SPACING
      }
      carry = (carry + dist) % SPACING
    }

    const onMove = (e: PointerEvent) => {
      const pt = { x: e.clientX, y: e.clientY }
      recent.push(pt)
      if (recent.length > 4) recent.shift()
      if (recent.length < 2) return
      if (recent.length < 4) {
        // not enough context yet for a spline — draw the raw segment so
        // the very start of a stroke isn't held back
        const [a, b] = recent.slice(-2)
        stampSegment(a.x, a.y, b.x, b.y)
        return
      }
      const [p0, p1, p2, p3] = recent
      let prev = p1
      for (let i = 1; i <= CURVE_STEPS; i++) {
        const cur = catmullRom(p0, p1, p2, p3, i / CURVE_STEPS)
        stampSegment(prev.x, prev.y, cur.x, cur.y)
        prev = cur
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let raf = 0
    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
      dots = dots.filter((d) => now - d.born < LIFE)
      ctx.globalCompositeOperation = 'lighter'
      for (const d of dots) {
        const t = (now - d.born) / LIFE
        // ease-out: races through blue/green/yellow early, lingers in the
        // warm orange/red end for most of the dot's life.
        const colorT = 1 - Math.pow(1 - t, 2.2)
        const [r, g, b] = colorAt(colorT)
        // stays fuller/brighter through the middle of its life, then falls
        // away — a longer, gentler fade rather than a constant linear dim.
        // Scaled down from a flat 1: additive blending means overlapping
        // dots brighten each other, so full-strength alpha would blow out
        // to white almost immediately in a dense cluster.
        const alpha = Math.max(0, 1 - t * t) * 0.62
        const core = `rgba(${r + (255 - r) * 0.7}, ${g + (255 - g) * 0.7}, ${b + (255 - b) * 0.7}, ${alpha})`
        const mid = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`
        const edge = `rgba(${r | 0}, ${g | 0}, ${b | 0}, 0)`

        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r)
        grad.addColorStop(0, core)
        grad.addColorStop(0.45, mid)
        grad.addColorStop(1, edge)
        ctx.beginPath()
        ctx.fillStyle = grad
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()

        if (d.sparkle) {
          const len = d.r * 2.4
          ctx.strokeStyle = core
          ctx.lineWidth = Math.max(0.4, d.r * 0.16)
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(d.x - len, d.y)
          ctx.lineTo(d.x + len, d.y)
          ctx.moveTo(d.x, d.y - len)
          ctx.lineTo(d.x, d.y + len)
          ctx.stroke()
        }
      }
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  )
}
