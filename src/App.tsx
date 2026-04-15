import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { Dashboard } from '@/pages/Dashboard'
import { News } from '@/pages/News'
import { MarketInsights } from "@/pages/MarketInsights";
import Community from "@/pages/Community";
import Directory from "@/pages/Directory";
import { NotAvailable } from "@/pages/NotAvailable";
import Questionnaire from "@/pages/Questionnaire";
import CourseResults from "@/pages/CourseResults";
import Resources from "@/pages/Resources";
import Data from "@/pages/Data";
import Podcast from "@/pages/Podcast";
import IFProfessionals from "@/pages/IFProfessionals";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Support from "@/pages/Support";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ZakatCalculator from "@/pages/tools/ZakatCalculator";
import HalalStockScreening from "@/pages/tools/HalalStockScreening";
import HalalCryptoScreening from "@/pages/tools/HalalCryptoScreening";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

/* ── Page imports ──────────────────────────────────────────────────────── */
import { Academy } from "@/pages/Academy";
import { LearningZone } from "@/pages/LearningZone";

/* ── Admin imports ─────────────────────────────────────────────────────── */
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminNews from "@/pages/admin/AdminNews";
import AdminPodcasts from "@/pages/admin/AdminPodcasts";
import AdminLearning from "@/pages/admin/AdminLearning";
import AdminAcademy from "@/pages/admin/AdminAcademy";
import AdminResources from "@/pages/admin/AdminResources";
import AdminData from "@/pages/admin/AdminData";
import AdminCommunity from "@/pages/admin/AdminCommunity";
import AdminDirectory from "@/pages/admin/AdminDirectory";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminIFProfessionals from "@/pages/admin/AdminIFProfessionals";

function App() {
  console.log("App component loaded - routing should work now!");

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="news" element={<News />} />
            <Route path="market-insights" element={<MarketInsights />} />
            <Route
              path="learning-zone"
              element={
                <ProtectedRoute>
                  <LearningZone />
                </ProtectedRoute>
              }
            />
            <Route
              path="academy"
              element={
                <ProtectedRoute>
                  <Academy />
                </ProtectedRoute>
              }
            />
            <Route path="community" element={<Community />} />
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
              path="resources"
              element={
                <ProtectedRoute>
                  <Resources />
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
              path="notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
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
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* Tools routes */}
            <Route
              path="tools/zakat"
              element={
                <ProtectedRoute>
                  <ZakatCalculator />
                </ProtectedRoute>
              }
            />
            <Route
              path="tools/halal-stocks"
              element={
                <ProtectedRoute>
                  <HalalStockScreening />
                </ProtectedRoute>
              }
            />
            <Route
              path="tools/halal-crypto"
              element={
                <ProtectedRoute>
                  <HalalCryptoScreening />
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
            <Route path="learning/paths" element={<AdminLearning />} />
            <Route path="learning/assessments" element={<AdminLearning />} />
            <Route path="learning/results" element={<AdminLearning />} />
            <Route path="academy" element={<AdminAcademy />} />
            <Route path="academy/courses" element={<AdminAcademy />} />
            <Route path="academy/analytics" element={<AdminAcademy />} />
            <Route path="academy/enrollments" element={<AdminAcademy />} />
            <Route path="academy/content" element={<AdminAcademy />} />
            <Route path="learning/payments" element={<AdminLearning />} />
            <Route path="learning/paths" element={<AdminLearning />} />
            <Route path="learning/assessments" element={<AdminLearning />} />
            <Route path="learning/results" element={<AdminLearning />} />
            <Route path="research" element={<AdminResources />} />
            <Route path="data" element={<AdminData />} />
            <Route path="community" element={<AdminCommunity />} />
            <Route path="directory" element={<AdminDirectory />} />
            <Route path="if-professionals" element={<AdminIFProfessionals />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
