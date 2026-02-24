import { useEffect, useMemo, useState } from 'react';
import type { Mission } from '../types';

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

const OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN', 'BETWEEN'];
const ORDER_DIRECTIONS = ['ASC', 'DESC'];
const AGGREGATE_FUNCTIONS = ['COUNT(*)', 'AVG', 'SUM', 'MIN', 'MAX'];
const JOIN_TYPES = ['INNER', 'LEFT', 'RIGHT', 'FULL'];

interface WhereCondition {
  field: string | null;
  operator: string;
  value: string | null;
  value2?: string | null; // For BETWEEN operator
  logicalOp?: 'AND' | 'OR';
}

interface JoinClause {
  type: string;
  table: string;
  alias: string;
  on: string;
}

function formatValue(value: string): string {
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return value;
  }
  return `'${value.replace(/'/g, "''")}'`;
}

function buildSql(
  table: string,
  selectExpressions: string[],
  joins: JoinClause[],
  whereConditions: WhereCondition[],
  groupByFields: string[],
  havingClause: string,
  orderByField: string | null,
  orderByDirection: string,
  limitValue: string
) {
  const selectClause = selectExpressions.length > 0 ? selectExpressions.join(', ') : '*';
  let sql = `SELECT ${selectClause} FROM ${table}`;

  const validJoins = joins.filter((join) => join.table && join.on);
  if (validJoins.length > 0) {
    for (const join of validJoins) {
      const alias = join.alias ? ` ${join.alias}` : '';
      sql += ` ${join.type} JOIN ${join.table}${alias} ON ${join.on}`;
    }
  }

  const validConditions = whereConditions.filter((c) => {
    if (c.operator === 'BETWEEN') {
      return c.field && c.value && c.value2;
    }
    return c.field && c.value;
  });

  if (validConditions.length > 0) {
    const whereClause = validConditions
      .map((condition, index) => {
        let conditionStr: string;
        if (condition.operator === 'BETWEEN') {
          conditionStr = `${condition.field} BETWEEN ${formatValue(condition.value!)} AND ${formatValue(condition.value2!)}`;
        } else {
          conditionStr = `${condition.field} ${condition.operator} ${formatValue(condition.value!)}`;
        }
        if (index === 0) return conditionStr;
        return ` ${condition.logicalOp || 'AND'} ${conditionStr}`;
      })
      .join('');
    sql += ` WHERE ${whereClause}`;
  }

  if (groupByFields.length > 0) {
    sql += ` GROUP BY ${groupByFields.join(', ')}`;
  }

  if (havingClause.trim().length > 0) {
    sql += ` HAVING ${havingClause.trim()}`;
  }

  if (orderByField) {
    sql += ` ORDER BY ${orderByField} ${orderByDirection}`;
  }

  if (limitValue.trim().length > 0) {
    sql += ` LIMIT ${limitValue.trim()}`;
  }

  return `${sql};`;
}

function buildSqlPreview(
  table: string,
  selectExpressions: string[],
  joins: JoinClause[],
  whereConditions: WhereCondition[],
  groupByFields: string[],
  havingClause: string,
  orderByField: string | null,
  orderByDirection: string,
  limitValue: string
) {
  const selectClause = selectExpressions.length > 0 ? selectExpressions.join(', ') : '*';
  let sql = `SELECT ${selectClause} FROM ${table}`;

  const validJoins = joins.filter((join) => join.table && join.on);
  if (validJoins.length > 0) {
    for (const join of validJoins) {
      const alias = join.alias ? ` ${join.alias}` : '';
      sql += ` ${join.type} JOIN ${join.table}${alias} ON ${join.on}`;
    }
  }

  if (whereConditions.length > 0) {
    const whereClause = whereConditions
      .map((condition, index) => {
        const field = condition.field ?? 'field';
        let conditionStr: string;
        if (condition.operator === 'BETWEEN') {
          const value1 = condition.value ? formatValue(condition.value) : 'value1';
          const value2 = condition.value2 ? formatValue(condition.value2) : 'value2';
          conditionStr = `${field} BETWEEN ${value1} AND ${value2}`;
        } else {
          const value = condition.value ? formatValue(condition.value) : 'value';
          conditionStr = `${field} ${condition.operator} ${value}`;
        }
        if (index === 0) return conditionStr;
        return ` ${condition.logicalOp || 'AND'} ${conditionStr}`;
      })
      .join('');
    sql += ` WHERE ${whereClause}`;
  }

  if (groupByFields.length > 0) {
    sql += ` GROUP BY ${groupByFields.join(', ')}`;
  }

  if (havingClause.trim().length > 0) {
    sql += ` HAVING ${havingClause.trim()}`;
  }

  if (orderByField) {
    sql += ` ORDER BY ${orderByField} ${orderByDirection}`;
  }

  if (limitValue.trim().length > 0) {
    sql += ` LIMIT ${limitValue.trim()}`;
  }

  return `${sql};`;
}

export default function QueryBuilder({ mission, onSqlChange, onPreviewChange, onReadyChange }: QueryBuilderProps) {
  const schema = useMemo(() => SCHEMA_BY_MISSION[mission.id] ?? DEFAULT_SCHEMA, [mission.id]);
  const [selectExpressions, setSelectExpressions] = useState<string[]>(schema.defaultSelect ?? []);
  const [joins, setJoins] = useState<JoinClause[]>([]);
  const [whereConditions, setWhereConditions] = useState<WhereCondition[]>([]);
  const [groupByFields, setGroupByFields] = useState<string[]>([]);
  const [havingClause, setHavingClause] = useState('');
  const [orderByField, setOrderByField] = useState<string | null>(null);
  const [orderByDirection, setOrderByDirection] = useState<string>('ASC');
  const [limitValue, setLimitValue] = useState('');
  const [newSelectExpression, setNewSelectExpression] = useState('');
  const [newGroupByField, setNewGroupByField] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const previewSql = buildSqlPreview(
    schema.table, 
    selectExpressions,
    joins,
    whereConditions,
    groupByFields,
    havingClause,
    orderByField,
    orderByDirection,
    limitValue
  );

  useEffect(() => {
    onSqlChange(buildSql(
      schema.table, 
      selectExpressions,
      joins,
      whereConditions,
      groupByFields,
      havingClause,
      orderByField,
      orderByDirection,
      limitValue
    ));
    onPreviewChange?.(buildSqlPreview(
      schema.table, 
      selectExpressions,
      joins,
      whereConditions,
      groupByFields,
      havingClause,
      orderByField,
      orderByDirection,
      limitValue
    ));
    // Query is always ready - WHERE is optional
    onReadyChange?.(true);
  }, [schema.table, selectExpressions, joins, whereConditions, groupByFields, havingClause, orderByField, orderByDirection, limitValue, onSqlChange, onPreviewChange, onReadyChange]);

  function resetBuilder() {
    setSelectExpressions(schema.defaultSelect ?? []);
    setJoins([]);
    setWhereConditions([]);
    setGroupByFields([]);
    setHavingClause('');
    setOrderByField(null);
    setOrderByDirection('ASC');
    setLimitValue('');
    setNewSelectExpression('');
    setNewGroupByField('');
  }

  function addWhereCondition(logicalOp: 'AND' | 'OR' = 'AND') {
    setWhereConditions(prev => [...prev, { field: null, operator: '=', value: null, logicalOp }]);
  }

  function removeWhereCondition(index: number) {
    setWhereConditions(prev => prev.filter((_, i) => i !== index));
  }

  function updateWhereCondition(index: number, updates: Partial<WhereCondition>) {
    setWhereConditions(prev => prev.map((condition, i) => 
      i === index ? { ...condition, ...updates } : condition
    ));
  }

  function addJoin() {
    setJoins((prev) => [...prev, { type: 'INNER', table: '', alias: '', on: '' }]);
  }

  function updateJoin(index: number, updates: Partial<JoinClause>) {
    setJoins((prev) => prev.map((join, i) => (i === index ? { ...join, ...updates } : join)));
  }

  function removeJoin(index: number) {
    setJoins((prev) => prev.filter((_, i) => i !== index));
  }

  function addSelectExpression() {
    const trimmed = newSelectExpression.trim();
    if (!trimmed) return;
    setSelectExpressions((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setNewSelectExpression('');
  }

  function addGroupByField() {
    const trimmed = newGroupByField.trim();
    if (!trimmed) return;
    setGroupByFields((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setNewGroupByField('');
  }

  return (
    <div className="builder-shell">
      <div className="builder-header">
        <div>
          <div className="builder-title">Visual Query Builder</div>
          <div className="builder-subtitle">Build your SQL query using dropdowns and inputs below.</div>
        </div>
        <button className="btn-secondary" onClick={resetBuilder}>Reset Builder</button>
      </div>

      <div className="builder-grid">
        <div className="builder-panel">
          <div className="builder-panel-title">Quick Tokens (Click to Use)</div>
          <div className="token-group">
            <div className="token-group-title">Fields</div>
            <div className="token-row">
              {schema.columns.map((col) => (
                <button
                  key={col}
                  className="token-chip"
                  onClick={() => {
                    if (whereConditions.length > 0 && !whereConditions[0]?.field) {
                      updateWhereCondition(0, { field: col });
                      return;
                    }
                    setSelectExpressions((prev) => (prev.includes(col) ? prev : [...prev, col]));
                  }}
                  title={`Click to ${!whereConditions[0]?.field ? 'set WHERE field' : 'add to SELECT'}`}
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
                  onClick={() => updateWhereCondition(0, { operator: op })}
                  title="Click to set operator"
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div className="token-group">
            <div className="token-group-title">Common Values</div>
            <div className="token-row">
              {schema.values.map((value) => (
                <button
                  key={value}
                  className="token-chip token-chip-warm"
                  onClick={() => updateWhereCondition(0, { value })}
                  title="Click to set value"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="token-group">
            <div className="token-group-title">Aggregate Functions</div>
            <div className="token-row">
              {AGGREGATE_FUNCTIONS.map((func) => (
                <button
                  key={func}
                  className="token-chip token-chip-accent"
                  onClick={() => {
                    const funcWithField = func === 'COUNT(*)' ? 'COUNT(*)' : `${func}(age)`;
                    setSelectExpressions((prev) => (prev.includes(funcWithField) ? prev : [...prev, funcWithField]));
                  }}
                  title={`Add ${func} to SELECT`}
                >
                  {func}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="builder-panel builder-panel-wide">
          <div className="builder-panel-title">Query Builder</div>
          <div className="builder-zone">
            <div className="builder-row">
              <span className="builder-label">SELECT</span>
              <div className="drop-zone">
                {selectExpressions.length === 0 && <span className="drop-placeholder">* (all fields)</span>}
                {selectExpressions.map((field) => (
                  <button
                    key={field}
                    className="token-pill"
                    onClick={() => setSelectExpressions((prev) => prev.filter((item) => item !== field))}
                    title="Click to remove"
                  >
                    {field} ×
                  </button>
                ))}
                <div className="select-input-row">
                  <input
                    type="text"
                    className="builder-input"
                    placeholder="Add expression (e.g. COUNT(*) AS total)"
                    value={newSelectExpression}
                    onChange={(e) => setNewSelectExpression(e.target.value)}
                  />
                  <button className="btn-add-condition" onClick={addSelectExpression}>
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="builder-row">
              <span className="builder-label">FROM</span>
              <div className="drop-zone drop-zone-static">
                <span className="token-pill token-pill-solid">{schema.table}</span>
              </div>
            </div>

            {/* WHERE Section with multiple conditions */}
            <div className="builder-section">
              <div className="builder-section-header">
                <span className="builder-label">WHERE (optional)</span>
                <button 
                  className="btn-add-condition"
                  onClick={() => addWhereCondition('AND')}
                  title="Add AND condition"
                >
                  + AND
                </button>
                <button 
                  className="btn-add-condition"
                  onClick={() => addWhereCondition('OR')}
                  title="Add OR condition"
                >
                  + OR
                </button>
              </div>
              
              {whereConditions.length === 0 ? (
                <div className="builder-row where-empty-message">
                  No filters applied. Click + AND or + OR to add conditions.
                </div>
              ) : (
                whereConditions.map((condition, index) => (
                <div key={index} className="builder-row where-condition-row">
                  {index > 0 && (
                    <span className="logical-operator">{condition.logicalOp}</span>
                  )}
                  <div className="drop-zone where-zone">
                    <select
                      className="builder-select"
                      value={condition.field ?? ''}
                      onChange={(e) => updateWhereCondition(index, { field: e.target.value || null })}
                      aria-label="WHERE field"
                    >
                      <option value="">Choose field...</option>
                      {schema.columns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                    <select
                      className="builder-select builder-select-small"
                      value={condition.operator}
                      onChange={(e) => updateWhereCondition(index, { operator: e.target.value })}
                      aria-label="WHERE operator"
                    >
                      {OPERATORS.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="builder-input"
                      placeholder={condition.operator === 'BETWEEN' ? 'Min value...' : 'Enter value...'}
                      value={condition.value ?? ''}
                      onChange={(e) => updateWhereCondition(index, { value: e.target.value || null })}
                      list={`value-suggestions-${index}`}
                    />
                    {condition.operator === 'BETWEEN' && (
                      <>
                        <span className="between-label">AND</span>
                        <input
                          type="text"
                          className="builder-input"
                          placeholder="Max value..."
                          value={condition.value2 ?? ''}
                          onChange={(e) => updateWhereCondition(index, { value2: e.target.value || null })}
                        />
                      </>
                    )}
                    <datalist id={`value-suggestions-${index}`}>
                      {schema.values.map((value) => (
                        <option key={value} value={value} />
                      ))}
                    </datalist>
                    <button 
                      className="btn-remove-condition"
                      onClick={() => removeWhereCondition(index)}
                      title="Remove this condition"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )))}
            </div>

            <div className="builder-row">
              <span className="builder-label">GROUP BY</span>
              <div className="drop-zone">
                <div className="token-wrap">
                  {groupByFields.length === 0 && (
                    <span className="drop-placeholder">None (optional)</span>
                  )}
                  {groupByFields.map((field) => (
                    <button
                      key={field}
                      className="token-pill"
                      onClick={() => setGroupByFields((prev) => prev.filter((item) => item !== field))}
                      title="Remove GROUP BY field"
                    >
                      {field} ×
                    </button>
                  ))}
                </div>
                <div className="select-input-row">
                  <input
                    type="text"
                    className="builder-input"
                    placeholder="Add group by field (e.g. district)"
                    value={newGroupByField}
                    onChange={(e) => setNewGroupByField(e.target.value)}
                  />
                  <button className="btn-add-condition" onClick={addGroupByField}>
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="builder-section">
              <div className="builder-section-header">
                <span className="builder-label">ADVANCED</span>
                <button
                  className="btn-secondary"
                  onClick={() => setShowAdvanced((prev) => !prev)}
                >
                  {showAdvanced ? 'Hide' : 'Show'} advanced blocks
                </button>
              </div>

              {showAdvanced && (
                <div className="advanced-blocks">
                  <div className="builder-row">
                    <span className="builder-label">JOINS</span>
                    <div className="drop-zone">
                      <button className="btn-add-condition" onClick={addJoin}>+ Join</button>
                      {joins.length === 0 && (
                        <span className="drop-placeholder">No joins added yet.</span>
                      )}
                      {joins.map((join, index) => (
                        <div key={index} className="join-row">
                          <select
                            className="builder-select builder-select-small"
                            value={join.type}
                            onChange={(e) => updateJoin(index, { type: e.target.value })}
                            aria-label="Join type"
                          >
                            {JOIN_TYPES.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            className="builder-input"
                            placeholder="table"
                            value={join.table}
                            onChange={(e) => updateJoin(index, { table: e.target.value })}
                          />
                          <input
                            type="text"
                            className="builder-input builder-input-small"
                            placeholder="alias"
                            value={join.alias}
                            onChange={(e) => updateJoin(index, { alias: e.target.value })}
                          />
                          <input
                            type="text"
                            className="builder-input builder-input-wide"
                            placeholder="join condition (e.g. c.id = o.customer_id)"
                            value={join.on}
                            onChange={(e) => updateJoin(index, { on: e.target.value })}
                          />
                          <button
                            className="btn-remove-condition"
                            onClick={() => removeJoin(index)}
                            title="Remove join"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="builder-row">
                    <span className="builder-label">HAVING</span>
                    <div className="drop-zone">
                      <input
                        type="text"
                        className="builder-input builder-input-wide"
                        placeholder="e.g. COUNT(*) > 3"
                        value={havingClause}
                        onChange={(e) => setHavingClause(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="builder-row">
                    <span className="builder-label">LIMIT</span>
                    <div className="drop-zone">
                      <input
                        type="number"
                        min="1"
                        className="builder-input builder-input-small"
                        placeholder="e.g. 10"
                        value={limitValue}
                        onChange={(e) => setLimitValue(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="builder-row">
              <span className="builder-label">ORDER BY</span>
              <div className="drop-zone where-zone">
                <select
                  className="builder-select"
                  value={orderByField ?? ''}
                  onChange={(e) => setOrderByField(e.target.value || null)}
                  aria-label="ORDER BY field"
                >
                  <option value="">None (optional)</option>
                  {schema.columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  className="builder-select builder-select-small"
                  value={orderByDirection}
                  onChange={(e) => setOrderByDirection(e.target.value)}
                  disabled={!orderByField}
                  aria-label="ORDER BY direction"
                >
                  {ORDER_DIRECTIONS.map((dir) => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
                {orderByField && (
                  <button 
                    className="token-pill" 
                    onClick={() => setOrderByField(null)}
                    title="Remove ORDER BY"
                  >
                    Clear ×
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="builder-preview">
            <div className="builder-panel-title">SQL Preview</div>
            <div className="preview-box">
              {previewSql}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
