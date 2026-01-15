import { useState, useEffect, useRef } from 'react';
import { getEmbedUrl, detectVideoSource } from '@/utils/video';
import { extractInstagramVideoId } from '@/utils/instagram';

interface SimpleVideoPanelProps {
  url: string;
  index: number;
}

// Load Instagram embed script once
let instagramScriptLoaded = false;
function loadInstagramScript() {
  if (instagramScriptLoaded) return;
  if (document.getElementById('instagram-embed-script')) {
    instagramScriptLoaded = true;
    return;
  }
  
  const script = document.createElement('script');
  script.id = 'instagram-embed-script';
  script.src = 'https://www.instagram.com/embed.js';
  script.async = true;
  document.body.appendChild(script);
  instagramScriptLoaded = true;
}

export function SimpleVideoPanel({ url, index }: SimpleVideoPanelProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const source = detectVideoSource(url);
  
  // For YouTube/Facebook, use iframe embed
  const baseEmbedUrl = getEmbedUrl(url);
  const uniqueTimestamp = Date.now();
  const embedUrl = source === 'instagram' ? '' : `${baseEmbedUrl}&_t=${uniqueTimestamp}&_i=${index}`;

  // Handle Instagram embeds using their official script
  useEffect(() => {
    if (source === 'instagram') {
      loadInstagramScript();
      
      // Process Instagram embeds after script loads
      const processEmbed = () => {
        if ((window as any).instgrm?.Embeds?.process) {
          (window as any).instgrm.Embeds.process();
          setIsLoaded(true);
        }
      };
      
      // Try immediately and also after a delay
      processEmbed();
      const timer = setTimeout(processEmbed, 1000);
      const timer2 = setTimeout(processEmbed, 2000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }
  }, [source, url]);

  // Clean Instagram URL for embed
  const cleanInstagramUrl = url.split('?')[0];
  const normalizedInstagramUrl = cleanInstagramUrl.endsWith('/') ? cleanInstagramUrl : `${cleanInstagramUrl}/`;

  // Instagram uses blockquote-based embeds
  if (source === 'instagram') {
    return (
      <div 
        ref={containerRef}
        className="bg-muted/30 relative rounded-lg overflow-hidden border border-border min-h-[300px]"
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <div className="absolute top-1 left-1 z-20 bg-background/80 px-1.5 py-0.5 rounded text-xs font-mono text-muted-foreground">
          #{index + 1}
        </div>
        
        <blockquote
          className="instagram-media"
          data-instgrm-captioned
          data-instgrm-permalink={normalizedInstagramUrl}
          data-instgrm-version="14"
          style={{
            background: '#FFF',
            border: 0,
            borderRadius: '3px',
            boxShadow: 'none',
            margin: 0,
            maxWidth: '100%',
            minWidth: '100%',
            padding: 0,
            width: '100%',
          }}
        />
      </div>
    );
  }

  // YouTube and Facebook use iframe embeds
  return (
    <div className="aspect-video bg-muted/30 relative rounded-lg overflow-hidden border border-border">
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
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
        onLoad={() => setIsLoaded(true)}
        allowFullScreen
      />
    </div>
  );
}
