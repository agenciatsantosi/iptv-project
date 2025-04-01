import React from 'react';
import { Film, Tv, Radio } from 'lucide-react';
import { useIPTVStore } from '../../store/iptvStore';

export function ContentStats() {
  const { movies, series, live } = useIPTVStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-zinc-800 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <Film className="w-6 h-6 text-purple-500" />
          <div>
            <h3 className="text-sm font-medium text-gray-400">Filmes</h3>
            <p className="text-2xl font-bold">{movies.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-800 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <Tv className="w-6 h-6 text-purple-500" />
          <div>
            <h3 className="text-sm font-medium text-gray-400">Séries</h3>
            <p className="text-2xl font-bold">{series.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-800 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-purple-500" />
          <div>
            <h3 className="text-sm font-medium text-gray-400">Canais ao Vivo</h3>
            <p className="text-2xl font-bold">{live.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}