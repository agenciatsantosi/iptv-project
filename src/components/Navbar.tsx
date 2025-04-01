import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Tv2, Radio, Heart } from 'lucide-react';
import { UserMenu } from './UserMenu';

export function Navbar() {
  const location = useLocation();

  const navigation = [
    { name: 'Filmes', href: '/movies', icon: Film },
    { name: 'Séries', href: '/series', icon: Tv2 },
    { name: 'TV ao Vivo', href: '/live', icon: Radio },
    { name: 'Favoritos', href: '/favorites', icon: Heart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-black/50 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
              IPTV
            </span>
          </Link>

          {/* Links de Navegação */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Menu do Usuário */}
          <UserMenu />
        </div>
      </div>

      {/* Menu Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}