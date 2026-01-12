import { useState, useRef, useCallback, useEffect } from 'react';
import { MousePointer2, Play, Square, Target, RefreshCw, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type ClickTarget = 'video-panels' | 'play-buttons' | 'custom';

interface ClickPosition {
  x: number;
  y: number;
  element?: Element;
}

export function AutoClicker() {
  const [isRunning, setIsRunning] = useState(false);
  const [clickCount, setClickCount] = useState(10);
  const [interval, setIntervalTime] = useState(1000);
  const [totalClicks, setTotalClicks] = useState(0);
  const [currentClicks, setCurrentClicks] = useState(0);
  const [clickTarget, setClickTarget] = useState<ClickTarget>('video-panels');
  const [customPositions, setCustomPositions] = useState<ClickPosition[]>([]);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clicksRemaining = useRef(0);
  const panelIndexRef = useRef(0);

  // Handle picking location on screen
  useEffect(() => {
    if (!isPickingLocation) return;

    const handlePickClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as Element;
      const rect = target.getBoundingClientRect();
      
      const position: ClickPosition = {
        x: e.clientX,
        y: e.clientY,
        element: target
      };
      
      setCustomPositions(prev => [...prev, position]);
      toast.success(`Location #${customPositions.length + 1} saved at (${Math.round(e.clientX)}, ${Math.round(e.clientY)})`);
      
      // Add visual marker
      const marker = document.createElement('div');
      marker.className = 'click-marker';
      marker.style.cssText = `
        position: fixed;
        left: ${e.clientX - 8}px;
        top: ${e.clientY - 8}px;
        width: 16px;
        height: 16px;
        border: 2px solid hsl(var(--primary));
        border-radius: 50%;
        background: hsl(var(--primary) / 0.3);
        pointer-events: none;
        z-index: 10000;
        animation: pulse 1s infinite;
      `;
      marker.setAttribute('data-marker-index', String(customPositions.length));
      document.body.appendChild(marker);
      
      setIsPickingLocation(false);
      document.body.style.cursor = 'default';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPickingLocation(false);
        document.body.style.cursor = 'default';
        toast.info('Location picking cancelled');
      }
    };

    document.body.style.cursor = 'crosshair';
    document.addEventListener('click', handlePickClick, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handlePickClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = 'default';
    };
  }, [isPickingLocation, customPositions.length]);

  // Add pulse animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
      }
      @keyframes clickRipple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const simulateHumanClick = useCallback((x: number, y: number, element?: Element) => {
    const targetElement = element || document.elementFromPoint(x, y);
    
    if (!targetElement) {
      console.log('No element at position:', x, y);
      return;
    }

    // Create ripple effect at click position
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      left: ${x - 10}px;
      top: ${y - 10}px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: hsl(var(--primary) / 0.5);
      pointer-events: none;
      z-index: 10001;
      animation: clickRipple 0.4s ease-out forwards;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);

    // Simulate realistic mouse event sequence like a human
    const rect = targetElement.getBoundingClientRect();
    const clientX = x;
    const clientY = y;
    const screenX = window.screenX + x;
    const screenY = window.screenY + y;

    const commonProps = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX,
      clientY,
      screenX,
      screenY,
      button: 0,
      buttons: 1,
    };

    // Mouse enter and move first (like human approaching)
    targetElement.dispatchEvent(new MouseEvent('mouseenter', { ...commonProps, bubbles: false }));
    targetElement.dispatchEvent(new MouseEvent('mouseover', commonProps));
    targetElement.dispatchEvent(new MouseEvent('mousemove', commonProps));

    // Small delay then mousedown
    setTimeout(() => {
      targetElement.dispatchEvent(new MouseEvent('mousedown', commonProps));
      
      // Focus if focusable
      if (targetElement instanceof HTMLElement && targetElement.focus) {
        targetElement.focus();
      }

      // Mouseup after short delay (simulating finger lift)
      setTimeout(() => {
        targetElement.dispatchEvent(new MouseEvent('mouseup', commonProps));
        targetElement.dispatchEvent(new MouseEvent('click', commonProps));
        
        // For iframes, try to interact with content
        if (targetElement instanceof HTMLIFrameElement) {
          try {
            targetElement.contentWindow?.focus();
          } catch (e) {
            // Cross-origin restriction, expected
          }
        }
      }, 50 + Math.random() * 30); // Random delay 50-80ms
    }, 20 + Math.random() * 20); // Random delay 20-40ms

  }, []);

  const getTargetElements = useCallback(() => {
    switch (clickTarget) {
      case 'video-panels':
        return document.querySelectorAll('.video-panel iframe');
      case 'play-buttons':
        return document.querySelectorAll('.video-panel');
      case 'custom':
        return null; // Will use customPositions instead
      default:
        return document.querySelectorAll('.video-panel iframe');
    }
  }, [clickTarget]);

  const simulateClick = useCallback(() => {
    if (clickTarget === 'custom') {
      if (customPositions.length === 0) {
        toast.error('No locations selected! Pick locations first.');
        stopClicking();
        return;
      }
      
      const position = customPositions[panelIndexRef.current % customPositions.length];
      simulateHumanClick(position.x, position.y, position.element);
      
      panelIndexRef.current = (panelIndexRef.current + 1) % customPositions.length;
      setCurrentPanelIndex(panelIndexRef.current);
    } else {
      const panels = getTargetElements();
      
      if (!panels || panels.length === 0) {
        console.log('No elements found');
        return;
      }

      const currentPanel = panels[panelIndexRef.current % panels.length];
      
      if (currentPanel) {
        const rect = currentPanel.getBoundingClientRect();
        // Click in center of element
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        simulateHumanClick(x, y, currentPanel);
      }

      panelIndexRef.current = (panelIndexRef.current + 1) % panels.length;
      setCurrentPanelIndex(panelIndexRef.current);
    }
    
    setTotalClicks((prev) => prev + 1);
    setCurrentClicks((prev) => prev + 1);
    clicksRemaining.current -= 1;

    if (clicksRemaining.current <= 0) {
      stopClicking();
    }
  }, [clickTarget, customPositions, getTargetElements, simulateHumanClick]);

  const startClicking = () => {
    if (isRunning) return;
    
    if (clickTarget === 'custom' && customPositions.length === 0) {
      toast.error('Please pick at least one location first!');
      return;
    }
    
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

  const clearLocations = () => {
    setCustomPositions([]);
    // Remove all markers
    document.querySelectorAll('.click-marker').forEach(el => el.remove());
    toast.success('All locations cleared');
  };

  const getElementCount = () => {
    if (clickTarget === 'custom') {
      return customPositions.length;
    }
    const elements = getTargetElements();
    return elements?.length || 0;
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
              <SelectItem value="custom">Custom Location (Pick on Screen)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Location Picker */}
        {clickTarget === 'custom' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={() => setIsPickingLocation(true)}
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                disabled={isRunning || isPickingLocation}
              >
                <Crosshair className="w-4 h-4" />
                {isPickingLocation ? 'Click anywhere...' : 'Pick Location'}
              </Button>
              <Button
                onClick={clearLocations}
                variant="ghost"
                size="sm"
                disabled={isRunning || customPositions.length === 0}
              >
                Clear All
              </Button>
            </div>
            {isPickingLocation && (
              <p className="text-xs text-primary animate-pulse">
                👆 Click anywhere on screen to set location (ESC to cancel)
              </p>
            )}
            {customPositions.length > 0 && (
              <div className="bg-secondary/50 rounded-lg p-2 space-y-1">
                <p className="text-xs text-muted-foreground">Saved locations:</p>
                {customPositions.map((pos, i) => (
                  <div key={i} className="text-xs font-mono text-primary">
                    #{i + 1}: ({Math.round(pos.x)}, {Math.round(pos.y)})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Element Count Display */}
        <div className="bg-secondary/50 rounded-lg px-3 py-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {clickTarget === 'custom' ? 'Locations Saved:' : 'Elements Found:'}
            </span>
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
            <span className="text-muted-foreground">Current Target:</span>
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
              disabled={clickTarget === 'custom' && customPositions.length === 0}
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
          Human-like clicks with ripple effect • Sequential order (1 → 2 → 3...)
        </p>
      </div>
    </div>
  );
}
