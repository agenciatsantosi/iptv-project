import React, { useState } from 'react';
import { UserPreferences } from '../components/profile/UserPreferences';
import { AvatarSelector } from '../components/profile/AvatarSelector';
import { RecommendedContent } from '../components/recommendations/RecommendedContent';
import { useAuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function ProfilePage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-zinc-700">
            <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-zinc-700">
            <nav className="flex">
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'profile'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Perfil
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'preferences'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                Preferências
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Avatar</h2>
                  <AvatarSelector />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Recomendações</h2>
                  <RecommendedContent />
                </div>
              </div>
            ) : (
              <UserPreferences />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
