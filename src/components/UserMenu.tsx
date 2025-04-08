import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, Shield, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';

export function UserMenu() {
  const { user, signOut } = useAuthContext();
  const { isAdmin, initialize } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Atualizar a posição do menu quando o botão é clicado
  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right
      });
    }
    setIsOpen(!isOpen);
  };

  // Adicionar evento global para fechar o menu ao clicar fora
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    // Usar setTimeout para evitar que o evento de clique que abriu o menu também o feche
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isOpen]);

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
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="text-white hover:text-gray-300"
        style={{ position: 'relative', zIndex: 9999 }}
      >
        <User className="w-6 h-6" />
      </button>

      {isOpen && (
        <div
          id="user-menu-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            zIndex: 999999
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            id="user-menu-dropdown"
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
              width: '200px',
              backgroundColor: '#27272a',
              borderRadius: '0.375rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 9999999,
              overflow: 'visible'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '0.5rem 0' }}>
              {/* Email do usuário */}
              <div style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '0.875rem', 
                color: '#a1a1aa', 
                borderBottom: '1px solid rgba(63, 63, 70, 1)' 
              }}>
                {user?.email}
                {isAdmin && (
                  <span style={{ 
                    marginLeft: '0.25rem', 
                    fontSize: '0.75rem', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '0.25rem' 
                  }}>
                    Admin
                  </span>
                )}
              </div>

              {isAdmin && (
                <a
                  href="/admin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    color: '#d4d4d8',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    navigate('/admin');
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Painel Admin
                </a>
              )}

              <a
                href="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  color: '#d4d4d8',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  navigate('/profile');
                }}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Perfil
              </a>

              <a
                href="/settings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  color: '#d4d4d8',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  navigate('/settings');
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </a>
              
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  color: '#d4d4d8',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}