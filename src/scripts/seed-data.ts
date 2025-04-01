import { supabase } from '../lib/supabase';

const sampleMovies = [
  {
    id: 'movie-1',
    name: 'O Poderoso Chefão (1972)',
    logo: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    group_title: 'FILMES',
    url: 'https://example.com/movie1.mp4',
    type: 'movie',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'movie-2',
    name: 'Matrix (1999)',
    logo: 'https://image.tmdb.org/t/p/w500/hEpWvX6Bp79eLxY1K2FxRcj0xKC.jpg',
    group_title: 'FILMES',
    url: 'https://example.com/movie2.mp4',
    type: 'movie',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'movie-3',
    name: 'Interestelar (2014)',
    logo: 'https://image.tmdb.org/t/p/w500/nrSaXF39nDfAAeLKksRCyvSzI2a.jpg',
    group_title: 'FILMES',
    url: 'https://example.com/movie3.mp4',
    type: 'movie',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function seedData() {
  try {
    console.log('Iniciando seed de dados...');

    // Inserir filmes
    const { error: moviesError } = await supabase
      .from('channels')
      .upsert(sampleMovies);

    if (moviesError) {
      throw moviesError;
    }

    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seed:', error);
  }
}

// Executar o seed
seedData();
