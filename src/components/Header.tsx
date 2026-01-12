import { Monitor, Tv } from 'lucide-react';

interface HeaderProps {
  totalPanels: number;
  activeGroups: number;
}

export function Header({ totalPanels, activeGroups }: HeaderProps) {
  return (
    <header className="bg-card/50 backdrop-blur-xl border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-primary to-accent p-3 rounded-xl">
                <Tv className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">
                Facebook Stream Wall
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Video Control Room
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-primary">{totalPanels}</p>
              <p className="text-xs text-muted-foreground">Active Panels</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-bold font-mono text-foreground">{activeGroups}</p>
              <p className="text-xs text-muted-foreground">Video Groups</p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg">
              <Monitor className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono text-muted-foreground">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
