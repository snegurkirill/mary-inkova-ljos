import GalleryShowcase from '../components/Showcase/GalleryShowcase'
import { projects } from '../data/projects'
import styles from './Gallery.module.css'

/** Gallery — scrollable. Showcase of projects (5 / 3 / 1 responsive rows). */
export default function Gallery() {
  return (
    <section className={styles.page} data-page="gallery">
      <GalleryShowcase projects={projects} />
    </section>
  )
}
