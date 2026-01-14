import { useState, useRef, useCallback, useEffect } from 'react';
import { MousePointer2, Play, Square, RefreshCw, Zap, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export function AutoClicker() {
  const [isRunning, setIsRunning] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(true);
  const [interval, setIntervalTime] = useState(500);
  const [totalClicks, setTotalClicks] = useState(0);
  const [currentClicks, setCurrentClicks] = useState(0);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [panelCount, setPanelCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const panelIndexRef = useRef(0);
  const cycleRef = useRef(0);

  // Add ripple animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'auto-clicker-style';
    style.textContent = `
      @keyframes clickRipple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
      }
    `;
    if (!document.getElementById('auto-clicker-style')) {
      document.head.appendChild(style);
    }
    return () => {
      const existing = document.getElementById('auto-clicker-style');
      if (existing) existing.remove();
    };
  }, []);

  // Update panel count
  useEffect(() => {
    const updateCount = () => {
      const panels = document.querySelectorAll('.video-panel');
      setPanelCount(panels.length);
    };
    updateCount();
    const timer = setInterval(updateCount, 1000);
    return () => clearInterval(timer);
  }, []);

  // Refresh all panels by clicking their reload buttons
  const refreshAllPanels = useCallback(() => {
    const panels = document.querySelectorAll('.video-panel');
    console.log(`Refreshing ${panels.length} panels...`);
    
    panels.forEach((panel, index) => {
      // Find the reload button in this panel
      const reloadBtn = panel.querySelector('button[title="Reload video"]') as HTMLButtonElement;
      if (reloadBtn) {
        // Stagger the refreshes slightly
        setTimeout(() => {
          reloadBtn.click();
          console.log(`Refreshed panel ${index + 1}`);
        }, index * 100);
      }
    });
    
    return panels.length;
  }, []);

  // Click the center of a panel's iframe
  const clickPanelCenter = useCallback((panel: Element, index: number) => {
    const iframe = panel.querySelector('iframe');
    if (!iframe) {
      console.log(`No iframe in panel ${index + 1}`);
      return;
    }

    const rect = iframe.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create visual ripple at center
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
      animation: clickRipple 0.5s ease-out forwards;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

    // Focus the iframe
    iframe.focus();

    // Try to send play commands via postMessage
    try {
      iframe.contentWindow?.postMessage({ action: 'play' }, '*');
      iframe.contentWindow?.postMessage({ event: 'command', func: 'playVideo' }, '*');
      iframe.contentWindow?.postMessage('play', '*');
    } catch (e) {
      // Cross-origin expected
    }

    // Dispatch click events on the iframe
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: centerX,
      clientY: centerY,
    });
    iframe.dispatchEvent(clickEvent);

    // Also try clicking any play overlay that might exist
    const playOverlay = panel.querySelector('button.absolute.inset-0') as HTMLButtonElement;
    if (playOverlay) {
      playOverlay.click();
    }

    // Try the force play button
    const playBtn = panel.querySelector('button[title="Force play"]') as HTMLButtonElement;
    if (playBtn) {
      playBtn.click();
    }

    console.log(`Clicked center of panel ${index + 1} at (${Math.round(centerX)}, ${Math.round(centerY)})`);
  }, []);

  // Main click function - clicks one panel at a time, cycles through all
  const performClick = useCallback(() => {
    const panels = document.querySelectorAll('.video-panel');
    
    if (panels.length === 0) {
      console.log('No panels found');
      return;
    }

    // Get current panel index
    const currentIndex = panelIndexRef.current % panels.length;
    const panel = panels[currentIndex];

    // Click the center of this panel
    clickPanelCenter(panel, currentIndex);

    // Update stats
    setTotalClicks(prev => prev + 1);
    setCurrentClicks(prev => prev + 1);
    setCurrentPanelIndex(currentIndex);

    // Move to next panel
    panelIndexRef.current = (panelIndexRef.current + 1) % panels.length;

    // Check if we completed a full cycle
    if (panelIndexRef.current === 0) {
      cycleRef.current += 1;
      console.log(`Completed cycle ${cycleRef.current}`);
      
      // Refresh all panels every 3 cycles to keep videos playing
      if (cycleRef.current % 3 === 0) {
        console.log('Refreshing all panels after 3 cycles...');
        setTimeout(() => {
          refreshAllPanels();
        }, 500);
      }
    }
  }, [clickPanelCenter, refreshAllPanels]);

  const startClicking = useCallback(() => {
    if (isRunning) return;
    
    const panels = document.querySelectorAll('.video-panel');
    if (panels.length === 0) {
      toast.error('No video panels found!');
      return;
    }

    setIsRunning(true);
    setCurrentClicks(0);
    panelIndexRef.current = 0;
    cycleRef.current = 0;
    setCurrentPanelIndex(0);

    // First, refresh all panels
    toast.success('Refreshing all panels first...');
    refreshAllPanels();

    // Wait for refresh, then start clicking
    setTimeout(() => {
      toast.success(`Auto-clicker started! Clicking ${panels.length} panels`);
      
      // Start clicking after panels have refreshed
      performClick();
      
      intervalRef.current = setInterval(() => {
        performClick();
      }, interval);
    }, panels.length * 150 + 1000); // Wait for all refreshes + 1 second buffer

  }, [isRunning, interval, performClick, refreshAllPanels]);

  const stopClicking = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    toast.info('Auto-clicker stopped');
  }, []);

  const resetStats = () => {
    setTotalClicks(0);
    setCurrentClicks(0);
    panelIndexRef.current = 0;
    setCurrentPanelIndex(0);
    cycleRef.current = 0;
  };

  const manualRefreshAll = () => {
    const count = refreshAllPanels();
    toast.success(`Refreshed ${count} panels`);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 mt-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <MousePointer2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Auto Clicker</h3>
        {isRunning && (
          <span className="ml-auto flex items-center gap-1 text-xs text-primary animate-pulse">
            <Zap className="w-3 h-3" />
            Running
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Continuous Mode Toggle */}
        <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-primary" />
            <Label className="text-sm font-medium">Continuous Mode</Label>
          </div>
          <Switch
            checked={isContinuousMode}
            onCheckedChange={setIsContinuousMode}
            disabled={isRunning}
          />
        </div>

        {/* Panel Count Display */}
        <div className="bg-secondary/50 rounded-lg px-3 py-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Video Panels Found:</span>
            <span className="font-mono text-primary">{panelCount}</span>
          </div>
        </div>

        {/* Interval Setting */}
        <div className="space-y-1.5">
          <Label htmlFor="interval" className="text-xs text-muted-foreground">
            Interval (ms) - time between clicks
          </Label>
          <Input
            id="interval"
            type="number"
            min={200}
            max={10000}
            step={100}
            value={interval}
            onChange={(e) => setIntervalTime(Math.max(200, parseInt(e.target.value) || 200))}
            disabled={isRunning}
            className="h-9 font-mono"
          />
        </div>

        {/* Stats */}
        <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Current Session Clicks:</span>
            <span className="font-mono text-primary">{currentClicks}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Current Panel:</span>
            <span className="font-mono text-primary">#{currentPanelIndex + 1} of {panelCount}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Total Clicks:</span>
            <span className="font-mono text-primary">{totalClicks}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Cycles Completed:</span>
            <span className="font-mono text-primary">{cycleRef.current}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={isRunning ? stopClicking : startClicking}
            variant={isRunning ? 'destructive' : 'default'}
            className="flex-1 gap-2"
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Auto-Play
              </>
            )}
          </Button>
          <Button
            onClick={manualRefreshAll}
            variant="outline"
            size="icon"
            disabled={isRunning}
            title="Refresh all panels"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center">
          ⚡ Refreshes all panels, then clicks center of each to play videos
        </p>
      </div>
    </div>
  );
}
