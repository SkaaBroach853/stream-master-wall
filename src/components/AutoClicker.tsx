import { useState, useRef, useCallback } from 'react';
import { MousePointer2, Play, Square, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AutoClicker() {
  const [isRunning, setIsRunning] = useState(false);
  const [clickCount, setClickCount] = useState(10);
  const [interval, setIntervalTime] = useState(1000);
  const [totalClicks, setTotalClicks] = useState(0);
  const [currentClicks, setCurrentClicks] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clicksRemaining = useRef(0);

  const simulateClick = useCallback(() => {
    // Simulate clicking on video panels to trigger views
    const panels = document.querySelectorAll('.video-panel iframe');
    panels.forEach((panel) => {
      // Trigger focus events to simulate interaction
      panel.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    
    setTotalClicks((prev) => prev + 1);
    setCurrentClicks((prev) => prev + 1);
    clicksRemaining.current -= 1;

    if (clicksRemaining.current <= 0) {
      stopClicking();
    }
  }, []);

  const startClicking = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentClicks(0);
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
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 mt-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <MousePointer2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Auto Clicker</h3>
      </div>

      <div className="space-y-4">
        {/* Settings */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="clickCount" className="text-xs text-muted-foreground">
              Number of Clicks
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
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Simulates clicks on video panels to boost engagement
        </p>
      </div>
    </div>
  );
}
