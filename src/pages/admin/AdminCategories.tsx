import React from 'react';
import { List, Edit2, Trash2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  channel_count?: number;
}

export function AdminCategories() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [newCategory, setNewCategory] = React.useState({
    name: '',
    description: ''
  });

  // Carregar categorias
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Primeiro, buscar todas as categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Depois, buscar a contagem de canais para cada categoria
      const categoriesWithCount = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count, error: countError } = await supabase
            .from('channel_categories')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          if (countError) throw countError;

          return {
            ...category,
            channel_count: count || 0
          };
        })
      );

      setCategories(categoriesWithCount);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar categoria
  const addCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        setError('Nome da categoria é obrigatório');
        return;
      }

      const slug = newCategory.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategory.name.trim(),
          description: newCategory.description.trim(),
          slug
        });

      if (error) throw error;

      setNewCategory({ name: '', description: '' });
      loadCategories();
    } catch (error: any) {
      console.error('Erro ao adicionar categoria:', error);
      setError(error.message);
    }
  };

  // Atualizar categoria
  const updateCategory = async () => {
    try {
      if (!editingCategory) return;

      const slug = editingCategory.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name.trim(),
          description: editingCategory.description.trim(),
          slug
        })
        .eq('id', editingCategory.id);

      if (error) throw error;

      setEditingCategory(null);
      loadCategories();
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      setError(error.message);
    }
  };

  // Deletar categoria
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadCategories();
    } catch (error: any) {
      console.error('Erro ao deletar categoria:', error);
      setError(error.message);
    }
  };

  React.useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <List className="w-8 h-8 mr-2" />
          Gerenciamento de Categorias
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-md text-white">
          {error}
        </div>
      )}

      {/* Formulário de nova categoria */}
      <div className="mb-8 bg-zinc-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Nova Categoria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome da categoria"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="bg-zinc-700 text-white px-4 py-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Descrição"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            className="bg-zinc-700 text-white px-4 py-2 rounded-md"
          />
        </div>
        <button
          onClick={addCategory}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Categoria
        </button>
      </div>

      {/* Lista de categorias */}
      <div className="bg-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Canais
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-white">
                    Carregando...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-white">
                    Nenhuma categoria encontrada
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-zinc-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {editingCategory?.id === category.id ? (
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, name: e.target.value })
                          }
                          className="bg-zinc-700 text-white px-2 py-1 rounded"
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {editingCategory?.id === category.id ? (
                        <input
                          type="text"
                          value={editingCategory.description}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, description: e.target.value })
                          }
                          className="bg-zinc-700 text-white px-2 py-1 rounded"
                        />
                      ) : (
                        category.description
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {category.channel_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        {editingCategory?.id === category.id ? (
                          <button
                            onClick={updateCategory}
                            className="text-green-400 hover:text-green-300"
                            title="Salvar"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
