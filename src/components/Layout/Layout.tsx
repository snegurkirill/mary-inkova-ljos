import { Outlet } from 'react-router-dom'
import Header from '../Header/Header'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
