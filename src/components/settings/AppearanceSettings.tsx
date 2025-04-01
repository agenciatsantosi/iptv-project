import React from 'react';
import { useAppearanceSettings } from '../../hooks/useAppearanceSettings';

export function AppearanceSettings() {
  const { settings, updateSettings } = useAppearanceSettings();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Tema</label>
        <select
          value={settings.theme}
          onChange={(e) => updateSettings({ theme: e.target.value })}
          className="w-full px-4 py-2 bg-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
        >
          <option value="system">Sistema</option>
          <option value="dark">Escuro</option>
          <option value="light">Claro</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm font-medium">Reduzir Animações</span>
        </label>
      </div>
    </div>
  );
}