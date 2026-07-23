import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section data-page="notfound" style={{ padding: '120px 32px 32px' }}>
      <p>Not found.</p>
      <Link to="/">Home</Link>
    </section>
  )
}
