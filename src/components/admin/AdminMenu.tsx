import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, BarChart2, Settings, Tv, Upload, FileText } from 'lucide-react';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export function AdminMenu() {
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      label: 'Usuários',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Analytics',
      path: '/admin/analytics',
      icon: <BarChart2 className="w-5 h-5" />
    },
    {
      label: 'Canais',
      path: '/admin/channels',
      icon: <Tv className="w-5 h-5" />
    },
    {
      label: 'Listas IPTV',
      path: '/admin/iptv',
      icon: <Upload className="w-5 h-5" />
    },
    {
      label: 'Páginas',
      path: '/admin/pages',
      icon: <FileText className="w-5 h-5" />
    },
    {
      label: 'Configurações',
      path: '/admin/settings',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <nav className="bg-zinc-800 p-4 rounded-lg">
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-zinc-700'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
