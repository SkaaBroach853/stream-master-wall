import { useEffect, useRef, useState, useCallback } from 'react';
import { getEmbedUrl, detectVideoSource } from '@/utils/video';
import { RefreshCw, Play } from 'lucide-react';

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
  const [needsPlay, setNeedsPlay] = useState(true);
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const source = detectVideoSource(url);
  const baseEmbedUrl = getEmbedUrl(url);
  const uniqueTimestamp = Date.now();
  
  // Add unique parameters to force fresh load
  const embedUrl = `${baseEmbedUrl}&_t=${uniqueTimestamp}&_i=${index}&_u=${uniqueId}`;

  const reloadIframe = useCallback(() => {
    setIframeKey(prev => prev + 1);
    setIsLoaded(false);
    setShowRetry(false);
    setNeedsPlay(true);
  }, []);

  // Simulate click on iframe container to trigger play
  const triggerPlay = useCallback(() => {
    if (!containerRef.current || !iframeRef.current) return;
    
    const iframe = iframeRef.current;
    const rect = iframe.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create visual feedback
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      left: ${centerX - 15}px;
      top: ${centerY - 15}px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: hsl(var(--primary) / 0.6);
      pointer-events: none;
      z-index: 10001;
      animation: playRipple 0.6s ease-out forwards;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    // Try to send play message to iframe (works for some embeds)
    try {
      iframe.contentWindow?.postMessage({ action: 'play' }, '*');
      iframe.contentWindow?.postMessage({ event: 'command', func: 'playVideo' }, '*');
      iframe.contentWindow?.postMessage('play', '*');
    } catch (e) {
      // Cross-origin, expected
    }

    // Focus the iframe to help with autoplay
    iframe.focus();
    
    setNeedsPlay(false);
  }, []);

  // Auto-trigger play attempts periodically
  useEffect(() => {
    if (isVisible && isLoaded) {
      // Initial play trigger
      const initialTrigger = setTimeout(() => {
        triggerPlay();
      }, 1000);

      // Keep trying to play every 5 seconds
      autoPlayIntervalRef.current = setInterval(() => {
        triggerPlay();
      }, 5000);

      return () => {
        clearTimeout(initialTrigger);
        if (autoPlayIntervalRef.current) {
          clearInterval(autoPlayIntervalRef.current);
        }
      };
    }
  }, [isVisible, isLoaded, triggerPlay]);

  // Auto-reload every 45 seconds to keep videos fresh and playing
  useEffect(() => {
    if (isVisible && isLoaded) {
      retryIntervalRef.current = setInterval(() => {
        // Reload to restart video
        reloadIframe();
      }, 45000);
    }

    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
    };
  }, [isVisible, isLoaded, reloadIframe]);

  // Detect if video failed to load after timeout
  useEffect(() => {
    if (isVisible && !isLoaded) {
      loadTimeoutRef.current = setTimeout(() => {
        if (!isLoaded) {
          setShowRetry(true);
        }
      }, 8000);
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
      }, 2000);
      return () => clearTimeout(autoRetry);
    }
  }, [showRetry, reloadIframe]);

  useEffect(() => {
    if (isVisible) {
      setIframeKey(prev => prev + 1);
      setIsLoaded(false);
      setShowRetry(false);
      setNeedsPlay(true);
    }
  }, [isVisible]);

  useEffect(() => {
    setIsLoaded(false);
    setIframeKey(prev => prev + 1);
    setShowRetry(false);
    setNeedsPlay(true);
  }, [url]);

  // Add play ripple animation
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'play-ripple-style';
    if (!document.getElementById('play-ripple-style')) {
      style.textContent = `
        @keyframes playRipple {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const existing = document.getElementById('play-ripple-style');
      if (existing) existing.remove();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setShowRetry(false);
    // Trigger play after a short delay
    setTimeout(() => {
      triggerPlay();
    }, 500);
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
      
      {/* Control buttons - always visible for auto-clicker */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button 
          onClick={triggerPlay}
          className="bg-primary/90 p-1.5 rounded hover:bg-primary transition-colors opacity-70 group-hover:opacity-100"
          title="Force play"
        >
          <Play className="w-3 h-3 text-primary-foreground" />
        </button>
        <button 
          onClick={reloadIframe}
          className="reload-btn bg-background/80 p-1.5 rounded hover:bg-primary/20 transition-colors opacity-70 group-hover:opacity-100"
          title="Reload video"
        >
          <RefreshCw className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      {/* Play overlay for videos that need interaction */}
      {isLoaded && needsPlay && (
        <button
          onClick={triggerPlay}
          className="absolute inset-0 z-5 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-6 h-6 text-primary-foreground ml-1" />
          </div>
        </button>
      )}
      
      {isVisible && (
        <iframe
          key={`${iframeKey}-${uniqueId}-${index}`}
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
          onLoad={handleLoad}
          allowFullScreen
        />
      )}
    </div>
  );
}