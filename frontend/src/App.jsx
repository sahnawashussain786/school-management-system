import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PublicLayout from './components/layout'
import DashboardLayout from './components/DashboardLayout'

import Home from './pages/Home'
import About from './pages/About'
import Academics from './pages/Academics'
import Admissions from './pages/Admissions'
import Trips from './pages/Trips'
import News from './pages/News'
import Contact from './pages/Contact'
import Login from './pages/Login'

import Overview from './pages/dashboard/Overview'
import Students from './pages/dashboard/Students'
import Teachers from './pages/dashboard/Teachers'
import Classes from './pages/dashboard/Classes'
import Subjects from './pages/dashboard/Subjects'
import TimetableManage from './pages/dashboard/TimetableManage'
import Attendance from './pages/dashboard/Attendance'
import Exams from './pages/dashboard/Exams'
import Assignments from './pages/dashboard/Assignments'
import Fees from './pages/dashboard/Fees'
import Announcements from './pages/dashboard/Announcements'
import Events from './pages/dashboard/Events'
import TripsAdmin from './pages/dashboard/TripsAdmin'
import Library from './pages/dashboard/Library'
import Profile from './pages/dashboard/Profile'

import MyAttendance from './pages/dashboard/MyAttendance'
import MyResults from './pages/dashboard/MyResults'
import MyAssignments from './pages/dashboard/MyAssignments'
import MyTimetable from './pages/dashboard/MyTimetable'
import TripsPortal from './pages/dashboard/TripsPortal'

function TripsRouter() {
  const { user } = useAuth()
  return user && (user.role === 'admin' || user.role === 'teacher') ? <TripsAdmin /> : <TripsPortal />
}

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return <DashboardLayout />
}

function RequireRoles({ roles, children }) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<Overview />} />
          {/* shared / staff */}
          <Route path="students" element={<RequireRoles roles={['admin', 'teacher']}><Students /></RequireRoles>} />
          <Route path="teachers" element={<RequireRoles roles={['admin']}><Teachers /></RequireRoles>} />
          <Route path="classes" element={<RequireRoles roles={['admin', 'teacher']}><Classes /></RequireRoles>} />
          <Route path="subjects" element={<RequireRoles roles={['admin', 'teacher']}><Subjects /></RequireRoles>} />
          <Route path="timetable" element={<RequireRoles roles={['admin']}><TimetableManage /></RequireRoles>} />
          <Route path="attendance" element={<RequireRoles roles={['admin', 'teacher']}><Attendance /></RequireRoles>} />
          <Route path="exams" element={<RequireRoles roles={['admin', 'teacher']}><Exams /></RequireRoles>} />
          <Route path="assignments" element={<RequireRoles roles={['admin', 'teacher']}><Assignments /></RequireRoles>} />
          <Route path="fees" element={<Fees />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="events" element={<RequireRoles roles={['admin', 'teacher']}><Events /></RequireRoles>} />
          <Route path="library" element={<Library />} />
          <Route path="trips" element={<RequireRoles roles={['admin', 'teacher', 'student', 'parent']}><TripsRouter /></RequireRoles>} />
          <Route path="profile" element={<Profile />} />
          {/* student / parent */}
          <Route path="my-attendance" element={<RequireRoles roles={['student', 'parent']}><MyAttendance /></RequireRoles>} />
          <Route path="results" element={<RequireRoles roles={['student', 'parent']}><MyResults /></RequireRoles>} />
          <Route path="my-assignments" element={<RequireRoles roles={['student', 'parent']}><MyAssignments /></RequireRoles>} />
          <Route path="my-timetable" element={<RequireRoles roles={['student', 'parent']}><MyTimetable /></RequireRoles>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
