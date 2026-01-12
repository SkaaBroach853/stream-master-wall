export function extractFacebookVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle various Facebook URL formats
    // facebook.com/video.php?v=123
    // facebook.com/watch?v=123
    // facebook.com/reel/123
    // facebook.com/username/videos/123
    // fb.watch/xyz
    
    if (urlObj.hostname.includes('fb.watch')) {
      return url; // Return full URL for fb.watch short links
    }
    
    const vParam = urlObj.searchParams.get('v');
    if (vParam) return vParam;
    
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Handle /reel/123 format
    if (pathParts[0] === 'reel' && pathParts[1]) {
      return pathParts[1];
    }
    
    // Handle /videos/123 or /username/videos/123 format
    const videosIndex = pathParts.indexOf('videos');
    if (videosIndex !== -1 && pathParts[videosIndex + 1]) {
      return pathParts[videosIndex + 1];
    }
    
    // Return the URL as-is for embedding
    return url;
  } catch {
    return null;
  }
}

export function getFacebookEmbedUrl(url: string): string {
  // Encode the URL for embedding
  const encodedUrl = encodeURIComponent(url);
  // autoplay=true, muted=true for autoplay to work, and loop to play infinitely
  return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&autoplay=true&muted=true&loop=true`;
}

export function isValidFacebookUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes('facebook.com') ||
      urlObj.hostname.includes('fb.com') ||
      urlObj.hostname.includes('fb.watch')
    );
  } catch {
    return false;
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
