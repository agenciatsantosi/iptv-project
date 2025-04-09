import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';

interface VideoPlayerProps {
  url: string;
  title?: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const destroyHls = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  const initializePlayer = async () => {
    if (!videoRef.current || !url) {
      setError('Video player could not be initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Initializing video player with URL:', url);

      if (url.includes('.m3u8')) {
        // HLS Stream
        if (Hls.isSupported()) {
          destroyHls();
          
          const hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000, // 60MB
            maxBufferHole: 0.5,
            lowLatencyMode: true,
          });

          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            console.log('HLS: Media attached');
            if (autoPlay) videoRef.current?.play();
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS: Manifest parsed');
            setIsLoading(false);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (retryCount < maxRetries) {
                    console.log(`Attempting to recover from network error (attempt ${retryCount + 1}/${maxRetries})`);
                    hls.startLoad();
                    setRetryCount(prev => prev + 1);
                  } else {
                    setError('Network error: Please check your connection and try again');
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  if (retryCount < maxRetries) {
                    console.log(`Attempting to recover from media error (attempt ${retryCount + 1}/${maxRetries})`);
                    hls.recoverMediaError();
                    setRetryCount(prev => prev + 1);
                  } else {
                    setError('Media error: The video could not be loaded');
                  }
                  break;
                default:
                  setError('An error occurred while playing the video');
                  destroyHls();
                  break;
              }
            }
          });
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          videoRef.current.src = url;
          videoRef.current.addEventListener('loadedmetadata', () => {
            if (autoPlay) videoRef.current?.play();
            setIsLoading(false);
          });
        } else {
          setError('HLS playback is not supported in this browser');
        }
      } else {
        // Direct video stream
        videoRef.current.src = url;
        if (autoPlay) videoRef.current.play();
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error initializing video player:', err);
      setError('Failed to initialize video player');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    initializePlayer();
  };

  useEffect(() => {
    initializePlayer();

    return () => {
      destroyHls();
    };
  }, [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = (e: ErrorEvent) => {
      console.error('Video error:', e);
      setError('Error playing video: ' + (e.message || 'Unknown error'));
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

    video.addEventListener('error', handleError as any);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('error', handleError as any);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  return (
    <div className="video-player-container">
      <video
        ref={videoRef}
        className="video-player"
        controls
        playsInline
        title={title}
      />
      
      {isLoading && !error && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <div className="loading-text">Loading video...</div>
        </div>
      )}

      {error && (
        <div className="error-overlay">
          <div className="error-message">{error}</div>
          <button className="retry-button" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;