import React, { useState, useEffect } from 'react';
import { Image } from 'lucide-react';
import { useIPTVStore } from '../../store/iptvStore';
import { supabase } from '../../lib/supabase';

interface BannerConfig {
  selectedGroups: string[];
  moviesPerGroup: number;
}

export function SystemSettingsPage() {
  const { movies } = useIPTVStore();
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>({ 
    selectedGroups: [],
    moviesPerGroup: 5
  });
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
          .select('selected_groups, movies_per_group')
          .eq('id', 1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Configuração não encontrada, usar valor padrão
            setBannerConfig({ selectedGroups: [], moviesPerGroup: 5 });
          } else {
            throw error;
          }
        } else if (data) {
          setBannerConfig({ 
            selectedGroups: data.selected_groups || [],
            moviesPerGroup: data.movies_per_group || 5
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configuração do banner:', error);
        alert('Erro ao carregar configuração do banner. Usando configuração padrão.');
        setBannerConfig({ selectedGroups: [], moviesPerGroup: 5 });
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
      
      // Verifica se já existe uma configuração
      const { data: existingConfig } = await supabase
        .from('banner_config')
        .select('id')
        .single();

      // Se não existir, cria um novo registro
      if (!existingConfig) {
        const { error: insertError } = await supabase
          .from('banner_config')
          .insert([
            {
              id: 1,
              selected_groups: bannerConfig.selectedGroups,
              movies_per_group: bannerConfig.moviesPerGroup
            }
          ]);

        if (insertError) throw insertError;
      } else {
        // Se existir, atualiza o registro
        const { error: updateError } = await supabase
          .from('banner_config')
          .update({
            selected_groups: bannerConfig.selectedGroups,
            movies_per_group: bannerConfig.moviesPerGroup
          })
          .eq('id', 1);

        if (updateError) throw updateError;
      }

      // Mostra mensagem de sucesso
      alert('Configuração do banner salva com sucesso!');

    } catch (error) {
      console.error('Erro ao salvar configuração do banner:', error);
      alert('Erro ao salvar configuração do banner. Por favor, tente novamente.');
    } finally {
      setLoadingBanner(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Configurações do Sistema</h1>

        {/* Configurações de Streaming */}
        <section className="mb-8">
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Configurações de Streaming</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Streams Simultâneos por Usuário
                </label>
                <input
                  type="number"
                  defaultValue={5}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Qualidade Padrão do Stream
                </label>
                <select className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2">
                  <option>Automático</option>
                  <option>1080p</option>
                  <option>720p</option>
                  <option>480p</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Cache e Armazenamento */}
        <section className="mb-8">
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Cache e Armazenamento</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Duração do Cache (horas)
                </label>
                <input
                  type="number"
                  defaultValue={24}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Limite de Armazenamento (GB)
                </label>
                <input
                  type="number"
                  defaultValue={100}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Configurações do Banner */}
        <section className="mb-8">
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

            {/* Filmes por Grupo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Quantidade de Filmes por Grupo
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={bannerConfig.moviesPerGroup}
                onChange={(e) => setBannerConfig(prev => ({ 
                  ...prev, 
                  moviesPerGroup: Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                }))}
                className="w-32 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2"
              />
              <p className="mt-1 text-sm text-gray-400">
                Quantos filmes serão exibidos de cada grupo selecionado (máximo 20)
              </p>
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
                onClick={() => setBannerConfig({ selectedGroups: [], moviesPerGroup: 5 })}
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
        </section>

        {/* Configurações de Backup */}
        <section>
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Configurações de Backup</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Backup Automático
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-400">Ativado</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Intervalo de Backup (horas)
                </label>
                <input
                  type="number"
                  defaultValue={24}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
