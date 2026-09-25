import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui'

const Logo = ({ light = false }) => (
  <Link to="/" className="flex items-center gap-2.5">
    <img 
      src="/src/assets/school-logo.jpg" 
      alt="Junior Champ's Higher Secondary School Chandia Logo" 
      className="h-10 w-10 object-contain"
    />
    <span className={`text-sm font-bold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
      JUNIOR CHAMP'S <span className="text-brand-600">HIGHER SECONDARY SCHOOL</span>
    </span>
  </Link>
)

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/academics', label: 'Academics' },
  { to: '/admissions', label: 'Admissions' },
  { to: '/trips', label: 'School Trips' },
  { to: '/news', label: 'News & Events' },
  { to: '/contact', label: 'Contact' },
]

function Navbar() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Link to="/dashboard">
              <Button size="sm">My Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" variant="ghost">
                  Sign In
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm">Portal Login</Button>
              </Link>
            </>
          )}
        </div>
        <button
          className="rounded-lg p-2 text-slate-600 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {l.label}
            </Link>
          ))}
          <Link to={user ? '/dashboard' : '/login'} onClick={() => setOpen(false)} className="mt-2 block">
            <Button className="w-full">{user ? 'My Dashboard' : 'Portal Login'}</Button>
          </Link>
        </div>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-auto bg-navy-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo light />
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
              Junior Champ's Higher Secondary School Chandia has been nurturing curious minds. We combine
              academic excellence with character development to prepare students for a changing world.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navLinks.slice(1).map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>Chandia, Madhya Pradesh, India</li>
              <li>+91 XXXXX XXXXX</li>
              <li>info@juniorchamps.edu</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Junior Champ's Higher Secondary School Chandia. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
