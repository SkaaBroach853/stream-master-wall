export function isValidInstagramUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes('instagram.com') ||
      urlObj.hostname.includes('instagr.am')
    );
  } catch {
    return false;
  }
}

export function extractInstagramVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Handle various Instagram URL formats:
    // instagram.com/p/ABC123/
    // instagram.com/reel/ABC123/
    // instagram.com/reels/ABC123/
    // instagram.com/tv/ABC123/
    
    if (pathParts.length >= 2) {
      const type = pathParts[0];
      if (['p', 'reel', 'reels', 'tv'].includes(type)) {
        return pathParts[1];
      }
    }
    
    return url;
  } catch {
    return null;
  }
}

export function getInstagramEmbedUrl(url: string): string {
  // Instagram embed URL format - requires captioned=false to hide caption
  // Clean URL first - remove query params
  const cleanUrl = url.split('?')[0];
  // Ensure URL ends with /
  const normalizedUrl = cleanUrl.endsWith('/') ? cleanUrl : `${cleanUrl}/`;
  return `${normalizedUrl}embed/captioned/?autoplay=1`;
}
