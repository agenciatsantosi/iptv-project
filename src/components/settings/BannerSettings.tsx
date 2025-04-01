import React, { useState, useEffect } from 'react';
import { Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BannerConfig {
  selectedGroups: string[];
}

export function BannerSettings() {
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>({ selectedGroups: [] });
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [loadingBanner, setLoadingBanner] = useState(false);

  // Carregar grupos disponíveis
  useEffect(() => {
    const groups = [...new Set(movies.map(movie => movie.group))];
    setAvailableGroups(groups);
  }, [movies]);

  // Carregar configuração do banner
  useEffect(() => {
    async function loadBannerConfig() {
      try {
        const { data, error } = await supabase
          .from('banner_config')
          .select('*')
          .single();

        if (error) throw error;

        if (data) {
          setBannerConfig(data);
        }
      } catch (error) {
        console.error('Erro ao carregar configuração do banner:', error);
      }
    }

    loadBannerConfig();
  }, []);

  // Alternar grupo
  const toggleGroup = (group: string) => {
    setBannerConfig(prev => {
      if (prev.selectedGroups.includes(group)) {
        return {
          ...prev,
          selectedGroups: prev.selectedGroups.filter(g => g !== group)
        };
      } else {
        return {
          ...prev,
          selectedGroups: [...prev.selectedGroups, group]
        };
      }
    });
  };

  // Salvar configuração
  const saveBannerConfig = async () => {
    try {
      setLoadingBanner(true);
      const { error } = await supabase
        .from('banner_config')
        .upsert({
          id: 1,
          selected_groups: bannerConfig.selectedGroups
        });

      if (error) throw error;

    } catch (error) {
      console.error('Erro ao salvar configuração do banner:', error);
    } finally {
      setLoadingBanner(false);
    }
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Configuração do Banner</h2>
        </div>
        <div className="text-sm px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full">
          {bannerConfig.selectedGroups.length} grupos selecionados
        </div>
      </div>

      <div className="prose prose-invert mb-6">
        <p className="text-gray-400">
          Selecione os grupos de filmes que serão exibidos no banner da página inicial.
          Os filmes destes grupos serão mostrados em rotação automática.
        </p>
        <ul className="text-sm text-gray-400 list-disc list-inside">
          <li>Você pode selecionar múltiplos grupos</li>
          <li>A ordem de seleção será usada na exibição</li>
          <li>Se nenhum grupo for selecionado, será usado "FILMES: LANÇAMENTOS 2024" por padrão</li>
        </ul>
      </div>

      {/* Lista de Grupos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableGroups.map(group => (
          <div
            key={group}
            className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              bannerConfig.selectedGroups.includes(group)
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-zinc-700 hover:border-purple-500/50'
            }`}
            onClick={() => toggleGroup(group)}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={bannerConfig.selectedGroups.includes(group)}
                onChange={() => toggleGroup(group)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="flex-1">{group}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={saveBannerConfig}
          disabled={loadingBanner}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loadingBanner ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            'Salvar Configuração'
          )}
        </button>

        <button
          onClick={() => setBannerConfig({ selectedGroups: [] })}
          type="button"
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Limpar Seleção
        </button>
      </div>

      {/* Preview */}
      {bannerConfig.selectedGroups.length > 0 && (
        <div className="mt-8 p-4 bg-zinc-900 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            Grupos que aparecerão no banner:
          </h3>
          <div className="flex flex-wrap gap-2">
            {bannerConfig.selectedGroups.map((group, index) => (
              <div
                key={group}
                className="px-3 py-1 bg-zinc-800 rounded-full text-sm flex items-center gap-2"
              >
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-600 text-xs">
                  {index + 1}
                </span>
                <span>{group}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroup(group);
                  }}
                  className="w-4 h-4 hover:text-purple-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
