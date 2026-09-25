import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Icon = ({ d }) => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

const I = {
  home: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  cap: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.247m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  check: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  money: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  bus: 'M8 16H6a2 2 0 01-2-2v-4h16v4a2 2 0 01-2 2h-2m-8 0V9m8 7v-7M4 6h16M6 20h12m2-10V6a2 2 0 00-2-2H6a2 2 0 00-2 2v4m12 8a1 1 0 11-2 0 1 1 0 012 0zM8 18a1 1 0 11-2 0 1 1 0 012 0z',
  megaphone: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  library: 'M8 14v3m4-3v3m4-3v3M4 21V5a2 2 0 012-2h12a2 2 0 012 2v16m2 0H2m4-9h12',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h6m-6 4h6',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
}

const NAV = {
  admin: [
    { to: '/dashboard', label: 'Overview', icon: I.home, end: true },
    { to: '/dashboard/students', label: 'Students', icon: I.users },
    { to: '/dashboard/teachers', label: 'Teachers', icon: I.cap },
    { to: '/dashboard/classes', label: 'Classes', icon: I.book },
    { to: '/dashboard/subjects', label: 'Subjects', icon: I.library },
    { to: '/dashboard/timetable', label: 'Timetable', icon: I.clock },
    { to: '/dashboard/attendance', label: 'Attendance', icon: I.check },
    { to: '/dashboard/exams', label: 'Exams & Results', icon: I.chart },
    { to: '/dashboard/assignments', label: 'Assignments', icon: I.clipboard },
    { to: '/dashboard/fees', label: 'Fees', icon: I.money },
    { to: '/dashboard/announcements', label: 'Announcements', icon: I.megaphone },
    { to: '/dashboard/events', label: 'Events', icon: I.calendar },
    { to: '/dashboard/trips', label: 'School Trips', icon: I.bus },
    { to: '/dashboard/library', label: 'Library', icon: I.library },
    { to: '/dashboard/profile', label: 'My Profile', icon: I.cog },
  ],
  teacher: [
    { to: '/dashboard', label: 'Overview', icon: I.home, end: true },
    { to: '/dashboard/students', label: 'Students', icon: I.users },
    { to: '/dashboard/attendance', label: 'Attendance', icon: I.check },
    { to: '/dashboard/exams', label: 'Exams & Results', icon: I.chart },
    { to: '/dashboard/assignments', label: 'Assignments', icon: I.clipboard },
    { to: '/dashboard/timetable', label: 'My Schedule', icon: I.clock },
    { to: '/dashboard/announcements', label: 'Announcements', icon: I.megaphone },
    { to: '/dashboard/events', label: 'Events', icon: I.calendar },
    { to: '/dashboard/trips', label: 'School Trips', icon: I.bus },
    { to: '/dashboard/library', label: 'Library', icon: I.library },
    { to: '/dashboard/profile', label: 'My Profile', icon: I.cog },
  ],
  student: [
    { to: '/dashboard', label: 'Overview', icon: I.home, end: true },
    { to: '/dashboard/my-attendance', label: 'My Attendance', icon: I.check },
    { to: '/dashboard/results', label: 'My Results', icon: I.chart },
    { to: '/dashboard/my-assignments', label: 'Assignments', icon: I.clipboard },
    { to: '/dashboard/my-timetable', label: 'My Timetable', icon: I.clock },
    { to: '/dashboard/fees', label: 'My Fees', icon: I.money },
    { to: '/dashboard/trips', label: 'School Trips', icon: I.bus },
    { to: '/dashboard/library', label: 'Library', icon: I.library },
    { to: '/dashboard/announcements', label: 'Announcements', icon: I.megaphone },
    { to: '/dashboard/profile', label: 'My Profile', icon: I.cog },
  ],
  parent: [
    { to: '/dashboard', label: 'Overview', icon: I.home, end: true },
    { to: '/dashboard/my-attendance', label: "Child's Attendance", icon: I.check },
    { to: '/dashboard/results', label: "Child's Results", icon: I.chart },
    { to: '/dashboard/my-assignments', label: 'Assignments', icon: I.clipboard },
    { to: '/dashboard/my-timetable', label: 'Class Timetable', icon: I.clock },
    { to: '/dashboard/fees', label: 'Fees', icon: I.money },
    { to: '/dashboard/trips', label: 'School Trips', icon: I.bus },
    { to: '/dashboard/announcements', label: 'Announcements', icon: I.megaphone },
    { to: '/dashboard/profile', label: 'My Profile', icon: I.cog },
  ],
}

const roleBadge = { admin: 'Administrator', teacher: 'Teacher', student: 'Student', parent: 'Parent' }

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const items = NAV[user?.role] || NAV.student

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const SideNav = (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-brand-600 text-white'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Icon d={item.icon} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  const Brand = (
    <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-5">
      <img 
        src="/src/assets/school-logo.jpg" 
        alt="Junior Champ's Higher Secondary School Chandia Logo" 
        className="h-9 w-9 object-contain"
      />
      <div>
        <p className="text-sm font-bold leading-tight text-white">Junior Champ's</p>
        <p className="text-[11px] leading-tight text-slate-400">Management Portal</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-navy-900 lg:flex">
        {Brand}
        {SideNav}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-navy-900">
            {Brand}
            {SideNav}
          </aside>
        </div>
      )}

      {/* Topbar */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            className="rounded-lg p-2 text-slate-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden text-sm text-slate-500 hover:text-brand-700 sm:block">
              View public site ↗
            </Link>
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 py-1.5 pl-1.5 pr-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {user?.name?.slice(0, 1).toUpperCase() || '?'}
              </span>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight text-slate-800">{user?.name}</p>
                <p className="text-[11px] leading-tight text-slate-500">{roleBadge[user?.role]}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 lg:hidden"
              aria-label="Sign out"
            >
              <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
