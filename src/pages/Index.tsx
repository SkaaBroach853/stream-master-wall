import { useState } from 'react';
import { Header } from '@/components/Header';
import { SimpleVideoPanel } from '@/components/SimpleVideoPanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Grid3X3, Trash2 } from 'lucide-react';
import { isValidVideoUrl, detectVideoSource, getSourceLabel } from '@/utils/video';
import { toast } from 'sonner';

const Index = () => {
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');

  const handleCreatePanels = () => {
    if (!url.trim()) {
      toast.error('Please enter a Facebook or Instagram video URL');
      return;
    }
    if (!isValidVideoUrl(url)) {
      toast.error('Please enter a valid Facebook or Instagram video URL');
      return;
    }
    const detectedSource = detectVideoSource(url);
    setActiveUrl(url);
    setSource(getSourceLabel(detectedSource));
    setUrl('');
    toast.success(`Created 20 ${getSourceLabel(detectedSource)} video panels`);
  };

  const handleClear = () => {
    setActiveUrl(null);
    setSource('');
    toast.success('Cleared all panels');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreatePanels();
    }
  };

  const panels = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-background">
      <Header totalPanels={activeUrl ? 20 : 0} activeGroups={activeUrl ? 1 : 0} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Control Bar */}
        <div className="bg-card rounded-xl border border-border p-6 panel-glow mb-6">
          <div className="mb-4">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Video URL (Facebook / Instagram)
            </label>
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=... or https://facebook.com/... or https://instagram.com/reel/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="font-mono text-sm bg-input border-border focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Supports YouTube, Facebook videos, Reels, Watch links & Instagram posts, Reels, IGTV
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="glow" 
              size="lg" 
              onClick={handleCreatePanels}
            >
              <Grid3X3 className="w-5 h-5" />
              Create 20 Panels
            </Button>
            
            {activeUrl && (
              <Button 
                variant="destructive" 
                size="lg" 
                onClick={handleClear}
              >
                <Trash2 className="w-5 h-5" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Video Panels Grid */}
        {activeUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-primary/20 text-primary rounded font-medium">
                {source}
              </span>
              <span className="truncate max-w-md">{activeUrl}</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {panels.map((index) => (
                <SimpleVideoPanel
                  key={index}
                  url={activeUrl}
                  index={index}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <div className="text-6xl mb-4 opacity-50">🎬</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Video Panels Yet
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Paste a Facebook or Instagram video URL above and click "Create 20 Panels" to get started.
            </p>
          </div>
        )}
      </main>
      
      {/* Footer Status */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-sm">
            <span className="text-muted-foreground">
              <span className="text-primary font-mono">{activeUrl ? 20 : 0}</span> panels active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
