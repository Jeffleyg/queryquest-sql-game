import { useEffect, useState } from 'react';
import { applySettings, getSettings, saveSettings, type AppSettings } from '../utils/settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  useEffect(() => {
    const handleUpdate = () => setSettings(getSettings());
    window.addEventListener('settings:updated', handleUpdate);
    return () => window.removeEventListener('settings:updated', handleUpdate);
  }, []);

  const updateSettings = (update: Partial<AppSettings>) => {
    const next = saveSettings(update);
    setSettings(next);
  };

  return { settings, updateSettings };
}
