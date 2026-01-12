import { useEffect, useRef, useState } from 'react';
import { getFacebookEmbedUrl } from '@/utils/facebook';

interface VideoPanelProps {
  url: string;
  index: number;
  isMuted: boolean;
  isVisible: boolean;
}

export function VideoPanel({ url, index, isMuted, isVisible }: VideoPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  
  // Force autoplay by adding all necessary parameters
  const embedUrl = getFacebookEmbedUrl(url);

  // Reset and reload when visibility changes to force autoplay
  useEffect(() => {
    if (isVisible) {
      setIframeKey(prev => prev + 1);
      setIsLoaded(false);
    }
  }, [isVisible]);

  useEffect(() => {
    setIsLoaded(false);
    setIframeKey(prev => prev + 1);
  }, [url]);

  return (
    <div className="video-panel aspect-video bg-muted/30 relative group min-h-[200px]">
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground font-mono">Panel {index + 1}</span>
          </div>
        </div>
      )}
      
      {/* Panel number indicator */}
      <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-background/80 text-xs font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        #{index + 1}
      </div>
      
      {isVisible && (
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}
