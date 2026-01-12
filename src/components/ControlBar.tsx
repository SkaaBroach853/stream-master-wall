import { useState } from 'react';
import { Play, Pause, Shuffle, Grid3X3, Plus, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { isValidFacebookUrl } from '@/utils/facebook';
import { toast } from 'sonner';

interface ControlBarProps {
  onCreatePanels: (url: string) => void;
  onAddToQueue: (url: string) => void;
  onStartRotation: () => void;
  onStopRotation: () => void;
  isRotating: boolean;
  shuffleEnabled: boolean;
  onToggleShuffle: () => void;
  rotationInterval: number;
  onSetRotationInterval: (seconds: number) => void;
}

export function ControlBar({
  onCreatePanels,
  onAddToQueue,
  onStartRotation,
  onStopRotation,
  isRotating,
  shuffleEnabled,
  onToggleShuffle,
  rotationInterval,
  onSetRotationInterval,
}: ControlBarProps) {
  const [url, setUrl] = useState('');

  const handleCreatePanels = () => {
    if (!url.trim()) {
      toast.error('Please enter a Facebook video URL');
      return;
    }
    if (!isValidFacebookUrl(url)) {
      toast.error('Please enter a valid Facebook video URL');
      return;
    }
    onCreatePanels(url);
    setUrl('');
    toast.success('Created 10-panel video group with unique views');
  };

  const handleAddToQueue = () => {
    if (!url.trim()) {
      toast.error('Please enter a Facebook video URL');
      return;
    }
    if (!isValidFacebookUrl(url)) {
      toast.error('Please enter a valid Facebook video URL');
      return;
    }
    onAddToQueue(url);
    setUrl('');
    toast.success('Added to queue');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreatePanels();
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 panel-glow">
      {/* URL Input */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Facebook Video URL
        </label>
        <Input
          type="url"
          placeholder="https://www.facebook.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          className="font-mono text-sm bg-input border-border focus:border-primary transition-colors"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Supports Facebook videos, Reels, and Watch links
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button 
          variant="glow" 
          size="lg" 
          onClick={handleCreatePanels}
          className="flex-1 sm:flex-none"
        >
          <Grid3X3 className="w-5 h-5" />
          Create 10 Panels
        </Button>
        
        <Button 
          variant="control" 
          size="lg" 
          onClick={handleAddToQueue}
          className="flex-1 sm:flex-none"
        >
          <Plus className="w-5 h-5" />
          Add to Queue
        </Button>
        
        <Button 
          variant={isRotating ? "danger" : "control"} 
          size="lg" 
          onClick={isRotating ? onStopRotation : onStartRotation}
          className="flex-1 sm:flex-none"
        >
          {isRotating ? (
            <>
              <Pause className="w-5 h-5" />
              Stop Rotation
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Rotation
            </>
          )}
        </Button>
      </div>
      
      {/* Settings Row */}
      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border">
        {/* Rotation Interval */}
        <div className="flex items-center gap-3">
          <Timer className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Interval:</span>
          <select
            value={rotationInterval}
            onChange={(e) => onSetRotationInterval(Number(e.target.value))}
            className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
          >
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
            <option value={15}>15 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={120}>2 minutes</option>
          </select>
        </div>
        
        {/* Shuffle Toggle */}
        <div className="flex items-center gap-3">
          <Shuffle className={`w-4 h-4 ${shuffleEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="text-sm text-muted-foreground">Shuffle:</span>
          <Switch
            checked={shuffleEnabled}
            onCheckedChange={onToggleShuffle}
          />
        </div>
        
        {isRotating && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Auto-rotating</span>
          </div>
        )}
      </div>
    </div>
  );
}
