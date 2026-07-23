import { about } from '../data/about'
import styles from './About.module.css'

/**
 * About — expanded. Two even halves: portrait + text.
 * Desktop: portrait left / text right. Mobile: text top / portrait bottom.
 */
export default function About() {
  return (
    <section className={styles.page} data-page="about">
      <div className={styles.content}>
        <div className={styles.portrait}>
          <img src={about.portrait} alt={about.name} />
        </div>
        <div className={styles.info}>
          <p className={styles.name}>{about.name}</p>
          <div className={styles.bio}>
            {about.paragraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
