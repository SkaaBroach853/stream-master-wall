import { Header } from '@/components/Header';
import { ControlBar } from '@/components/ControlBar';
import { VideoGroup } from '@/components/VideoGroup';
import { QueueSidebar } from '@/components/QueueSidebar';
import { AutoClicker } from '@/components/AutoClicker';
import { useVideoGroups } from '@/hooks/useVideoGroups';

const Index = () => {
  const {
    groups,
    queue,
    isRotating,
    shuffleEnabled,
    rotationInterval,
    currentQueueIndex,
    createPanels,
    removeGroup,
    toggleMuteGroup,
    addToQueue,
    removeFromQueue,
    startRotation,
    stopRotation,
    setShuffleEnabled,
    setRotationInterval,
  } = useVideoGroups();

  const totalPanels = groups.length * 10;

  return (
    <div className="min-h-screen bg-background">
      <Header totalPanels={totalPanels} activeGroups={groups.length} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Control Bar */}
            <ControlBar
              onCreatePanels={createPanels}
              onAddToQueue={addToQueue}
              onStartRotation={startRotation}
              onStopRotation={stopRotation}
              isRotating={isRotating}
              shuffleEnabled={shuffleEnabled}
              onToggleShuffle={setShuffleEnabled}
              rotationInterval={rotationInterval}
              onSetRotationInterval={setRotationInterval}
            />
            
            {/* Video Groups */}
            {groups.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <div className="text-6xl mb-4 opacity-50">🎬</div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No Video Groups Yet
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Paste a Facebook video URL above and click "Create 10 Panels" to get started.
                  Each group will display 10 synchronized video players.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {groups.map((group) => (
                  <VideoGroup
                    key={group.id}
                    group={group}
                    onRemove={removeGroup}
                    onToggleMute={toggleMuteGroup}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Queue Sidebar */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-0">
              <QueueSidebar
                queue={queue}
                currentIndex={currentQueueIndex}
                isRotating={isRotating}
                onRemove={removeFromQueue}
              />
              <AutoClicker />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer Status */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                <span className="text-primary font-mono">{groups.length}</span> groups
              </span>
              <span className="text-muted-foreground">
                <span className="text-primary font-mono">{totalPanels}</span> panels
              </span>
              <span className="text-muted-foreground">
                <span className="text-primary font-mono">{queue.length}</span> queued
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${isRotating ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
              {isRotating ? 'Auto-rotating' : 'Manual mode'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
