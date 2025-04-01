import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Info } from 'lucide-react';
import { useIPTVStore } from '../store/iptvStore';
import { useTMDB } from '../hooks/useTMDB';
import { TMDBService } from '../lib/tmdb';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { slugify } from '../utils/string';
import { useWatchHistory } from '../stores/watchHistoryStore';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { ContentReactions } from '../components/ContentReactions';
import { Channel } from '../types/iptv';
import { TMDBSeries } from '../types/tmdb';
import { loadSeriesEpisodes } from '../services/channel-sync';

type TabType = 'episodes' | 'more' | 'similar';

interface TMDBMetadata {
  name?: string;
  tagline?: string;
  first_air_date?: string;
  status?: string;
  networks?: { id: number; name: string }[];
  original_language?: string;
  overview?: string;
  backdrop_path?: string;
  vote_average?: number;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
    }[];
  };
  genres?: {
    id: number;
    name: string;
  }[];
}

export function SeriesDetails() {
  const { slug } = useParams();
  const { series } = useIPTVStore();
  const { isWatched } = useWatchHistory();
  const [activeTab, setActiveTab] = useState<TabType>('episodes');
  const [episodes, setEpisodes] = useState<Channel[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const navigate = useNavigate();

  // Encontra a série e seus episódios
  const currentSeries = useMemo(() => {
    console.log('SeriesDetails: Iniciando busca', {
      slug,
      totalSeries: series?.length
    });

    if (!slug || !series?.length) {
      console.log('SeriesDetails: Sem slug ou série', { slug, totalSeries: series?.length });
      return null;
    }

    // Normaliza o slug recebido
    const normalizedSlug = slug.toLowerCase().replace(/[^\w-]+/g, '');
    console.log('SeriesDetails: Slug normalizado:', normalizedSlug);
    
    // Encontra a série atual pelo slug
    const found = series.find(s => {
      const seriesTitle = s.title || s.name || '';
      // Normaliza o título da série da mesma forma que o slug
      const seriesSlug = seriesTitle
        .toLowerCase()
        .replace(/[^\w\s-]+/g, '')
        .trim()
        .replace(/\s+/g, '-');

      console.log('SeriesDetails: Comparando série', {
        titulo: seriesTitle,
        seriesSlug,
        match: seriesSlug === normalizedSlug
      });

      return seriesSlug === normalizedSlug;
    });

    console.log('SeriesDetails: Série encontrada', found ? {
      id: found.id,
      titulo: found.title || found.name,
      grupo: found.group
    } : 'Nenhuma série encontrada');

    return found;
  }, [slug, series]);

  // Carrega os episódios quando a série é encontrada
  useEffect(() => {
    async function loadEpisodes() {
      if (currentSeries) {
        try {
          const seriesName = currentSeries.title || currentSeries.name;
          console.log('Carregando episódios para série:', seriesName);
          const seriesEpisodes = await loadSeriesEpisodes(seriesName);
          console.log('Episódios encontrados:', seriesEpisodes?.length);
          setEpisodes(seriesEpisodes || []);
        } catch (error) {
          console.error('Erro ao carregar episódios:', error);
        }
      }
    }

    loadEpisodes();
  }, [currentSeries]);

  // Agrupa episódios por temporada
  const seasonEpisodes = useMemo(() => {
    if (!episodes.length) return new Map();

    const seasons = new Map<number, Channel[]>();
    
    try {
      episodes.forEach((episode: Channel) => {
        if (!episode?.name) return;
        
        // Usa o season_number do banco de dados
        const season = episode.season_number || 1;
        
        if (!seasons.has(season)) {
          seasons.set(season, []);
        }

        // Adiciona o episódio à temporada
        const seasonEpisodes = seasons.get(season)!;
        seasonEpisodes.push(episode);
      });

      // Ordena os episódios em cada temporada
      seasons.forEach(seasonEpisodes => {
        seasonEpisodes.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
      });

      // Ordena as temporadas
      const sortedSeasons = new Map([...seasons.entries()].sort((a, b) => a[0] - b[0]));
      
      // Define a primeira temporada como selecionada se ainda não houver uma seleção
      if (sortedSeasons.size > 0 && selectedSeason === null) {
        setSelectedSeason(Array.from(sortedSeasons.keys())[0]);
      }
      
      return sortedSeasons;
    } catch (error) {
      console.error('Erro ao agrupar temporadas:', error);
      seasons.set(1, episodes);
      
      // Define a temporada 1 como selecionada se não houver uma seleção
      if (selectedSeason === null) {
        setSelectedSeason(1);
      }
      
      return seasons;
    }
  }, [episodes, selectedSeason]);

  // Busca metadados do TMDB
  const { data: metadata, loading } = useTMDB(
    currentSeries?.title || currentSeries?.name || '', 
    'tv'
  ) as { data: TMDBMetadata | null, loading: boolean };

  if (!currentSeries) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-white">Série não encontrada</h2>
          <Link 
            to="/series" 
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-500"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para lista de séries</span>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const backdropUrl = metadata?.backdrop_path 
    ? TMDBService.getImageUrl(metadata.backdrop_path, 'original')
    : `/placeholder-series.jpg`;

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[95vh]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={metadata?.name || currentSeries.title || currentSeries.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            to="/series"
            className="flex items-center gap-2 text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-16">
          <div className="container mx-auto">
            {/* Title and Metadata */}
            <div className="max-w-3xl">
              <h1 className="text-6xl font-bold text-white mb-4">
                {metadata?.name || currentSeries.title || currentSeries.name}
              </h1>

              {metadata?.tagline && (
                <p className="text-2xl text-white/80 mb-6 italic">
                  {metadata.tagline}
                </p>
              )}

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {metadata?.vote_average && (
                  <div className="flex items-center gap-1 text-green-500">
                    <span className="font-bold">{Math.round(metadata.vote_average * 10)}%</span>
                    <span>Match</span>
                  </div>
                )}
                {metadata?.first_air_date && (
                  <span className="text-white">
                    {new Date(metadata.first_air_date).getFullYear()}
                  </span>
                )}
                {seasonEpisodes.size > 0 && (
                  <span className="text-white">
                    {seasonEpisodes.size} Temporada{seasonEpisodes.size !== 1 ? 's' : ''}
                  </span>
                )}
                <span className="text-white px-1 py-0.5 border border-white/40 text-sm">
                  HD
                </span>
              </div>

              {/* Overview */}
              {metadata?.overview && (
                <p className="text-xl text-white/90 mb-8 line-clamp-3">
                  {metadata.overview}
                </p>
              )}

              {/* Cast and Crew */}
              {metadata?.credits?.cast && (
                <div className="mb-8 text-white/70">
                  <span className="text-white">Elenco:</span>{' '}
                  {metadata.credits.cast
                    .slice(0, 5)
                    .map(actor => actor.name)
                    .join(', ')}
                </div>
              )}

              {/* Genres */}
              {metadata?.genres && (
                <div className="mb-8 text-white/70">
                  <span className="text-white">Gêneros:</span>{' '}
                  {metadata.genres.map(genre => genre.name).join(', ')}
                </div>
              )}

              {/* Reactions */}
              <div className="mt-8">
                <ContentReactions contentId={currentSeries.id || ''} contentType="series" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-0 bg-black z-20 border-b border-white/10">
        <div className="container mx-auto px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('episodes')}
              className={`py-4 text-lg font-medium transition-colors ${
                activeTab === 'episodes'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              EPISÓDIOS
            </button>
            <button
              onClick={() => setActiveTab('more')}
              className={`py-4 text-lg font-medium transition-colors ${
                activeTab === 'more'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              MAIS DETALHES
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-8 py-8">
        {activeTab === 'episodes' && (
          <div className="space-y-8">
            {/* Seletor de Temporadas */}
            {seasonEpisodes.size > 1 && (
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-xl font-bold text-white">Temporadas:</h3>
                  <div className="relative">
                    <select
                      value={selectedSeason || ''}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="bg-zinc-800 text-white border border-zinc-700 rounded-md px-4 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {Array.from(seasonEpisodes.keys()).map((season) => (
                        <option key={season} value={season}>
                          Temporada {season}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600" 
                    style={{ 
                      width: `${(Array.from(seasonEpisodes.keys()).indexOf(selectedSeason || 1) + 1) / seasonEpisodes.size * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Lista de Episódios da Temporada Selecionada */}
            {selectedSeason !== null && seasonEpisodes.has(selectedSeason) && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Temporada {selectedSeason}
                </h2>
                <div className="grid gap-4">
                  {seasonEpisodes.get(selectedSeason)?.map((episode: Channel) => (
                    <div
                      key={episode.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition group cursor-pointer"
                      onClick={() => {
                        // Verificar se o episódio tem URL
                        if (episode.url) {
                          // Navegar diretamente para a URL do vídeo com parâmetros
                          const videoUrl = encodeURIComponent(episode.url);
                          navigate(`/watch/direct?url=${videoUrl}&title=${encodeURIComponent(episode.name || '')}`);
                        } else {
                          // Fallback para o método antigo
                          navigate(`/watch/${episode.id}`);
                        }
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-40 aspect-video rounded-md overflow-hidden bg-black/20">
                        <img
                          src={episode.thumbnailPath || episode.logo || `/series/${currentSeries.title?.toLowerCase().replace(/[^a-z0-9]/g, '-')}/thumb.jpg`}
                          alt={episode.title || episode.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const imgElement = e.target as HTMLImageElement;
                            if (!imgElement.src.includes('placeholder-episode.jpg')) {
                              imgElement.src = '/placeholder-episode.jpg';
                            }
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition">
                          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </div>

                      {/* Episode Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white group-hover:text-purple-400 transition">
                          Episódio {episode.episode_number?.toString().padStart(2, '0')}
                        </h3>
                      </div>

                      {/* Watch Status */}
                      {isWatched(currentSeries.id, episode.id) && (
                        <div className="text-green-500">
                          <IoCheckmarkCircle className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'more' && (
          <div className="max-w-3xl space-y-8">
            {/* Overview */}
            {metadata?.overview && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Sobre a Série</h2>
                <p className="text-lg text-white/90">{metadata.overview}</p>
              </div>
            )}

            {/* Cast */}
            {metadata?.credits?.cast && metadata.credits.cast.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Elenco</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {metadata.credits.cast.slice(0, 8).map((actor) => (
                    <div key={actor.id} className="text-white/90">
                      <div className="font-medium">{actor.name}</div>
                      <div className="text-sm text-white/60">{actor.character}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {metadata && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Informações</h3>
                  <dl className="space-y-2 text-white/70">
                    {metadata.status && (
                      <>
                        <dt className="text-white">Status</dt>
                        <dd>{metadata.status}</dd>
                      </>
                    )}
                    {metadata.networks && metadata.networks.length > 0 && (
                      <>
                        <dt className="text-white">Canal Original</dt>
                        <dd>{metadata.networks[0].name}</dd>
                      </>
                    )}
                    {metadata.original_language && (
                      <>
                        <dt className="text-white">Idioma Original</dt>
                        <dd>
                          {new Intl.DisplayNames(['pt'], { type: 'language' }).of(
                            metadata.original_language
                          )}
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}