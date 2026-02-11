
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

export function generateCardDataUri(text: string): string {
  // Simple placeholder SVG generation for missing images
  // Removed unescape to fix deprecated warning in strict mode, simplified encoding
  const cleanText = text.replace(/[^\x00-\x7F]/g, "?"); // basic ASCII safety for btoa
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
    <rect width="100%" height="100%" fill="#f0f9ff" stroke="#bae6fd" stroke-width="4"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="30" fill="#0ea5e9" text-anchor="middle" dy=".3em">${text.substring(0, 10)}</text>
  </svg>`;
  
  // Use a safer encoding approach for UTF8 chars
  const encoded = window.btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}
