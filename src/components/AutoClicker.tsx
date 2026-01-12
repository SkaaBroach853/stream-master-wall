import { useState, useRef, useCallback } from 'react';
import { MousePointer2, Play, Square, Target, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ClickTarget = 'video-panels' | 'play-buttons' | 'custom';

export function AutoClicker() {
  const [isRunning, setIsRunning] = useState(false);
  const [clickCount, setClickCount] = useState(10);
  const [interval, setIntervalTime] = useState(1000);
  const [totalClicks, setTotalClicks] = useState(0);
  const [currentClicks, setCurrentClicks] = useState(0);
  const [clickTarget, setClickTarget] = useState<ClickTarget>('video-panels');
  const [customSelector, setCustomSelector] = useState('');
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clicksRemaining = useRef(0);
  const panelIndexRef = useRef(0);

  const getTargetSelector = useCallback(() => {
    switch (clickTarget) {
      case 'video-panels':
        return '.video-panel iframe';
      case 'play-buttons':
        return '.video-panel';
      case 'custom':
        return customSelector || '.video-panel';
      default:
        return '.video-panel iframe';
    }
  }, [clickTarget, customSelector]);

  const simulateClick = useCallback(() => {
    const selector = getTargetSelector();
    const panels = document.querySelectorAll(selector);
    
    if (panels.length === 0) {
      console.log('No elements found with selector:', selector);
      return;
    }

    // Get current panel in sequence
    const currentPanel = panels[panelIndexRef.current % panels.length];
    
    if (currentPanel) {
      // Simulate click events
      currentPanel.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      currentPanel.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      currentPanel.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      
      // Visual feedback - briefly highlight the clicked element
      if (currentPanel instanceof HTMLElement) {
        currentPanel.style.outline = '2px solid hsl(var(--primary))';
        currentPanel.style.outlineOffset = '2px';
        setTimeout(() => {
          currentPanel.style.outline = '';
          currentPanel.style.outlineOffset = '';
        }, 200);
      }
    }

    // Move to next panel in sequence
    panelIndexRef.current = (panelIndexRef.current + 1) % panels.length;
    setCurrentPanelIndex(panelIndexRef.current);
    
    setTotalClicks((prev) => prev + 1);
    setCurrentClicks((prev) => prev + 1);
    clicksRemaining.current -= 1;

    if (clicksRemaining.current <= 0) {
      stopClicking();
    }
  }, [getTargetSelector]);

  const startClicking = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentClicks(0);
    panelIndexRef.current = 0;
    setCurrentPanelIndex(0);
    clicksRemaining.current = clickCount;

    // Immediate first click
    simulateClick();

    // Set up interval for remaining clicks
    if (clickCount > 1) {
      intervalRef.current = setInterval(() => {
        simulateClick();
      }, interval);
    }
  };

  const stopClicking = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetStats = () => {
    setTotalClicks(0);
    setCurrentClicks(0);
    panelIndexRef.current = 0;
    setCurrentPanelIndex(0);
  };

  const getElementCount = () => {
    const selector = getTargetSelector();
    return document.querySelectorAll(selector).length;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 mt-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <MousePointer2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Auto Clicker</h3>
      </div>

      <div className="space-y-4">
        {/* Click Target Selection */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Target className="w-3 h-3" />
            Click Target
          </Label>
          <Select
            value={clickTarget}
            onValueChange={(value: ClickTarget) => setClickTarget(value)}
            disabled={isRunning}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video-panels">Video Panel iFrames</SelectItem>
              <SelectItem value="play-buttons">Video Panels (Container)</SelectItem>
              <SelectItem value="custom">Custom Selector</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Selector Input */}
        {clickTarget === 'custom' && (
          <div className="space-y-1.5">
            <Label htmlFor="customSelector" className="text-xs text-muted-foreground">
              CSS Selector
            </Label>
            <Input
              id="customSelector"
              type="text"
              placeholder=".my-class, #my-id"
              value={customSelector}
              onChange={(e) => setCustomSelector(e.target.value)}
              disabled={isRunning}
              className="h-9 font-mono text-xs"
            />
          </div>
        )}

        {/* Element Count Display */}
        <div className="bg-secondary/50 rounded-lg px-3 py-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Elements Found:</span>
            <span className="font-mono text-primary">{getElementCount()}</span>
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="clickCount" className="text-xs text-muted-foreground">
              Total Clicks
            </Label>
            <Input
              id="clickCount"
              type="number"
              min={1}
              max={1000}
              value={clickCount}
              onChange={(e) => setClickCount(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isRunning}
              className="h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interval" className="text-xs text-muted-foreground">
              Interval (ms)
            </Label>
            <Input
              id="interval"
              type="number"
              min={100}
              max={60000}
              step={100}
              value={interval}
              onChange={(e) => setIntervalTime(Math.max(100, parseInt(e.target.value) || 100))}
              disabled={isRunning}
              className="h-9 font-mono"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Current Session:</span>
            <span className="font-mono text-primary">{currentClicks}/{clickCount}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Current Panel:</span>
            <span className="font-mono text-primary">#{currentPanelIndex + 1}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Total Clicks:</span>
            <span className="font-mono text-primary">{totalClicks}</span>
          </div>
          {isRunning && (
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentClicks / clickCount) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={startClicking}
              className="flex-1 gap-2"
              variant="default"
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <Button
              onClick={stopClicking}
              className="flex-1 gap-2"
              variant="destructive"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          )}
          <Button
            onClick={resetStats}
            variant="outline"
            size="icon"
            disabled={isRunning}
            title="Reset Stats"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Clicks panels sequentially in order (1 → 2 → 3 → ...)
        </p>
      </div>
    </div>
  );
}