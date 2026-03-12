import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { Dashboard } from '@/pages/Dashboard'
import { News } from '@/pages/News'
import { MarketInsights } from '@/pages/MarketInsights'
import { LearningZone } from '@/pages/LearningZone'
import Community from '@/pages/Community'
import Directory from '@/pages/Directory'
import { NotAvailable } from '@/pages/NotAvailable'
import Questionnaire from '@/pages/Questionnaire'
import CourseResults from '@/pages/CourseResults'
import ResearchReports from '@/pages/ResearchReports'
import Data from '@/pages/Data'
import Podcast from '@/pages/Podcast'
import IFProfessionals from '@/pages/IFProfessionals'
import Settings from '@/pages/Settings'
import Support from '@/pages/Support'
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

/* ── Admin imports ─────────────────────────────────────────────────────── */
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminNews from "@/pages/admin/AdminNews";
import AdminPodcasts from "@/pages/admin/AdminPodcasts";
import AdminLearning from "@/pages/admin/AdminLearning";
import AdminResearch from "@/pages/admin/AdminResearch";
import AdminData from "@/pages/admin/AdminData";
import AdminCommunity from "@/pages/admin/AdminCommunity";
import AdminDirectory from "@/pages/admin/AdminDirectory";
import AdminSettings from "@/pages/admin/AdminSettings";

function App() {
  console.log("App component loaded - routing should work now!");

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route
              path="news"
              element={
                <ProtectedRoute>
                  <News />
                </ProtectedRoute>
              }
            />
            <Route
              path="market-insights"
              element={
                <ProtectedRoute>
                  <MarketInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="learning-zone"
              element={
                <ProtectedRoute>
                  <LearningZone />
                </ProtectedRoute>
              }
            />
            <Route
              path="community"
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path="directory"
              element={
                <ProtectedRoute>
                  <Directory />
                </ProtectedRoute>
              }
            />
            <Route
              path="questionnaire"
              element={
                <ProtectedRoute>
                  <Questionnaire />
                </ProtectedRoute>
              }
            />
            <Route
              path="course-results"
              element={
                <ProtectedRoute>
                  <CourseResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="research-reports"
              element={
                <ProtectedRoute>
                  <ResearchReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="data"
              element={
                <ProtectedRoute>
                  <Data />
                </ProtectedRoute>
              }
            />
            <Route
              path="podcast"
              element={
                <ProtectedRoute>
                  <Podcast />
                </ProtectedRoute>
              }
            />
            <Route
              path="if-professionals"
              element={
                <ProtectedRoute>
                  <IFProfessionals />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="support"
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              }
            />
            {/* Catch-all route for any undefined paths */}
            <Route path="*" element={<NotAvailable />} />
          </Route>

          {/* ── Admin routes ─────────────────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="podcasts" element={<AdminPodcasts />} />
            <Route path="learning" element={<AdminLearning />} />
            <Route path="learning/courses" element={<AdminLearning />} />
            <Route path="learning/educators" element={<AdminLearning />} />
            <Route path="learning/videos" element={<AdminLearning />} />
            <Route path="learning/programmes" element={<AdminLearning />} />
            <Route path="learning/certificates" element={<AdminLearning />} />
            <Route path="learning/payments" element={<AdminLearning />} />
            <Route path="research" element={<AdminResearch />} />
            <Route path="data" element={<AdminData />} />
            <Route path="community" element={<AdminCommunity />} />
            <Route path="directory" element={<AdminDirectory />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
