import React from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { IPTVUploader } from '../components/iptv/IPTVUploader';
import { ContentStats } from '../components/iptv/ContentStats';
import { useIPTVStore } from '../store/iptvStore';
import { useAdmin } from '../hooks/useAdmin';

export function ImportPage() {
  const { movies, series, live } = useIPTVStore();
  const { isAdmin, loading } = useAdmin();
  const hasContent = movies.length > 0 || series.length > 0 || live.length > 0;

  // Aguarda o carregamento do status de admin
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  // Se não for admin, redireciona para a home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Importar Lista IPTV</h1>
      
      {hasContent && <ContentStats />}
      
      <IPTVUploader />
    </div>
  );
}