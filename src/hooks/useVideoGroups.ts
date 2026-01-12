import { useState, useCallback, useEffect, useRef } from 'react';
import { generateId } from '@/utils/facebook';
import type { VideoGroup, QueueItem } from '@/types/video';

export function useVideoGroups() {
  const [groups, setGroups] = useState<VideoGroup[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isRotating, setIsRotating] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [rotationInterval, setRotationInterval] = useState(10);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [playedIndices, setPlayedIndices] = useState<number[]>([]);
  
  const rotationRef = useRef<NodeJS.Timeout | null>(null);

  const createPanels = useCallback((url: string) => {
    const newGroup: VideoGroup = {
      id: generateId(),
      url,
      isMuted: true,
      createdAt: Date.now(),
    };
    setGroups(prev => [newGroup, ...prev]);
  }, []);

  const removeGroup = useCallback((id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  const toggleMuteGroup = useCallback((id: string) => {
    setGroups(prev => prev.map(g => 
      g.id === id ? { ...g, isMuted: !g.isMuted } : g
    ));
  }, []);

  const addToQueue = useCallback((url: string) => {
    const newItem: QueueItem = {
      id: generateId(),
      url,
    };
    setQueue(prev => [...prev, newItem]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  }, []);

  const getNextIndex = useCallback(() => {
    if (queue.length === 0) return -1;
    
    if (shuffleEnabled) {
      // If all videos have been played, reset
      if (playedIndices.length >= queue.length) {
        setPlayedIndices([]);
        // Pick random from full list
        return Math.floor(Math.random() * queue.length);
      }
      
      // Pick random from unplayed
      const unplayedIndices = Array.from({ length: queue.length }, (_, i) => i)
        .filter(i => !playedIndices.includes(i));
      const randomIndex = Math.floor(Math.random() * unplayedIndices.length);
      return unplayedIndices[randomIndex];
    }
    
    // Sequential mode
    return (currentQueueIndex + 1) % queue.length;
  }, [queue.length, shuffleEnabled, playedIndices, currentQueueIndex]);

  const rotateToNext = useCallback(() => {
    if (queue.length === 0) return;
    
    const nextIndex = getNextIndex();
    if (nextIndex === -1) return;
    
    const nextUrl = queue[nextIndex].url;
    
    // Replace all current groups with new one
    setGroups([{
      id: generateId(),
      url: nextUrl,
      isMuted: true,
      createdAt: Date.now(),
    }]);
    
    setCurrentQueueIndex(nextIndex);
    if (shuffleEnabled) {
      setPlayedIndices(prev => [...prev, nextIndex]);
    }
  }, [queue, getNextIndex, shuffleEnabled]);

  const startRotation = useCallback(() => {
    if (queue.length === 0) return;
    
    setIsRotating(true);
    setPlayedIndices([]);
    
    // Start with first item in queue
    if (queue.length > 0) {
      const startIndex = shuffleEnabled 
        ? Math.floor(Math.random() * queue.length) 
        : 0;
      
      setGroups([{
        id: generateId(),
        url: queue[startIndex].url,
        isMuted: true,
        createdAt: Date.now(),
      }]);
      
      setCurrentQueueIndex(startIndex);
      if (shuffleEnabled) {
        setPlayedIndices([startIndex]);
      }
    }
  }, [queue, shuffleEnabled]);

  const stopRotation = useCallback(() => {
    setIsRotating(false);
    if (rotationRef.current) {
      clearInterval(rotationRef.current);
      rotationRef.current = null;
    }
  }, []);

  // Rotation interval effect
  useEffect(() => {
    if (rotationRef.current) {
      clearInterval(rotationRef.current);
    }
    
    if (isRotating && queue.length > 0) {
      rotationRef.current = setInterval(rotateToNext, rotationInterval * 1000);
    }
    
    return () => {
      if (rotationRef.current) {
        clearInterval(rotationRef.current);
      }
    };
  }, [isRotating, rotationInterval, rotateToNext, queue.length]);

  // Stop rotation if queue becomes empty
  useEffect(() => {
    if (queue.length === 0 && isRotating) {
      stopRotation();
    }
  }, [queue.length, isRotating, stopRotation]);

  return {
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
    setShuffleEnabled: () => setShuffleEnabled(prev => !prev),
    setRotationInterval,
  };
}
