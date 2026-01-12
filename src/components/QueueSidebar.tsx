import { X, List, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QueueItem } from '@/types/video';

interface QueueSidebarProps {
  queue: QueueItem[];
  currentIndex: number;
  isRotating: boolean;
  onRemove: (id: string) => void;
}

export function QueueSidebar({ queue, currentIndex, isRotating, onRemove }: QueueSidebarProps) {
  if (queue.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 h-fit">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <List className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Queue</h3>
        </div>
        
        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-50">📋</div>
          <p className="text-sm text-muted-foreground">Queue is empty</p>
          <p className="text-xs text-muted-foreground mt-1">Add videos to enable rotation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 h-fit max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <List className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Queue</h3>
        <span className="ml-auto text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
          {queue.length} videos
        </span>
      </div>
      
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {queue.map((item, index) => {
          const isActive = isRotating && index === currentIndex;
          const truncatedUrl = item.url.length > 30 
            ? `${item.url.substring(0, 30)}...` 
            : item.url;
          
          return (
            <div 
              key={item.id}
              className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                isActive 
                  ? 'bg-primary/20 border border-primary/50' 
                  : 'bg-secondary/50 hover:bg-secondary'
              }`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-mono block truncate ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {truncatedUrl}
                </span>
                {isActive && (
                  <span className="text-[10px] text-primary flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Now Playing
                  </span>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 flex-shrink-0 hover:bg-destructive/20 hover:text-destructive"
                onClick={() => onRemove(item.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
