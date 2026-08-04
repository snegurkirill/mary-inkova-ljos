/**
 * Global SVG filter: a true per-pixel "gradient map" (as in the Figma plugin
 * screenshot) — white → #5CA3FF → white, sampled across image luminance.
 *
 * Step 1 (feColorMatrix): reduce the image to luminance (standard Rec.709
 * weights), replicated into R/G/B so every channel carries the same gray value.
 * Step 2 (feComponentTransfer): remap that gray value through a 3-stop table
 * per channel — the table interpolates linearly between the given values
 * across the 0..1 input domain, exactly matching a 3-stop CSS-style gradient:
 *   stop 0   (shadows):   white  (1, 1, 1)
 *   stop 0.5 (midtones):  #5CA3FF → (0x5C/255, 0xA3/255, 0xFF/255)
 *   stop 1   (highlights): white (1, 1, 1)
 *
 * Mounted once at the app root (in Layout). The filter itself is invisible;
 * it's referenced elsewhere via `filter: url(#gradient-map-blue)`.
 */
export default function GradientMapDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter id="gradient-map-blue" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0      0      0      1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="1 0.360784 1" />
            <feFuncG type="table" tableValues="1 0.639216 1" />
            <feFuncB type="table" tableValues="1 1 1" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )
}
