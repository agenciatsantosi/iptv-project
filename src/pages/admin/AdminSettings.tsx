import React from 'react';
import { Settings, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SystemSettings {
  max_concurrent_streams: number;
  default_stream_quality: string;
  cache_duration: number;
  max_storage_gb: number;
  auto_backup_enabled: boolean;
  backup_interval_hours: number;
}

export function AdminSettings() {
  const [settings, setSettings] = React.useState<SystemSettings>({
    max_concurrent_streams: 5,
    default_stream_quality: 'auto',
    cache_duration: 24,
    max_storage_gb: 100,
    auto_backup_enabled: true,
    backup_interval_hours: 24
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Carregar configurações
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) setSettings(data);
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('system_settings')
        .upsert(settings);

      if (error) throw error;
      setSuccess('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Settings className="w-8 h-8 mr-2" />
          Configurações do Sistema
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-md text-white">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-md text-white">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center text-white">Carregando...</div>
      ) : (
        <div className="space-y-8">
          {/* Streaming */}
          <div className="bg-zinc-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Configurações de Streaming</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Streams Simultâneos por Usuário
                </label>
                <input
                  type="number"
                  value={settings.max_concurrent_streams}
                  onChange={(e) =>
                    setSettings({ ...settings, max_concurrent_streams: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Qualidade Padrão do Stream
                </label>
                <select
                  value={settings.default_stream_quality}
                  onChange={(e) =>
                    setSettings({ ...settings, default_stream_quality: e.target.value })
                  }
                  className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md"
                >
                  <option value="auto">Automático</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                  <option value="360p">360p</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cache e Armazenamento */}
          <div className="bg-zinc-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Cache e Armazenamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duração do Cache (horas)
                </label>
                <input
                  type="number"
                  value={settings.cache_duration}
                  onChange={(e) =>
                    setSettings({ ...settings, cache_duration: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Limite de Armazenamento (GB)
                </label>
                <input
                  type="number"
                  value={settings.max_storage_gb}
                  onChange={(e) =>
                    setSettings({ ...settings, max_storage_gb: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Backup */}
          <div className="bg-zinc-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Configurações de Backup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Backup Automático
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.auto_backup_enabled}
                    onChange={(e) =>
                      setSettings({ ...settings, auto_backup_enabled: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded"
                  />
                  <span className="ml-2 text-gray-300">Ativado</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Intervalo de Backup (horas)
                </label>
                <input
                  type="number"
                  value={settings.backup_interval_hours}
                  onChange={(e) =>
                    setSettings({ ...settings, backup_interval_hours: Number(e.target.value) })
                  }
                  disabled={!settings.auto_backup_enabled}
                  className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-md text-white flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
