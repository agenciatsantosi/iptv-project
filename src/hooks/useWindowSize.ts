import { useState, useEffect } from 'react';

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Adicionar event listener
    window.addEventListener('resize', handleResize);
    
    // Chamar handler imediatamente para definir tamanho inicial
    handleResize();
    
    // Limpar event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Array vazio significa que o efeito roda apenas na montagem

  return windowSize;
}
