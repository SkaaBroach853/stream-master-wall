import { useEffect, useRef, useState, useCallback } from 'react';
import { getEmbedUrl, detectVideoSource } from '@/utils/video';
import { RefreshCw } from 'lucide-react';

interface VideoPanelProps {
  url: string;
  index: number;
  isMuted: boolean;
  isVisible: boolean;
  uniqueId: string;
}

export function VideoPanel({ url, index, isMuted, isVisible, uniqueId }: VideoPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const source = detectVideoSource(url);
  const baseEmbedUrl = getEmbedUrl(url);
  const uniqueTimestamp = Date.now();
  
  // Add unique parameters based on source
  const embedUrl = source === 'instagram' 
    ? `${baseEmbedUrl}&_t=${uniqueTimestamp}&_i=${index}&_u=${uniqueId}`
    : `${baseEmbedUrl}&_t=${uniqueTimestamp}&_i=${index}&_u=${uniqueId}`;

  const reloadIframe = useCallback(() => {
    setIframeKey(prev => prev + 1);
    setIsLoaded(false);
    setShowRetry(false);
  }, []);

  // Auto-reload every 30 seconds to keep videos playing (handles retry/ended states)
  useEffect(() => {
    if (isVisible && isLoaded) {
      retryIntervalRef.current = setInterval(() => {
        // For Instagram, reload more frequently to handle blocked embeds
        if (source === 'instagram') {
          reloadIframe();
        }
      }, 30000); // Every 30 seconds
    }

    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
    };
  }, [isVisible, isLoaded, source, reloadIframe]);

  // Detect if video failed to load after timeout
  useEffect(() => {
    if (isVisible && !isLoaded) {
      loadTimeoutRef.current = setTimeout(() => {
        if (!isLoaded) {
          setShowRetry(true);
        }
      }, 10000); // Show retry after 10 seconds of no load
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isVisible, isLoaded, iframeKey]);

  // Auto-retry when showing retry button
  useEffect(() => {
    if (showRetry) {
      const autoRetry = setTimeout(() => {
        reloadIframe();
      }, 3000); // Auto-retry after 3 seconds
      return () => clearTimeout(autoRetry);
    }
  }, [showRetry, reloadIframe]);

  useEffect(() => {
    if (isVisible) {
      setIframeKey(prev => prev + 1);
      setIsLoaded(false);
      setShowRetry(false);
    }
  }, [isVisible]);

  useEffect(() => {
    setIsLoaded(false);
    setIframeKey(prev => prev + 1);
    setShowRetry(false);
  }, [url]);

  const handleLoad = () => {
    setIsLoaded(true);
    setShowRetry(false);
  };

  return (
    <div ref={containerRef} className="video-panel aspect-video bg-muted/30 relative group">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {showRetry && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 z-10">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-2" />
          <span className="text-xs text-muted-foreground">Auto-retrying...</span>
        </div>
      )}
      
      <div className="absolute top-2 left-2 z-10 bg-background/80 px-2 py-1 rounded text-xs font-mono text-muted-foreground">
        #{index + 1}
      </div>
      
      <button 
        onClick={reloadIframe}
        className="absolute top-2 right-2 z-10 bg-background/80 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/20"
        title="Reload video"
      >
        <RefreshCw className="w-3 h-3 text-muted-foreground" />
      </button>
      
      {isVisible && (
        <iframe
          key={`${iframeKey}-${uniqueId}-${index}`}
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          onLoad={handleLoad}
          allowFullScreen
        />
      )}
    </div>
  );
}
