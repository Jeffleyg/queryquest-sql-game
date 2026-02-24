import { useSettings } from '../hooks/useSettings';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <main className="settings-page">
      <div className="settings-card">
        <div className="settings-header">
          <h1>Configuration</h1>
          <p>Customize your experience and save your preferences.</p>
        </div>

        <div className="settings-section">
          <h2>Theme</h2>
          <div className="settings-row">
            <label className="settings-label">Interface style</label>
            <div className="settings-control">
              <button
                className={settings.theme === 'dark' ? 'settings-pill active' : 'settings-pill'}
                onClick={() => updateSettings({ theme: 'dark' })}
              >
                Dark
              </button>
              <button
                className={settings.theme === 'light' ? 'settings-pill active' : 'settings-pill'}
                onClick={() => updateSettings({ theme: 'light' })}
              >
                Clean
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Editor</h2>
          <div className="settings-row">
            <label className="settings-label">SQL editor theme</label>
            <div className="settings-control">
              <button
                className={settings.editorTheme === 'vs-dark' ? 'settings-pill active' : 'settings-pill'}
                onClick={() => updateSettings({ editorTheme: 'vs-dark' })}
              >
                Dark
              </button>
              <button
                className={settings.editorTheme === 'vs-light' ? 'settings-pill active' : 'settings-pill'}
                onClick={() => updateSettings({ editorTheme: 'vs-light' })}
              >
                Clean
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Experience</h2>
          <div className="settings-row">
            <label className="settings-label">Show mission hints</label>
            <button
              className={settings.showHints ? 'toggle active' : 'toggle'}
              onClick={() => updateSettings({ showHints: !settings.showHints })}
            >
              {settings.showHints ? 'On' : 'Off'}
            </button>
          </div>
          <div className="settings-row">
            <label className="settings-label">Celebration effects</label>
            <button
              className={settings.showCelebration ? 'toggle active' : 'toggle'}
              onClick={() => updateSettings({ showCelebration: !settings.showCelebration })}
            >
              {settings.showCelebration ? 'On' : 'Off'}
            </button>
          </div>
          <div className="settings-row">
            <label className="settings-label">Reduce motion</label>
            <button
              className={settings.reduceMotion ? 'toggle active' : 'toggle'}
              onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
            >
              {settings.reduceMotion ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
