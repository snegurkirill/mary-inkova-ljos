import { useNavigate } from 'react-router-dom'
import LensSphere from '../components/LensSphere/LensSphere'
import styles from './Home.module.css'

/**
 * Home — expanded (fits viewport). A centred iridescent sphere with the poem
 * arranged around it. Composition is a fixed 393px column, centred in the
 * viewport (so it reads the same on desktop and mobile).
 *
 * On load the content reveals line by line: each element fades opacity 0→100
 * over 1s. The header and the sphere image share step 0 (fade in together);
 * the poem lines then follow one after another with a 1s stagger (--i = 1..7).
 * The header animation lives in Header.tsx. `--reveal-step` is the interval.
 *
 * Poem: «Есть место — оно парит выше звёзд, это мой дом,
 *        он наполнен проникающим светом.»
 */
export default function Home() {
  const navigate = useNavigate()
  // The whole surface is an "enter" gesture → Gallery. The one exception,
  // «об авторе», lives in the Header (a separate fixed element), so its click
  // never reaches here.
  const enterGallery = () => navigate('/gallery', { viewTransition: true })

  return (
    <section
      className={styles.page}
      data-page="home"
      onClick={enterGallery}
      role="link"
      aria-label="Enter — проекты"
    >
      <div className={styles.sphere}>
        <div className={styles.row1}>
          <p className={styles.p} style={{ left: 33, top: 0, '--i': 1 } as React.CSSProperties}>
            Есть место
          </p>
          <p className={styles.p} style={{ left: 124, top: 24, '--i': 2 } as React.CSSProperties}>
            — оно парит выше звёзд
          </p>
        </div>

        <div className={styles.row2}>
          <p className={styles.p} style={{ left: 65, top: 0, '--i': 3 } as React.CSSProperties}>
            это
          </p>
          <div className={styles.circle} style={{ '--i': 0 } as React.CSSProperties}>
            <LensSphere src="/content/home/lens.jpg" />
          </div>
        </div>

        <div className={styles.row3}>
          <p className={styles.p} style={{ left: 264, top: -12, '--i': 4 } as React.CSSProperties}>
            мой
          </p>
          <p className={styles.p} style={{ left: 64, top: 6, '--i': 5 } as React.CSSProperties}>
            дом
          </p>
        </div>

        <div className={styles.row4}>
          <p className={styles.p} style={{ left: 251, top: 0, '--i': 6 } as React.CSSProperties}>
            он наполнен
          </p>
          <p className={styles.p} style={{ left: 113, top: 18, '--i': 7 } as React.CSSProperties}>
            проникающим светом
          </p>
        </div>
      </div>
    </section>
  )
}
