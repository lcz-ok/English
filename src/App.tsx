import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Login, Register } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Courses } from "./pages/Courses";
import { CourseDetail } from "./pages/CourseDetail";
import { LessonPage } from "./pages/LessonPage";
import { Community } from "./pages/Community";
import { Achievements } from "./pages/Achievements";
import { Profile } from "./pages/Profile";
import { LearningPathPage } from "./pages/LearningPath";
import { AdminUsers } from "./pages/AdminUsers";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, logout } = useApp();
  // Not logged in -> go to login
  if (!user) return <Navigate to="/login" replace />;
  // Banned during session -> force logout and go to login
  if (user.banned) {
    logout();
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Admin-only route guard
function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useApp();
  if (!user?.isAdmin) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:courseId" element={<CourseDetail />} />
            <Route path="lesson/:lessonId" element={<LessonPage />} />
            <Route path="path" element={<LearningPathPage />} />
            <Route path="community" element={<Community />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="profile" element={<Profile />} />
            <Route
              path="admin/users"
              element={
                <RequireAdmin>
                  <AdminUsers />
                </RequireAdmin>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
