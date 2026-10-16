export function hexToRgb(hexColor?: string): { r: number; g: number; b: number } {
  if (!hexColor) return { r: 16, g: 185, b: 129 }; // default emerald
  let hex = hexColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return { r: 16, g: 185, b: 129 };
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return { r, g, b };
}

export function adjustLightness(hexColor: string, percent: number): string {
  const { r, g, b } = hexToRgb(hexColor);
  const factor = percent / 100;

  const newR = Math.min(255, Math.max(0, Math.round(r + (percent > 0 ? (255 - r) * factor : r * factor))));
  const newG = Math.min(255, Math.max(0, Math.round(g + (percent > 0 ? (255 - g) * factor : g * factor))));
  const newB = Math.min(255, Math.max(0, Math.round(b + (percent > 0 ? (255 - b) * factor : b * factor))));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export function getContrastTextColor(hexColor?: string): string {
  if (!hexColor) return '#ffffff';
  const { r, g, b } = hexToRgb(hexColor);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  // Use pure white for buttons except on extremely light yellow/white shades
  return yiq >= 210 ? '#0f172a' : '#ffffff';
}

export type CrmThemeMode = 'light' | 'dark';

export const CRM_THEME_STORAGE_KEY = 'crm_theme_mode';

export function getCrmThemeMode(): CrmThemeMode {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(CRM_THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return 'light'; // Default Light Theme
}

export function applyCrmTheme(colorHex?: string, themeMode?: CrmThemeMode): void {
  if (typeof document === 'undefined') return;
  const hex = colorHex || (typeof window !== 'undefined' ? localStorage.getItem('crm_primary_color') : null) || '#10b981';
  const mode = themeMode || (document.documentElement.getAttribute('data-admin-theme-mode') as CrmThemeMode) || getCrmThemeMode();
  const { r, g, b } = hexToRgb(hex);
  const light = adjustLightness(hex, 25);
  const dark = adjustLightness(hex, -20);
  const darker = adjustLightness(hex, -35);
  const contrast = getContrastTextColor(hex);
  const glow = `rgba(${r}, ${g}, ${b}, 0.15)`;
  const glowBorder = `rgba(${r}, ${g}, ${b}, 0.35)`;

  const root = document.documentElement;
  root.style.setProperty('--brand-primary', hex);
  root.style.setProperty('--brand-primary-light', light);
  root.style.setProperty('--brand-primary-dark', dark);
  root.style.setProperty('--brand-primary-darker', darker);
  root.style.setProperty('--brand-contrast', contrast);
  root.style.setProperty('--brand-primary-glow', glow);
  root.style.setProperty('--brand-primary-glow-border', glowBorder);

  // In light mode, text accents must be dark/darker so they are sharp and readable against white!
  // In dark mode, text accents must be bright/light so they pop against dark background!
  const textAccent = mode === 'light' ? darker : light;
  root.style.setProperty('--brand-text-accent', textAccent);
}

export function setCrmThemeMode(mode: CrmThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CRM_THEME_STORAGE_KEY, mode);
  applyCrmThemeMode(mode);
  window.dispatchEvent(new CustomEvent('crmThemeModeChanged', { detail: { mode } }));
}

export function applyCrmThemeMode(mode?: CrmThemeMode): void {
  if (typeof document === 'undefined') return;
  const currentMode = mode || getCrmThemeMode();
  const root = document.documentElement;
  
  root.setAttribute('data-admin-theme-mode', currentMode);

  const adminElements = document.querySelectorAll('[data-admin-theme]');
  adminElements.forEach((el) => {
    el.setAttribute('data-admin-theme', currentMode);
  });

  applyCrmTheme(undefined, currentMode);
}
