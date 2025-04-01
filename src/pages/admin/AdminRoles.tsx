import React from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Shield, Trash2, Plus } from 'lucide-react';

export function AdminRoles() {
  const { roles, loading, error, fetchRoles, createRole, updateRole, deleteRole } = useAdmin();

  React.useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="text-red-500 bg-red-500/10 p-4 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Papéis e Permissões</h1>
        <button
          onClick={() => {/* TODO: Implementar modal de adicionar papel */}}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Papel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-purple-500" />
                <h3 className="font-medium">{role.name}</h3>
              </div>
              {role.name !== 'super_admin' && (
                <button
                  onClick={() => deleteRole(role.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400">Permissões:</h4>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 text-xs bg-zinc-700 rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}