import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()

  const linkClass = (path: string) =>
    `pb-1 transition-colors ${
      location.pathname === path
        ? 'text-blue-400 border-b-2 border-blue-400'
        : 'text-slate-300 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-50 bg-slate-900/70 backdrop-blur-md border-b border-slate-800">
      <nav className="max-w-7xl mx-auto h-14 px-6 grid grid-cols-3 items-center">
        <Link to="/" className="flex items-center gap-3 justify-self-start">
          <img src="/webIcon.png" alt="Logo" className="h-12 w-12 object-contain rounded" />
          <span className="text-white font-semibold text-lg">Albion Tool</span>
        </Link>
        <ul className="flex items-center justify-center gap-6">
          <li><Link to="/" className={linkClass('/')}>Inicio</Link></li>
          <li><Link to="/food" className={linkClass('/food')}>Calculadora comida</Link></li>
        </ul>
        <div />
      </nav>
    </header>
  )
}
