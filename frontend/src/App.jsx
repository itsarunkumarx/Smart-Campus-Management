import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/layouts/Navbar';
import { Sidebar } from './components/layouts/Sidebar';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { RoleSelectionPage } from './pages/public/RoleSelectionPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Dashboards
import { StudentDashboard } from './pages/student/StudentDashboard';
import { PostsPage } from './pages/student/PostsPage';
import { AttendancePage } from './pages/student/AttendancePage';
import { ProfilePage } from './pages/student/ProfilePage';
import { ComplaintsPage } from './pages/student/ComplaintsPage';
import { PlacementsPage } from './pages/student/PlacementsPage';
import { ScholarshipsPage } from './pages/student/ScholarshipsPage';
import { EventsPage } from './pages/student/EventsPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { MarkAttendance } from './pages/faculty/MarkAttendance';
import { AnnouncementsPage } from './pages/faculty/AnnouncementsPage';
import { StudentManagement } from './pages/faculty/StudentManagement';
import { FacultyEventsPage } from './pages/faculty/FacultyEventsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { ComplaintManagement } from './pages/admin/ComplaintManagement';
import { AcademicControl } from './pages/admin/AcademicControl';
import { SocialModeration } from './pages/admin/SocialModeration';
import { SettingsPage } from './pages/shared/SettingsPage';
import { TasksPage } from './pages/shared/TasksPage';
import { SearchPage } from './pages/shared/SearchPage';
import { ChatPage } from './pages/shared/ChatPage';
import { AIControlCenter } from './pages/admin/AIControlCenter';
import { AIAssistant } from './pages/shared/AIAssistant';
import { CreatePostPage } from './pages/shared/CreatePostPage';
import { DetailedPostPage } from './pages/shared/DetailedPostPage';
import { AddFacultyPage } from './pages/admin/AddFacultyPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';

function AppRoutes() {
  const { user } = useAuth();

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
        {user && <Sidebar />}
        <main className={`flex-1 ${user ? 'p-8' : ''}`}>
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
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
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
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <PostsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AttendancePage />
                </ProtectedRoute>
              }
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
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <PlacementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/scholarships"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ScholarshipsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/events"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <EventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                  <AIAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/notifications"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
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
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
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
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
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
                <ProtectedRoute allowedRoles={['admin']}>
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
              element={
                <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                  <ChatPage />
                </ProtectedRoute>
              }
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
              element={
                <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                  <DetailedPostPage />
                </ProtectedRoute>
              }
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
