import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { SettingsSection } from '../components/settings/SettingsSection';
import { AccountSettings } from '../components/settings/AccountSettings';
import { PlayerSettings } from '../components/settings/PlayerSettings';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { BannerSettings } from '../components/settings/BannerSettings';
import { useAuthContext } from '../contexts/AuthContext';
import { RequireAuth } from '../components/auth/RequireAuth';

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
    <RequireAuth>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-gray-400 mt-2">
            Gerencie as configurações da sua aplicação
          </p>
        </header>

        <div className="grid gap-8">
          <BannerSettings />
          <SettingsSection title="Conta">
            <AccountSettings />
          </SettingsSection>

          <SettingsSection title="Player">
            <PlayerSettings />
          </SettingsSection>

          <SettingsSection title="Aparência">
            <AppearanceSettings />
          </SettingsSection>
        </div>
      </div>
    </RequireAuth>
  );
}