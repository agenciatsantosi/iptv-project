import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LiveTVPlayer } from '@/components/player/LiveTVPlayer';
import { AuthProtection } from '@/components/auth/AuthProtection';

export function WatchLiveTVPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="text-xl mb-4">Canal não encontrado</p>
        <button
          onClick={() => navigate('/tv')}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md transition"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <AuthProtection>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-black/0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link
                to="/tv"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* Player */}
        <div className="pt-20">
          <div className="container mx-auto px-4">
            <LiveTVPlayer channelId={id} />
          </div>
        </div>
      </div>
    </AuthProtection>
  );
}
