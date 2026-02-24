import Editor from '@monaco-editor/react';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme?: 'vs-dark' | 'vs-light';
}

export default function SqlEditor({ value, onChange, theme = 'vs-dark' }: SqlEditorProps) {
  return (
    <div className="sql-editor-container">
      <div className="sql-editor-toolbar">
        <span className="editor-dot editor-dot-red" />
        <span className="editor-dot editor-dot-yellow" />
        <span className="editor-dot editor-dot-green" />
        <span className="editor-label">mission.console</span>
      </div>
      <Editor
        height="220px"
        language="sql"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        theme={theme}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Fira Code', 'Courier New', monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
