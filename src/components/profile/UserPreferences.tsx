import React, { useState } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';

const videoQualityOptions = [
  { value: 'auto', label: 'Automática' },
  { value: '1080p', label: '1080p' },
  { value: '720p', label: '720p' },
  { value: '480p', label: '480p' },
  { value: '360p', label: '360p' }
];

const languageOptions = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' }
];

const genreOptions = [
  'Ação',
  'Aventura',
  'Comédia',
  'Drama',
  'Documentário',
  'Esporte',
  'Filmes',
  'Infantil',
  'Música',
  'Notícias',
  'Séries'
].map(genre => ({ value: genre.toLowerCase(), label: genre }));

export function UserPreferences() {
  const { profile, loading, error, updateProfile } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleChange = async (field: string, value: any) => {
    try {
      setSaving(true);
      setSaveError(null);

      await updateProfile({ [field]: value });
    } catch (err) {
      console.error('Error saving preference:', err);
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar preferências');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded">
        Erro ao carregar preferências: {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 text-gray-600">
        Faça login para gerenciar suas preferências
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 text-white">
      {/* Nome de Exibição */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Nome de Exibição
        </label>
        <input
          type="text"
          value={profile.display_name}
          onChange={(e) => handleChange('display_name', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white"
        />
      </div>

      {/* Gêneros Preferidos */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Gêneros Preferidos
        </label>
        <select
          multiple
          value={profile.preferred_genres || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            handleChange('preferred_genres', values);
          }}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white"
        >
          {genreOptions.map(option => (
            <option key={option.value} value={option.value} className="bg-gray-700">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Idioma do Conteúdo */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Idioma do Conteúdo
        </label>
        <select
          value={profile.content_language}
          onChange={(e) => handleChange('content_language', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white"
        >
          {languageOptions.map(option => (
            <option key={option.value} value={option.value} className="bg-gray-700">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Idioma das Legendas */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Idioma das Legendas
        </label>
        <select
          value={profile.subtitle_language}
          onChange={(e) => handleChange('subtitle_language', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white"
        >
          {languageOptions.map(option => (
            <option key={option.value} value={option.value} className="bg-gray-700">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Qualidade do Vídeo */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Qualidade do Vídeo
        </label>
        <select
          value={profile.video_quality}
          onChange={(e) => handleChange('video_quality', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white"
        >
          {videoQualityOptions.map(option => (
            <option key={option.value} value={option.value} className="bg-gray-700">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reprodução Automática */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-200">
          Reprodução Automática
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={profile.autoplay}
            onChange={(e) => handleChange('autoplay', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Conteúdo Adulto */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-200">
          Mostrar Conteúdo Adulto
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={profile.mature_content}
            onChange={(e) => handleChange('mature_content', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {saving && (
        <div className="text-sm text-blue-400">
          Salvando preferências...
        </div>
      )}

      {saveError && (
        <div className="text-sm text-red-400 bg-red-900/50 p-2 rounded">
          {saveError}
        </div>
      )}
    </div>
  );
}
