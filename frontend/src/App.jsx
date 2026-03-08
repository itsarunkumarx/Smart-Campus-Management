import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/layouts/Navbar';
import { Sidebar } from './components/layouts/Sidebar';
import { lazy, Suspense } from 'react';

// Public pages
const LandingPage = lazy(() => import('./pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const RoleSelectionPage = lazy(() => import('./pages/public/RoleSelectionPage').then(m => ({ default: m.RoleSelectionPage })));
const LoginPage = lazy(() => import('./pages/public/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage').then(m => ({ default: m.RegisterPage })));

// Dashboards
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const PostsPage = lazy(() => import('./pages/student/PostsPage').then(m => ({ default: m.PostsPage })));
const AttendancePage = lazy(() => import('./pages/student/AttendancePage').then(m => ({ default: m.AttendancePage })));
const ProfilePage = lazy(() => import('./pages/student/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ComplaintsPage = lazy(() => import('./pages/student/ComplaintsPage').then(m => ({ default: m.ComplaintsPage })));
const PlacementsPage = lazy(() => import('./pages/student/PlacementsPage').then(m => ({ default: m.PlacementsPage })));
const ScholarshipsPage = lazy(() => import('./pages/student/ScholarshipsPage').then(m => ({ default: m.ScholarshipsPage })));
const EventsPage = lazy(() => import('./pages/student/EventsPage').then(m => ({ default: m.EventsPage })));
const NotificationsPage = lazy(() => import('./pages/student/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard').then(m => ({ default: m.FacultyDashboard })));
const MarkAttendance = lazy(() => import('./pages/faculty/MarkAttendance').then(m => ({ default: m.MarkAttendance })));
const AnnouncementsPage = lazy(() => import('./pages/faculty/AnnouncementsPage').then(m => ({ default: m.AnnouncementsPage })));
const StudentManagement = lazy(() => import('./pages/faculty/StudentManagement').then(m => ({ default: m.StudentManagement })));
const FacultyEventsPage = lazy(() => import('./pages/faculty/FacultyEventsPage').then(m => ({ default: m.FacultyEventsPage })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile').then(m => ({ default: m.AdminProfile })));
const UserManagement = lazy(() => import('./pages/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const ComplaintManagement = lazy(() => import('./pages/admin/ComplaintManagement').then(m => ({ default: m.ComplaintManagement })));
const AcademicControl = lazy(() => import('./pages/admin/AcademicControl').then(m => ({ default: m.AcademicControl })));
const SocialModeration = lazy(() => import('./pages/admin/SocialModeration').then(m => ({ default: m.SocialModeration })));
const SettingsPage = lazy(() => import('./pages/shared/SettingsPage').then(m => ({ default: m.SettingsPage })));
const TasksPage = lazy(() => import('./pages/shared/TasksPage').then(m => ({ default: m.TasksPage })));
const SearchPage = lazy(() => import('./pages/shared/SearchPage').then(m => ({ default: m.SearchPage })));
const ChatPage = lazy(() => import('./pages/shared/ChatPage').then(m => ({ default: m.ChatPage })));
const AIControlCenter = lazy(() => import('./pages/admin/AIControlCenter').then(m => ({ default: m.AIControlCenter })));
const AIAssistant = lazy(() => import('./pages/shared/AIAssistant').then(m => ({ default: m.AIAssistant })));
const CreatePostPage = lazy(() => import('./pages/shared/CreatePostPage').then(m => ({ default: m.CreatePostPage })));
const DetailedPostPage = lazy(() => import('./pages/shared/DetailedPostPage').then(m => ({ default: m.DetailedPostPage })));
const AddFacultyPage = lazy(() => import('./pages/admin/AddFacultyPage').then(m => ({ default: m.AddFacultyPage })));
const ChangePasswordPage = lazy(() => import('./pages/auth/ChangePasswordPage').then(m => ({ default: m.ChangePasswordPage })));


function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  const getDashboardPath = (role) => {
    switch (role) {
      case 'student': return '/student/dashboard';
      case 'faculty': return '/faculty/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/role-selection';
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        {(user || ['/student/dashboard', '/student/placements', '/student/scholarships', '/student/events', '/student/posts', '/student/attendance', '/student/notifications', '/ai-assistant', '/search'].some(path => location.pathname.startsWith(path)) || location.pathname.startsWith('/post/') || location.pathname.startsWith('/profile/') || location.pathname.startsWith('/faculty/dashboard') || location.pathname.startsWith('/admin/dashboard') || location.pathname.startsWith('/chat')) && <Sidebar />}



        <main className={`flex-1 ${(user || ['/student/dashboard', '/student/placements', '/student/scholarships', '/student/events', '/student/posts', '/student/attendance', '/student/notifications', '/ai-assistant', '/search', '/profile/', '/faculty/dashboard', '/admin/dashboard', '/chat'].some(path => location.pathname.startsWith(path)) || location.pathname.startsWith('/post/')) ? 'p-8' : ''}`}>



          <Suspense fallback={
            <div className="flex items-center justify-center h-[80vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading...</p>
              </div>
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <LandingPage />} />
              <Route path="/role-selection" element={<RoleSelectionPage />} />
              <Route path="/login" element={<Navigate to="/role-selection" replace />} />
              <Route path="/login/:role" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={<StudentDashboard />}
              />

              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/posts"
                element={<PostsPage />}
              />
              <Route
                path="/student/attendance"
                element={<AttendancePage />}
              />

              <Route
                path="/student/complaints"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ComplaintsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/placements"
                element={<PlacementsPage />}
              />
              <Route
                path="/student/scholarships"
                element={<ScholarshipsPage />}
              />
              <Route
                path="/student/events"
                element={<EventsPage />}
              />
              <Route
                path="/ai-assistant"
                element={<AIAssistant />}
              />

              <Route
                path="/student/notifications"
                element={<NotificationsPage />}
              />

              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <div className="card">
                      <h2 className="text-2xl font-bold mb-4">Feature Coming Soon</h2>
                      <p className="text-gray-600">This feature is currently under development.</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Faculty Routes */}
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />

              <Route
                path="/faculty/profile"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/attendance"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <MarkAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/announcements"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <AnnouncementsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/students"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <StudentManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/events"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <FacultyEventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/*"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <div className="card">
                      <h2 className="text-2xl font-bold mb-4">Feature Coming Soon</h2>
                      <p className="text-gray-600">This feature is currently under development.</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ComplaintManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/academic"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                    <AcademicControl />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/moderation"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SocialModeration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/faculty/add"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AddFacultyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <div className="card">
                      <h2 className="text-2xl font-bold mb-4">Feature Coming Soon</h2>
                      <p className="text-gray-600">This feature is currently under development.</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Shared Protected Routes */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={<SearchPage />}
              />

              <Route
                path="/chat"
                element={<ChatPage />}
              />

              <Route
                path="/student/create-post"
                element={
                  <ProtectedRoute allowedRoles={['student', 'faculty']}>
                    <CreatePostPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post/:id"
                element={<DetailedPostPage />}
              />
              <Route
                path="/profile/:id"
                element={<ProfilePage />}
              />

              <Route
                path="/admin/ai-control"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AIControlCenter />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
