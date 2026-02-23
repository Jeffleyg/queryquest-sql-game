import { useEffect, useMemo, useState } from 'react';
import type { Mission } from '../types';

type TokenKind = 'field' | 'operator' | 'value';

interface BuilderSchema {
  table: string;
  columns: string[];
  values: string[];
  defaultSelect?: string[];
}

interface QueryBuilderProps {
  mission: Mission;
  onSqlChange: (sql: string) => void;
  onPreviewChange?: (sql: string) => void;
  onReadyChange?: (ready: boolean) => void;
}

const DEFAULT_SCHEMA: BuilderSchema = {
  table: 'citizens',
  columns: ['id', 'name', 'district', 'age'],
  values: ['Downtown', 'Uptown', 'Midtown'],
  defaultSelect: ['name'],
};

const SCHEMA_BY_MISSION: Record<string, BuilderSchema> = {
  'level1-mission1': {
    table: 'citizens',
    columns: ['id', 'name', 'district', 'age'],
    values: ['Downtown', 'Uptown', 'Midtown'],
    defaultSelect: ['name'],
  },
};

const OPERATORS = ['=', '!=', '>', '<', '>=', '<='];

function formatValue(value: string): string {
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return value;
  }
  return `'${value.replace(/'/g, "''")}'`;
}

function buildSql(table: string, selectFields: string[], whereField: string | null, whereOp: string, whereValue: string | null) {
  const selectClause = selectFields.length > 0 ? selectFields.join(', ') : '*';
  let sql = `SELECT ${selectClause} FROM ${table}`;
  if (whereField && whereValue) {
    sql += ` WHERE ${whereField} ${whereOp} ${formatValue(whereValue)}`;
  }
  return `${sql};`;
}

function buildSqlPreview(table: string, selectFields: string[], whereField: string | null, whereOp: string, whereValue: string | null) {
  const selectClause = selectFields.length > 0 ? selectFields.join(', ') : '*';
  let sql = `SELECT ${selectClause} FROM ${table}`;

  if (whereField || whereValue) {
    const field = whereField ?? 'field';
    const value = whereValue ? formatValue(whereValue) : 'value';
    sql += ` WHERE ${field} ${whereOp} ${value}`;
  }

  return `${sql};`;
}

export default function QueryBuilder({ mission, onSqlChange, onPreviewChange, onReadyChange }: QueryBuilderProps) {
  const schema = useMemo(() => SCHEMA_BY_MISSION[mission.id] ?? DEFAULT_SCHEMA, [mission.id]);
  const [selectFields, setSelectFields] = useState<string[]>(schema.defaultSelect ?? []);
  const [whereField, setWhereField] = useState<string | null>(null);
  const [whereOp, setWhereOp] = useState<string>('=');
  const [whereValue, setWhereValue] = useState<string | null>(null);
  const previewSql = buildSqlPreview(schema.table, selectFields, whereField, whereOp, whereValue);
  const isWhereComplete = Boolean(whereField && whereValue);

  useEffect(() => {
    onSqlChange(buildSql(schema.table, selectFields, whereField, whereOp, whereValue));
    onPreviewChange?.(buildSqlPreview(schema.table, selectFields, whereField, whereOp, whereValue));
    onReadyChange?.(Boolean(whereField && whereValue));
  }, [schema.table, selectFields, whereField, whereOp, whereValue, onSqlChange, onPreviewChange, onReadyChange]);

  function handleDrop(event: React.DragEvent<HTMLDivElement>, target: TokenKind | 'select') {
    event.preventDefault();
    const payload = event.dataTransfer.getData('text/plain');
    if (!payload) return;
    const data = JSON.parse(payload) as { kind: TokenKind; value: string };

    if (target === 'select' && data.kind === 'field') {
      setSelectFields((prev) => (prev.includes(data.value) ? prev : [...prev, data.value]));
      return;
    }

    if (target === 'field' && data.kind === 'field') {
      setWhereField(data.value);
      return;
    }

    if (target === 'operator' && data.kind === 'operator') {
      setWhereOp(data.value);
      return;
    }

    if (target === 'value' && data.kind === 'value') {
      setWhereValue(data.value);
    }
  }

  function allowDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function startDrag(event: React.DragEvent<HTMLButtonElement>, kind: TokenKind, value: string) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ kind, value }));
  }

  function resetBuilder() {
    setSelectFields(schema.defaultSelect ?? []);
    setWhereField(null);
    setWhereOp('=');
    setWhereValue(null);
  }

  return (
    <div className="builder-shell">
      <div className="builder-header">
        <div>
          <div className="builder-title">Drag the clues to build the answer</div>
          <div className="builder-subtitle">Kids can solve the case together, no typing needed.</div>
        </div>
        <button className="btn-secondary" onClick={resetBuilder}>Reset Builder</button>
      </div>

      <div className="builder-grid">
        <div className="builder-panel">
          <div className="builder-panel-title">Clue Tokens</div>
          <div className="token-group">
            <div className="token-group-title">Fields</div>
            <div className="token-row">
              {schema.columns.map((col) => (
                <button
                  key={col}
                  className="token-chip"
                  draggable
                  onDragStart={(event) => startDrag(event, 'field', col)}
                  onClick={() => setSelectFields((prev) => (prev.includes(col) ? prev : [...prev, col]))}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          <div className="token-group">
            <div className="token-group-title">Operators</div>
            <div className="token-row">
              {OPERATORS.map((op) => (
                <button
                  key={op}
                  className="token-chip token-chip-accent"
                  draggable
                  onDragStart={(event) => startDrag(event, 'operator', op)}
                  onClick={() => setWhereOp(op)}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div className="token-group">
            <div className="token-group-title">Values</div>
            <div className="token-row">
              {schema.values.map((value) => (
                <button
                  key={value}
                  className="token-chip token-chip-warm"
                  draggable
                  onDragStart={(event) => startDrag(event, 'value', value)}
                  onClick={() => setWhereValue(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="builder-panel builder-panel-wide">
          <div className="builder-panel-title">Build Zone</div>
          <div className="builder-zone">
            <div className="builder-row">
              <span className="builder-label">SELECT</span>
              <div
                className="drop-zone"
                onDragOver={allowDrop}
                onDrop={(event) => handleDrop(event, 'select')}
              >
                {selectFields.length === 0 && <span className="drop-placeholder">Drop fields here</span>}
                {selectFields.map((field) => (
                  <button
                    key={field}
                    className="token-pill"
                    onClick={() => setSelectFields((prev) => prev.filter((item) => item !== field))}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>

            <div className="builder-row">
              <span className="builder-label">FROM</span>
              <div className="drop-zone drop-zone-static">
                <span className="token-pill token-pill-solid">{schema.table}</span>
              </div>
            </div>

            <div className="builder-row">
              <span className="builder-label">WHERE</span>
              <div className="drop-zone where-zone">
                <div
                  className="drop-slot"
                  onDragOver={allowDrop}
                  onDrop={(event) => handleDrop(event, 'field')}
                >
                  {whereField ? (
                    <button className="token-pill" onClick={() => setWhereField(null)}>{whereField}</button>
                  ) : (
                    <span className="drop-placeholder">field</span>
                  )}
                </div>
                <div
                  className="drop-slot"
                  onDragOver={allowDrop}
                  onDrop={(event) => handleDrop(event, 'operator')}
                >
                  {whereOp ? (
                    <button className="token-pill token-pill-accent" onClick={() => setWhereOp('=')}>{whereOp}</button>
                  ) : (
                    <span className="drop-placeholder">operator</span>
                  )}
                </div>
                <div
                  className="drop-slot"
                  onDragOver={allowDrop}
                  onDrop={(event) => handleDrop(event, 'value')}
                >
                  {whereValue ? (
                    <button className="token-pill token-pill-warm" onClick={() => setWhereValue(null)}>{whereValue}</button>
                  ) : (
                    <span className="drop-placeholder">value</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="builder-preview">
            <div className="builder-panel-title">SQL Preview</div>
            {!isWhereComplete && (whereField || whereValue) && (
              <div className="builder-warning">Complete the WHERE field and value to activate filtering.</div>
            )}
            <div className="preview-box">
              {previewSql}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
