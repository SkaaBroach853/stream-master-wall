import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPanel } from './VideoPanel';
import type { VideoGroup as VideoGroupType } from '@/types/video';

interface VideoGroupProps {
  group: VideoGroupType;
  onRemove: (id: string) => void;
  onToggleMute: (id: string) => void;
}

export function VideoGroup({ group, onRemove, onToggleMute }: VideoGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const truncatedUrl = group.url.length > 60 
    ? `${group.url.substring(0, 60)}...` 
    : group.url;

  return (
    <div 
      ref={containerRef}
      className="slide-in bg-card rounded-xl border border-border p-4 panel-glow"
    >
      {/* Group Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-2 h-2 rounded-full bg-primary pulse-ring" />
          <a 
            href={group.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-mono text-muted-foreground hover:text-primary truncate flex items-center gap-2 transition-colors"
            title={group.url}
          >
            {truncatedUrl}
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="control" 
            size="sm"
            onClick={() => onToggleMute(group.id)}
          >
            {group.isMuted ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Unmute All</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Mute All</span>
              </>
            )}
          </Button>
          
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => onRemove(group.id)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Remove</span>
          </Button>
        </div>
      </div>
      
      {/* 5x2 Video Grid (10 panels) - Compact fit */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <VideoPanel 
            key={`${group.id}-${index}`}
            url={group.url}
            index={index}
            isMuted={group.isMuted}
            isVisible={isVisible}
            uniqueId={`${group.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
          />
        ))}
      </div>
      
      {/* View counter and status */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="font-mono text-muted-foreground">10 panels active</span>
          <span className="flex items-center gap-1.5 text-primary font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            ~{isVisible ? '10' : '0'} views/cycle
          </span>
        </div>
        <span className={`flex items-center gap-1.5 ${isVisible ? 'text-primary' : 'text-muted-foreground'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isVisible ? 'bg-primary' : 'bg-muted-foreground'}`} />
          {isVisible ? 'Playing' : 'Paused'}
        </span>
      </div>
    </div>
  );
}
