import { useLayoutEffect } from 'react'
import GradientFilterOverlay from '../components/GradientFilter/GradientFilterOverlay'
import { useLayout } from '../components/Layout/LayoutContext'
import { about } from '../data/about'
import styles from './About.module.css'

/** «о художнице» — info (name + bio) on the left, portrait on the right. */
export default function About() {
  const { setMinContent } = useLayout()
  useLayoutEffect(() => setMinContent(560), [setMinContent])

  return (
    <section className={styles.page} data-page="about">
      <div className={styles.info}>
        <p className={styles.name}>{about.name}</p>
        <div className={styles.bio}>
          {about.paragraphs.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      </div>
      <div className={styles.portrait}>
        <img src={about.portrait} alt={about.name} />
        <GradientFilterOverlay src={about.portrait} />
      </div>
    </section>
  )
}
