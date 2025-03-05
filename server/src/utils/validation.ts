import { URL } from 'url';

export const sanitizeInput = (url: string): string => {
  if (!url) throw new Error('URL is required');
  return url.toString().trim().toLowerCase().replace(/\/+$/, '');
};

export const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};