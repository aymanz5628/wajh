import qs from 'qs';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/$/, '');
const isDev = process.env.NODE_ENV === 'development';

export function getAPIURL(path = '') {
  return `${API_BASE}${path || ''}`;
}

export async function fetchAPI(
  path: string,
  urlParamsObject: Record<string, any> = {},
  options: RequestInit = {},
  retries = 2
): Promise<any> {
  const mergedOptions: RequestInit = {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...options,
  };

  const queryString = qs.stringify(urlParamsObject, { encodeValuesOnly: true, encode: false });
  const requestUrl = `${getAPIURL(`/api${path || ''}${queryString ? `?${queryString}` : ''}`)}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (isDev) console.log(`[Wajh API] Fetching: ${requestUrl} (attempt ${attempt + 1})`);
      const response = await fetch(requestUrl, mergedOptions);

      if (!response.ok) {
        console.error(`[Wajh API] Error ${response.status}`);
        if (attempt < retries && response.status >= 500) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (attempt < retries) {
        console.warn(`[Wajh API] Retry ${attempt + 1}/${retries}...`);
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      console.error(`[Wajh API] Error after ${retries + 1} attempts:`, error);
      return { data: [], meta: {} };
    }
  }
  return { data: [], meta: {} };
}

export function getMediaURL(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('//')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function extractImageUrl(imageField: any): string | null {
  if (!imageField) return null;
  if (typeof imageField === 'string') return getMediaURL(imageField);
  if (imageField.url) return getMediaURL(imageField.url);
  if (imageField.data?.attributes?.url) return getMediaURL(imageField.data.attributes.url);
  if (imageField.data?.url) return getMediaURL(imageField.data.url);
  if (Array.isArray(imageField) && imageField.length > 0) return extractImageUrl(imageField[0]);
  if (Array.isArray(imageField?.data) && imageField.data.length > 0) return extractImageUrl(imageField.data[0]);
  return null;
}
