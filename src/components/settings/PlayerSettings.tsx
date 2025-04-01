import React from 'react';
import { usePlayerSettings } from '../../hooks/usePlayerSettings';

export function PlayerSettings() {
  const { settings, updateSettings } = usePlayerSettings();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Qualidade Padrão</label>
        <select
          value={settings.defaultQuality}
          onChange={(e) => updateSettings({ defaultQuality: e.target.value })}
          className="w-full px-4 py-2 bg-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
        >
          <option value="auto">Automática</option>
          <option value="1080p">1080p</option>
          <option value="720p">720p</option>
          <option value="480p">480p</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.autoplay}
            onChange={(e) => updateSettings({ autoplay: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm font-medium">Reprodução Automática</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.muted}
            onChange={(e) => updateSettings({ muted: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm font-medium">Iniciar Mudo</span>
        </label>
      </div>
    </div>
  );
}