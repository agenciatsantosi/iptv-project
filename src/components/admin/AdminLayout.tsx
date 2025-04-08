import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Play,
  List,
  Activity,
  AlertTriangle,
  Database,
  HardDrive,
  BarChart2,
  Upload
} from 'lucide-react';

export function AdminLayout() {
  const { isAdmin, loading, error, initialize } = useAdmin();
  const navigate = useNavigate();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  React.useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 bg-red-500/10 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const menuItems = [
    {
      title: 'Geral',
      items: [
        { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { to: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Usuários' },
        { to: '/admin/roles', icon: <Shield className="w-5 h-5" />, label: 'Papéis' },
        { to: '/admin/analytics', icon: <BarChart2 className="w-5 h-5" />, label: 'Analytics' },
      ]
    },
    {
      title: 'Conteúdo',
      items: [
        { to: '/admin/channels', icon: <Play className="w-5 h-5" />, label: 'Canais' },
        { to: '/admin/categories', icon: <List className="w-5 h-5" />, label: 'Categorias' },
        { to: '/admin/iptv', icon: <Upload className="w-5 h-5" />, label: 'Listas IPTV' },
        { to: '/admin/pages', icon: <List className="w-5 h-5" />, label: 'Páginas' },
        { to: '/upload-large-file', icon: <Upload className="w-5 h-5" />, label: 'Upload 200MB' },
        { to: '/admin/content-moderation', icon: <AlertTriangle className="w-5 h-5" />, label: 'Moderação' },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { to: '/admin/monitoring', icon: <Activity className="w-5 h-5" />, label: 'Monitoramento' },
        { to: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Configurações' },
        { to: '/admin/backup', icon: <Database className="w-5 h-5" />, label: 'Backup' },
        { to: '/admin/storage', icon: <HardDrive className="w-5 h-5" />, label: 'Armazenamento' },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-800 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white">Painel Admin</h2>
          <p className="text-sm text-gray-400">Gerenciamento do sistema</p>
        </div>

        <nav className="space-y-8">
          {menuItems.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}