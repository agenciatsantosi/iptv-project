import React from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';

interface WatchButtonProps {
  contentId: string;
  className?: string;
}

export function WatchButton({ contentId, className = '' }: WatchButtonProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  const handleClick = () => {
    if (user) {
      navigate(`/watch/${contentId}`);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-8 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition ${className}`}
      >
        <Play className="w-5 h-5" />
        Assistir
      </button>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
