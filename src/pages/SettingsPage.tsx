import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { SettingsSection } from '../components/settings/SettingsSection';
import { AccountSettings } from '../components/settings/AccountSettings';
import { PlayerSettings } from '../components/settings/PlayerSettings';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { BannerSettings } from '../components/settings/BannerSettings';
import { useAuthContext } from '../contexts/AuthContext';

export function SettingsPage() {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <SettingsIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-400">
            Faça login para acessar as configurações
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Configurações</h1>
      
      <div className="space-y-8">
        <SettingsSection title="Conta">
          <AccountSettings />
        </SettingsSection>

        <SettingsSection title="Player">
          <PlayerSettings />
        </SettingsSection>

        <SettingsSection title="Aparência">
          <AppearanceSettings />
        </SettingsSection>

        <SettingsSection title="Banner">
          <BannerSettings />
        </SettingsSection>
      </div>
    </div>
  );
}