import { useState } from 'react';
import { getEmbedUrl, detectVideoSource } from '@/utils/video';

interface SimpleVideoPanelProps {
  url: string;
  index: number;
}

export function SimpleVideoPanel({ url, index }: SimpleVideoPanelProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const source = detectVideoSource(url);
  
  // Generate embed URL based on source
  const getDirectEmbedUrl = () => {
    if (source === 'instagram') {
      // Clean and normalize Instagram URL for iframe embed
      const cleanUrl = url.split('?')[0];
      const normalizedUrl = cleanUrl.endsWith('/') ? cleanUrl : `${cleanUrl}/`;
      return `${normalizedUrl}embed/`;
    }
    // For YouTube/Facebook, use the standard embed URL
    const baseEmbedUrl = getEmbedUrl(url);
    const uniqueTimestamp = Date.now();
    return `${baseEmbedUrl}&_t=${uniqueTimestamp}&_i=${index}`;
  };

  const embedUrl = getDirectEmbedUrl();

  return (
    <div className={`${source === 'instagram' ? 'min-h-[500px]' : 'aspect-video'} bg-muted/30 relative rounded-lg overflow-hidden border border-border`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className="absolute top-1 left-1 z-10 bg-background/80 px-1.5 py-0.5 rounded text-xs font-mono text-muted-foreground">
        #{index + 1}
      </div>
      
      <iframe
        src={embedUrl}
        className="w-full h-full"
        style={{ border: 'none', overflow: 'hidden', minHeight: source === 'instagram' ? '500px' : undefined }}
        scrolling="no"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
        onLoad={() => setIsLoaded(true)}
        allowFullScreen
      />
    </div>
  );
}
