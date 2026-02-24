export type ThemeMode = 'dark' | 'light';
export type EditorTheme = 'vs-dark' | 'vs-light';

export interface AppSettings {
  theme: ThemeMode;
  editorTheme: EditorTheme;
  reduceMotion: boolean;
  showCelebration: boolean;
  showHints: boolean;
}

const SETTINGS_KEY = 'queryquest_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  editorTheme: 'vs-dark',
  reduceMotion: false,
  showCelebration: true,
  showHints: true,
};

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(update: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...update };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('settings:updated'));
  return next;
}

export function applySettings(settings: AppSettings) {
  document.documentElement.setAttribute('data-theme', settings.theme);
  document.body.classList.toggle('reduce-motion', settings.reduceMotion);
}
