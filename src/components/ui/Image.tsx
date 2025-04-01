import { useState, useEffect } from 'react';
import { Image as ChakraImage } from '@chakra-ui/react';
import { cn } from "@/lib/utils";
import { TMDBService } from "@/lib/tmdb";
import { Loader2 } from "lucide-react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackTitle?: string;
}

export function Image({ 
  src, 
  alt, 
  title,
  className = '', 
  fallbackSrc = '/placeholder-movie.jpg',
  fallbackTitle,
  ...props 
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setLoading(true);
    setError(false);
  }, [src]);

  const handleError = async () => {
    try {
      setError(true);
      if (fallbackTitle) {
        setLoading(true);
        const fallbackUrl = await TMDBService.getFallbackImageUrl(fallbackTitle);
        if (fallbackUrl) {
          setImgSrc(fallbackUrl);
          return;
        }
      }
      setImgSrc(fallbackSrc);
    } catch (err) {
      console.error('Erro ao carregar imagem:', err);
      setImgSrc(fallbackSrc);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <ChakraImage
        src={imgSrc}
        alt={alt}
        title={title}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100"
        )}
        onError={handleError}
        onLoad={() => setLoading(false)}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
