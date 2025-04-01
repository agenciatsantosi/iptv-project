import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { WatchPage } from '../pages/WatchPage';
import { SeriesPage } from '../pages/SeriesPage';
import { MoviesPage } from '../pages/MoviesPage';
import { LivePage } from '../pages/LivePage';
import { SearchPage } from '../pages/SearchPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SystemSettingsPage } from '../pages/admin/SystemSettingsPage';
import { AdminIPTVPage } from '../pages/admin/AdminIPTVPage';
import { RequireAuth } from './auth/RequireAuth';
import { AdminRoute } from './auth/AdminRoute';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AuthModal } from './auth/AuthModal';

export function AppContent() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/watch/:id/:episodeId" element={<WatchPage />} />
          <Route path="/series/:id" element={<SeriesPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/search" element={<SearchPage />} />
          
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin/settings" element={<SystemSettingsPage />} />
            <Route path="/admin/iptv" element={<AdminIPTVPage />} />
          </Route>
        </Routes>
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
}
