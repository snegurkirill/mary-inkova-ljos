import { useEffect, useRef } from 'react'

/**
 * Animated glossy glass-lens sphere, drawn live with a WebGL fragment shader.
 *
 * A circular lens sits over `src` (a still image, or a video — detected by
 * file extension; e.g. the candle+flower artwork, or her filmed in motion):
 * the view is magnified and refracted, distorts toward the rim, sways gently
 * like looking through a peephole, the blue/warm rim shimmers as it rotates,
 * and a soft warm glow flickers over the candle flame. Everything outside
 * the circle is transparent so the white page shows through. When `src` is a
 * video it plays on loop, muted, and its current frame is what's sampled
 * every draw — the sway/refraction/shimmer are the same shader math either
 * way, just fed a moving picture instead of a static one.
 *
 * Freezes motion under prefers-reduced-motion (a video source is paused
 * too); renders nothing (transparent) if WebGL is unavailable.
 *
 * `flame` optionally adds a gentle warm flicker glow at that position in the
 * source image, in 0..1 cover-space (x from left, y from top). Omit it to turn
 * the candle glow off (default) while keeping the lens distortion & rim.
 */
type Props = {
  src: string
  /** Flame position in the image, 0..1 (x, y). Omit to disable the glow. */
  flame?: [number, number]
  className?: string
}

const isVideoSrc = (src: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src)

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_texAspect; // texW / texH
uniform vec2 u_flame;      // flame pos in texture uv (0..1)
uniform float u_flameOn;   // 1 = candle glow on, 0 = off
uniform float u_motion;    // 1 = animate, 0 = frozen

void main() {
  float R = 0.5;
  vec2 p = v_uv - 0.5;           // -0.5..0.5
  float r = length(p);

  // soft circular mask (anti-aliased edge)
  float alpha = smoothstep(R, R - 0.006, r);
  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }

  float t = u_time * u_motion;

  // peephole sway: slow drift + tiny rotation
  vec2 sway = vec2(sin(t * 0.6), cos(t * 0.47)) * 0.012;
  float a = sin(t * 0.3) * 0.03;
  mat2 rot = mat2(cos(a), -sin(a), sin(a), cos(a));
  vec2 q = rot * p + sway;

  float rr = length(q) / R;                 // 0..1 toward rim

  // lens refraction: magnify centre, bend near the edge
  float bend = 1.0 - 0.18 * rr * rr;
  vec2 lensUV = q * bend;
  float edge = smoothstep(0.72, 1.0, rr);
  lensUV += normalize(q + 1e-5) * edge * 0.03 * (0.5 + 0.5 * sin(t * 1.3 + rr * 8.0));

  // to texture space, cover-fit by aspect, slight zoom-in
  vec2 uv = lensUV + 0.5;
  if (u_texAspect > 1.0) uv.x = (uv.x - 0.5) / u_texAspect + 0.5;
  else                   uv.y = (uv.y - 0.5) * u_texAspect + 0.5;
  uv = (uv - 0.5) * 0.9 + 0.5;

  vec3 col = texture2D(u_tex, uv).rgb;

  // gentle candle flicker glow (optional — off unless u_flameOn)
  float flick = 0.82 + 0.18 * sin(t * 7.0) * (0.6 + 0.4 * sin(t * 2.3));
  float fd = distance(uv, u_flame);
  col += vec3(1.0, 0.62, 0.28) * smoothstep(0.34, 0.0, fd) * 0.55 * flick * u_flameOn;

  // warm inner refraction ring
  float inner = smoothstep(0.80, 0.97, rr) * (1.0 - smoothstep(0.97, 1.02, rr));
  col += vec3(0.92, 0.46, 0.2) * inner * 0.55;

  // blue outer glow with rotating shimmer
  float shimmer = 0.5 + 0.5 * sin(atan(q.y, q.x) - t * 1.2);
  float outer = smoothstep(0.9, 1.0, rr);
  col += vec3(0.28, 0.55, 1.0) * outer * (0.45 + 0.7 * shimmer);

  // subtle top glossy highlight
  float gloss = smoothstep(0.5, 0.0, distance(q, vec2(-0.12, -0.18))) * 0.12;
  col += vec3(gloss);

  gl_FragColor = vec4(col * alpha, alpha);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('shader error:', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export default function LensSphere({ src, flame, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true })
    if (!gl) return // fallback <img> stays visible

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    // full-screen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const loc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA) // premultiplied

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uAspect = gl.getUniformLocation(prog, 'u_texAspect')
    const uFlame = gl.getUniformLocation(prog, 'u_flame')
    const uFlameOn = gl.getUniformLocation(prog, 'u_flameOn')
    const uMotion = gl.getUniformLocation(prog, 'u_motion')

    gl.uniform2f(uFlame, flame ? flame[0] : 0.5, flame ? flame[1] : 0.42)
    gl.uniform1f(uFlameOn, flame ? 1 : 0)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gl.uniform1f(uMotion, reduced ? 0 : 1)

    // texture
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([200, 200, 200, 255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    let aspect = 1
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

    // Under reduced-motion the rAF loop below only ever runs once (the very
    // first, synchronous call) — before the image has decoded or the video
    // has a frame ready, so it'd otherwise draw the 1x1 gray placeholder
    // forever. draw() is re-invoked once loading actually completes so a
    // real (single, still) frame shows even with motion frozen.
    const isVideo = isVideoSrc(src)
    let video: HTMLVideoElement | null = null
    if (isVideo) {
      video = document.createElement('video')
      video.src = src
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.autoplay = true
      video.addEventListener('loadedmetadata', () => {
        aspect = video!.videoWidth / video!.videoHeight
      })
      if (reduced) {
        video.addEventListener('loadeddata', () => draw(), { once: true })
      } else {
        video.play().catch(() => {})
      }
    } else {
      const img = new Image()
      img.onload = () => {
        aspect = img.naturalWidth / img.naturalHeight
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        if (reduced) draw()
      }
      img.src = src
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const size = canvas.clientWidth || 393
      const px = Math.round(size * dpr)
      if (canvas.width !== px) {
        canvas.width = px
        canvas.height = px
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    let raf = 0
    const start = performance.now()
    const draw = () => {
      resize()
      if (video && video.readyState >= video.HAVE_CURRENT_DATA) {
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      }
      gl.uniform1f(uAspect, aspect)
      gl.uniform1f(uTime, (performance.now() - start) / 1000)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      if (video) {
        video.pause()
        video.removeAttribute('src')
        video.load()
      }
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
      gl.deleteTexture(tex)
    }
  }, [src, flame])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
