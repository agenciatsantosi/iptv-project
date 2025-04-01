import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSystemSettings } from '../services/settings';

export function Navigation() {
  const [siteName, setSiteName] = useState('StreamFlix');

  useEffect(() => {
    loadSiteName();
  }, []);

  async function loadSiteName() {
    const settings = await getSystemSettings();
    if (settings?.name) {
      setSiteName(settings.name);
    }
  }

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-primary font-bold text-xl">
              {siteName}
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link to="/" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Início
                </Link>
                <Link to="/series" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Séries
                </Link>
                <Link to="/filmes" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Filmes
                </Link>
                <Link to="/tv" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  TV ao Vivo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
