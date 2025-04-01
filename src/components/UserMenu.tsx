import React from 'react';
import { User, Settings, LogOut, Shield, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { cn } from '../lib/utils';

export function UserMenu() {
  const { user, signOut } = useAuthContext();
  const { isAdmin, initialize } = useAdmin();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-gray-300"
        aria-label="Menu do usuário"
      >
        <User className="w-6 h-6" />
      </button>

      <div
        className={cn(
          'absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-zinc-800 ring-1 ring-black ring-opacity-5',
          'transition-all duration-200 ease-in-out transform origin-top-right',
          isOpen
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <div className="py-1">
          {/* Email do usuário */}
          <div className="px-4 py-2 text-sm text-gray-400 border-b border-zinc-700">
            {user?.email}
            {isAdmin && (
              <span className="ml-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>

          {isAdmin && (
            <Link
              to="/admin"
              className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-zinc-700 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Shield className="w-4 h-4 mr-2" />
              Painel Admin
            </Link>
          )}

          <Link
            to="/profile"
            className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-zinc-700 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <UserCircle className="w-4 h-4 mr-2" />
            Perfil
          </Link>

          <Link
            to="/settings"
            className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-zinc-700 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Link>
          
          <button
            className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-zinc-700 flex items-center"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}