import { useEffect, useRef, useState } from 'react';
import { getFacebookEmbedUrl } from '@/utils/facebook';

interface VideoPanelProps {
  url: string;
  index: number;
  isMuted: boolean;
  isVisible: boolean;
  uniqueId: string;
}

export function VideoPanel({ url, index, isMuted, isVisible, uniqueId }: VideoPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  
  // Add unique parameters to make each panel count as a separate view
  const baseEmbedUrl = getFacebookEmbedUrl(url);
  const uniqueTimestamp = Date.now();
  const embedUrl = `${baseEmbedUrl}&_t=${uniqueTimestamp}&_i=${index}&_u=${uniqueId}`;

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
    <div className="video-panel aspect-video bg-muted/30 relative group">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className="absolute top-2 left-2 z-10 bg-background/80 px-2 py-1 rounded text-xs font-mono text-muted-foreground">
        #{index + 1}
      </div>
      
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
          onLoad={() => setIsLoaded(true)}
          allowFullScreen
        />
      )}
    </div>
  );
}
