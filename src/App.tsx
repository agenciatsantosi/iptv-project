import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { SeriesPage } from './pages/SeriesPage';
import { LivePage } from './pages/LivePage';
import { SettingsPage } from './pages/SettingsPage';
import { MovieDetails } from './pages/MovieDetails';
import { SeriesDetails } from './pages/SeriesDetails';
import { IPTVPlayerPage } from './pages/IPTVPlayerPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminRoles } from './pages/admin/AdminRoles';
import { AuthModal } from './components/auth/AuthModal';
import { useAuthContext } from './contexts/AuthContext';
import { useLoadChannels } from './hooks/useLoadChannels';
import { WatchPage } from './pages/WatchPage';
import { AdminChannels } from './pages/admin/AdminChannels';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminModeration } from './pages/admin/AdminModeration';
import { AdminMonitoring } from './pages/admin/AdminMonitoring';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminBackup } from './pages/admin/AdminBackup';
import { AdminStorage } from './pages/admin/AdminStorage';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';
import { AdminIPTVPage } from './pages/admin/AdminIPTVPage';
import { AdminPagesPage } from './pages/admin/AdminPagesPage';
import { Toaster } from './components/ui/Toast/Toaster';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { RequireAuth } from './components/auth/RequireAuth';
import { ContentDetailsPage } from './pages/ContentDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { WatchLiveTVPage } from './pages/WatchLiveTVPage';
import { LargeFileUploadPage } from './pages/LargeFileUploadPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';
import { HelpPage } from './pages/HelpPage';
import { FAQPage } from './pages/FAQPage';
import theme from './styles/theme';
import './styles/global.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuthContext();
  useLoadChannels();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/content/:id" element={<ContentDetailsPage />} />
          <Route path="/upload-large-file" element={<LargeFileUploadPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/faq" element={<FAQPage />} />
          
          {/* Rotas Privadas */}
          <Route path="/tv/watch/:id" element={<PrivateRoute><WatchLiveTVPage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/series/:slug" element={<SeriesDetails />} />
          <Route path="/watch/:id" element={<PrivateRoute><WatchPage /></PrivateRoute>} />
          <Route path="/watch/:id/episode/:episodeId" element={<PrivateRoute><WatchPage /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          
          {/* Rotas Admin */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="channels" element={<AdminChannels />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="content-moderation" element={<AdminModeration />} />
              <Route path="monitoring" element={<AdminMonitoring />} />
              <Route path="settings" element={<SystemSettingsPage />} />
              <Route path="backup" element={<AdminBackup />} />
              <Route path="storage" element={<AdminStorage />} />
              <Route path="iptv" element={<AdminIPTVPage />} />
              <Route path="pages" element={<AdminPagesPage />} />
            </Route>
          </Route>
        </Routes>
      </main>

      <Footer />
      <AuthModal isOpen={false} onClose={() => {}} />
    </div>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;