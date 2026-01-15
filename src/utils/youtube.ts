export function isValidYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes('youtube.com') ||
      urlObj.hostname.includes('youtu.be') ||
      urlObj.hostname.includes('youtube-nocookie.com')
    );
  } catch {
    return false;
  }
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be/VIDEO_ID
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1).split('?')[0];
    }
    
    // Handle youtube.com/watch?v=VIDEO_ID
    const vParam = urlObj.searchParams.get('v');
    if (vParam) return vParam;
    
    // Handle youtube.com/embed/VIDEO_ID
    // Handle youtube.com/shorts/VIDEO_ID
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && ['embed', 'shorts', 'v'].includes(pathParts[0])) {
      return pathParts[1];
    }
    
    return null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return url;
  
  // Use youtube-nocookie for privacy and better autoplay
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0`;
}
