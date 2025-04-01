import React from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Shield, Trash2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  created_at: string;
  is_admin: boolean;
}

export function AdminUsers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todos os usuários usando a função
      const { data: users, error: usersError } = await supabase
        .rpc('list_users');
      if (usersError) throw usersError;

      setUsers(users || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Tornar usuário admin
  const makeAdmin = async (userId: string) => {
    try {
      setError(null);
      setSuccess(null);

      // Buscar o ID do papel super_admin
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'super_admin')
        .single();

      if (!role?.id) throw new Error('Papel super_admin não encontrado');

      // Adicionar usuário como admin
      const { error } = await supabase
        .from('admin_users')
        .insert([
          {
            user_id: userId,
            role_id: role.id
          }
        ]);

      if (error) throw error;

      setSuccess('Usuário promovido a admin com sucesso!');
      await loadUsers();
    } catch (error: any) {
      console.error('Erro ao tornar usuário admin:', error);
      setError(error.message);
    }
  };

  // Remover admin
  const removeAdmin = async (userId: string) => {
    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setSuccess('Permissões de admin removidas com sucesso!');
      await loadUsers();
    } catch (error: any) {
      console.error('Erro ao remover admin:', error);
      setError(error.message);
    }
  };

  // Carregar usuários quando o componente montar
  React.useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Usuários
        </h1>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="bg-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-700">
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Criado em</th>
              <th className="px-6 py-3 text-left">Admin</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-zinc-700">
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <span className="inline-flex items-center gap-1 text-green-500">
                        <Shield className="w-4 h-4" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {!user.is_admin && (
                        <button
                          onClick={() => makeAdmin(user.id)}
                          className="p-2 text-purple-500 hover:bg-purple-500/20 rounded-lg"
                          title="Tornar admin"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      {user.is_admin && (
                        <button
                          onClick={() => removeAdmin(user.id)}
                          className="p-2 text-yellow-500 hover:bg-yellow-500/20 rounded-lg"
                          title="Remover admin"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={loadUsers}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Atualizar Lista
      </button>
    </div>
  );
}