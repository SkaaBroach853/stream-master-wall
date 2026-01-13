import { isValidFacebookUrl, getFacebookEmbedUrl } from './facebook';
import { isValidInstagramUrl, getInstagramEmbedUrl } from './instagram';

export type VideoSource = 'facebook' | 'instagram' | 'unknown';

export function detectVideoSource(url: string): VideoSource {
  if (isValidFacebookUrl(url)) return 'facebook';
  if (isValidInstagramUrl(url)) return 'instagram';
  return 'unknown';
}

export function isValidVideoUrl(url: string): boolean {
  return isValidFacebookUrl(url) || isValidInstagramUrl(url);
}

export function getEmbedUrl(url: string): string {
  const source = detectVideoSource(url);
  
  switch (source) {
    case 'facebook':
      return getFacebookEmbedUrl(url);
    case 'instagram':
      return getInstagramEmbedUrl(url);
    default:
      return url;
  }
}

export function getSourceLabel(source: VideoSource): string {
  switch (source) {
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    default:
      return 'Unknown';
  }
}
