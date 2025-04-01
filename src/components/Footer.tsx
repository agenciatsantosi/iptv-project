import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    platform: [
      { label: 'Sobre', href: '/about' },
      { label: 'Contato', href: '/contact' },
      { label: 'Termos', href: '/terms' },
      { label: 'Privacidade', href: '/privacy' }
    ],
    content: [
      { label: 'Filmes', href: '/movies' },
      { label: 'Séries', href: '/series' },
      { label: 'TV ao Vivo', href: '/live' }
    ],
    support: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Ajuda', href: '/help' },
      { label: 'Conta', href: '/settings' },
      { label: 'Admin', href: '/admin' }
    ]
  };

  return (
    <footer className="bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-400 bg-clip-text text-transparent">
              IPTV
            </h2>
            <p className="text-gray-400 text-sm">
              Sua plataforma de streaming favorita com os melhores conteúdos.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-gray-400 hover:text-white">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="mailto:contact@example.com" className="text-gray-400 hover:text-white">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Plataforma
            </h3>
            <ul className="space-y-2">
              {links.platform.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Conteúdo
            </h3>
            <ul className="space-y-2">
              {links.content.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Suporte
            </h3>
            <ul className="space-y-2">
              {links.support.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {currentYear} IPTV. Todos os direitos reservados.
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <span className="text-gray-400 text-sm flex items-center">
                Feito com <Heart className="w-4 h-4 text-red-500 mx-1" /> pela equipe IPTV
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}