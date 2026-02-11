
export function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export type TimeOfDay = 'morning' | 'day' | 'sunset' | 'night';

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 16) return 'day';
  if (hour >= 16 && hour < 19) return 'sunset';
  return 'night';
}

export function generateCardDataUri(text: string, type: 'honor' | 'collection' | 'default' = 'default', icon?: string): string {
  // Config Colors based on type
  const isHonor = type === 'honor';
  const isCollection = type === 'collection';
  
  let bgFill = '#f0f9ff';
  let stroke = '#bae6fd';
  let textColor = '#0284c7';
  let iconColor = '#7dd3fc';

  if (isCollection) {
    bgFill = '#fffbeb'; // Amber-50
    stroke = '#fde68a'; // Amber-200
    textColor = '#b45309'; // Amber-700
    iconColor = '#fed7aa'; // Amber-300
  }

  // Safe text truncation
  const mainChar = icon || (text ? text.charAt(0) : '?');
  const fullText = text || '';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
    <rect width="100%" height="100%" fill="${bgFill}" stroke="${stroke}" stroke-width="10" rx="24" ry="24"/>
    <circle cx="150" cy="160" r="80" fill="${iconColor}" fill-opacity="0.3"/>
    <text x="150" y="200" font-family="sans-serif" font-size="100" fill="${textColor}" text-anchor="middle" font-weight="bold" dy=".3em">${mainChar}</text>
    <text x="150" y="340" font-family="sans-serif" font-size="28" fill="${textColor}" text-anchor="middle" font-weight="bold">${fullText}</text>
  </svg>`;
  
  // Use UTF-8 safe encoding for Data URI
  return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
}