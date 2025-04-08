import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StaticPageRendererProps {
  pageId: string;
  defaultTitle?: string;
}

export function StaticPageRenderer({ pageId, defaultTitle = 'Página' }: StaticPageRendererProps) {
  const [pageContent, setPageContent] = useState<string>('');
  const [pageTitle, setPageTitle] = useState<string>(defaultTitle);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPageContent() {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Carregando conteúdo para página: ${pageId}`);
        
        const { data, error } = await supabase
          .from('static_pages')
          .select('*')
          .eq('id', pageId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // Página não encontrada
            console.log(`Página ${pageId} não encontrada no banco de dados. Usando conteúdo padrão.`);
            // Conteúdo padrão será apenas o conteúdo estático original da página
          } else {
            console.error('Erro ao carregar página:', error);
            setError('Não foi possível carregar o conteúdo da página.');
          }
        } else if (data) {
          console.log(`Conteúdo carregado para a página ${pageId}`);
          setPageTitle(data.title || defaultTitle);
          setPageContent(data.content || '');
        }
      } catch (err) {
        console.error('Erro ao carregar conteúdo da página:', err);
        setError('Ocorreu um erro ao carregar o conteúdo da página.');
      } finally {
        setLoading(false);
      }
    }

    loadPageContent();
  }, [pageId, defaultTitle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-purple-600 border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 p-6 rounded-lg text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erro ao carregar página</h2>
          <p className="text-gray-300">{error}</p>
          <Link to="/" className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-lg">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      {/* Header Fixo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-black/0 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Navegação */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                  {pageTitle}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 pt-36 pb-16">
        <div className="max-w-4xl mx-auto">
          {pageContent ? (
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: pageContent }}
            />
          ) : (
            <div className="bg-zinc-800/50 rounded-xl p-8 backdrop-blur-sm">
              <p className="text-center text-gray-400">
                Esta página ainda não tem conteúdo. Acesse o painel de administração para adicionar conteúdo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 