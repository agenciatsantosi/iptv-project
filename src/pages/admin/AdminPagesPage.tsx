import React, { useState, useEffect } from 'react';
import { FileText, Edit2, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Tipos de páginas estáticas disponíveis
const PAGES = [
  { id: 'about', title: 'Sobre Nós', route: '/about' },
  { id: 'contact', title: 'Contato', route: '/contact' },
  { id: 'terms', title: 'Termos de Uso', route: '/terms' },
  { id: 'privacy', title: 'Política de Privacidade', route: '/privacy' },
  { id: 'help', title: 'Ajuda', route: '/help' },
  { id: 'faq', title: 'Perguntas Frequentes', route: '/faq' }
];

interface PageContent {
  id: string;
  title: string;
  content: string;
  updated_at?: string;
}

export function AdminPagesPage() {
  const [selectedPage, setSelectedPage] = useState<string>(PAGES[0].id);
  const [pageContent, setPageContent] = useState<string>('');
  const [pageTitle, setPageTitle] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carregar conteúdo da página selecionada
  useEffect(() => {
    async function loadPageContent() {
      try {
        setError(null);
        
        const { data, error } = await supabase
          .from('static_pages')
          .select('*')
          .eq('id', selectedPage)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // Página não encontrada
            // Definir valores padrão para uma nova página
            const pageInfo = PAGES.find(p => p.id === selectedPage);
            setPageTitle(pageInfo?.title || '');
            setPageContent('');
          } else {
            throw error;
          }
        } else if (data) {
          setPageTitle(data.title || '');
          setPageContent(data.content || '');
        }
      } catch (err) {
        console.error('Erro ao carregar conteúdo da página:', err);
        setError('Erro ao carregar conteúdo da página. Por favor, tente novamente.');
      }
    }

    loadPageContent();
  }, [selectedPage]);

  // Salvar conteúdo da página
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Verificar se a página já existe
      const { data: existingPage } = await supabase
        .from('static_pages')
        .select('id')
        .eq('id', selectedPage)
        .single();

      if (existingPage) {
        // Atualizar página existente
        const { error: updateError } = await supabase
          .from('static_pages')
          .update({
            title: pageTitle,
            content: pageContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedPage);

        if (updateError) throw updateError;
      } else {
        // Criar nova página
        const { error: insertError } = await supabase
          .from('static_pages')
          .insert([
            {
              id: selectedPage,
              title: pageTitle,
              content: pageContent,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (insertError) throw insertError;
      }

      setSuccessMessage('Página salva com sucesso!');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (err) {
      console.error('Erro ao salvar conteúdo da página:', err);
      setError('Erro ao salvar conteúdo da página. Por favor, tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Páginas</h1>
      
      <div className="bg-zinc-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-semibold">Gerenciar Páginas Estáticas</h2>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Página</span>
              </>
            )}
          </button>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg flex items-center gap-2">
            <Save className="w-5 h-5" />
            <p>{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Lista de Páginas */}
          <div className="bg-zinc-900 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Páginas</h3>
            <ul className="space-y-2">
              {PAGES.map((page) => (
                <li key={page.id}>
                  <button
                    onClick={() => setSelectedPage(page.id)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg ${
                      selectedPage === page.id
                        ? 'bg-purple-600/20 text-purple-400'
                        : 'hover:bg-zinc-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{page.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Editor de Página */}
          <div className="md:col-span-3 space-y-4">
            {/* Título da Página */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Título da Página
              </label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Digite o título da página"
              />
            </div>

            {/* Editor de Conteúdo */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Conteúdo
              </label>
              <textarea
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                className="w-full h-[500px] bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="<!-- Use HTML para formatar o conteúdo da página -->"
              />
              <p className="mt-2 text-xs text-gray-500">
                Você pode usar HTML para formatar o conteúdo da página. O conteúdo será exibido como está na página {PAGES.find(p => p.id === selectedPage)?.route}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 