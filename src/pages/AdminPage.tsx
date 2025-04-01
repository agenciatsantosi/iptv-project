import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { Shield, Users } from 'lucide-react';
import { SystemSettings } from '../components/admin/SystemSettings';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuthContext();
  const [activeSection, setActiveSection] = useState<'users' | 'settings'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug
  useEffect(() => {
    console.log('Auth State:', { user, isAuthenticated, loading });
  }, [user, isAuthenticated, loading]);

  // Verificar autenticação
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('Redirecionando para home - Não autenticado');
      navigate('/');
      return;
    }

    if (!loading && isAuthenticated) {
      console.log('Usuário autenticado, carregando página');
      loadUsers();
    }
  }, [isAuthenticated, loading, navigate]);

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setPageLoading(true);
      setError(null);

      // Aqui você pode adicionar a lógica para carregar usuários
      // Por enquanto, vamos apenas simular um carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers([]);
      
    } catch (err) {
      setError('Erro ao carregar usuários');
      console.error('Erro:', err);
    } finally {
      setPageLoading(false);
    }
  };

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redireciona se não estiver autenticado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Painel de Administração</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveSection('users')}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            activeSection === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-700'
          }`}
        >
          <Users className="w-5 h-5" />
          Usuários
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            activeSection === 'settings' ? 'bg-purple-600 text-white' : 'bg-gray-700'
          }`}
        >
          <Shield className="w-5 h-5" />
          Configurações
        </button>
      </div>

      <div className="bg-zinc-800 rounded-lg p-6">
        {activeSection === 'users' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Gerenciar Usuários</h2>
            {pageLoading ? (
              <p>Carregando...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : users.length === 0 ? (
              <p>Nenhum usuário encontrado.</p>
            ) : (
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-zinc-700 rounded-lg">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-gray-400">
                        Criado em: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'settings' && (
          <SystemSettings />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
