import { Request, Response } from 'express';
import { getAllMissions } from '../services/missionService';

interface SQLExample {
  title: string;
  description: string;
  query: string;
  category: string;
}

interface SQLManualSection {
  title: string;
  scenario: string;
  schema: string;
  exampleQuery: string;
  explanation: string;
  realWorld: string;
}

const SQL_EXAMPLES: SQLExample[] = [
  {
    title: 'Basic SELECT',
    description: 'Get all columns from a table',
    query: 'SELECT * FROM citizens;',
    category: 'Basic'
  },
  {
    title: 'SELECT with WHERE',
    description: 'Filter records by condition',
    query: "SELECT name, age FROM citizens WHERE age > 25;",
    category: 'Basic'
  },
  {
    title: 'ORDER BY',
    description: 'Sort results',
    query: 'SELECT name, age FROM citizens ORDER BY age DESC;',
    category: 'Basic'
  },
  {
    title: 'COUNT and GROUP BY',
    description: 'Count records by group',
    query: 'SELECT district, COUNT(*) as population FROM citizens GROUP BY district;',
    category: 'Aggregation'
  },
  {
    title: 'INNER JOIN',
    description: 'Join two tables',
    query: 'SELECT c.name, j.position FROM citizens c INNER JOIN jobs j ON c.id = j.citizen_id;',
    category: 'Joins'
  },
  {
    title: 'LEFT JOIN',
    description: 'Include unmatched records from left table',
    query: 'SELECT c.name, j.position FROM citizens c LEFT JOIN jobs j ON c.id = j.citizen_id;',
    category: 'Joins'
  },
  {
    title: 'BETWEEN',
    description: 'Range filtering',
    query: 'SELECT name, age FROM citizens WHERE age BETWEEN 20 AND 30;',
    category: 'Filtering'
  },
  {
    title: 'LIKE Pattern',
    description: 'Text pattern matching',
    query: "SELECT name FROM citizens WHERE name LIKE 'A%';",
    category: 'Filtering'
  },
  {
    title: 'AVG Aggregate',
    description: 'Calculate average',
    query: 'SELECT AVG(age) as average_age FROM citizens;',
    category: 'Aggregation'
  },
  {
    title: 'HAVING Clause',
    description: 'Filter after aggregation',
    query: 'SELECT district, COUNT(*) FROM citizens GROUP BY district HAVING COUNT(*) > 2;',
    category: 'Advanced'
  },
  {
    title: 'CASE Statement',
    description: 'Conditional logic',
    query: "SELECT name, CASE WHEN age < 30 THEN 'Young' ELSE 'Adult' END as category FROM citizens;",
    category: 'Advanced'
  },
  {
    title: 'Subquery',
    description: 'Query within a query',
    query: 'SELECT name FROM citizens WHERE age > (SELECT AVG(age) FROM citizens);',
    category: 'Advanced'
  }
];

const SQL_MANUAL: SQLManualSection[] = [
  {
    title: 'Store Orders (SELECT + WHERE)',
    scenario: 'A store wants to see only pending orders to prepare shipments.',
    schema: [
      'Table: orders',
      'columns: id, customer_name, status, total'
    ].join('\n'),
    exampleQuery: "SELECT id, customer_name, total FROM orders WHERE status = 'Pending';",
    explanation: 'Filters orders by status and returns only the fields needed for shipping.',
    realWorld: 'Equivalent to a dispatch dashboard showing only orders awaiting shipment.'
  },
  {
    title: 'District Summary (GROUP BY)',
    scenario: 'City hall wants to know how many citizens live in each district.',
    schema: [
      'Table: citizens',
      'columns: id, name, district, age'
    ].join('\n'),
    exampleQuery: 'SELECT district, COUNT(*) AS total FROM citizens GROUP BY district;',
    explanation: 'Groups citizens by district and counts how many belong to each group.',
    realWorld: 'Helps allocate public services and infrastructure by region.'
  },
  {
    title: 'Orders and Customers (JOIN)',
    scenario: 'The finance team needs to list orders together with customer names.',
    schema: [
      'Table: customers (id, name)',
      'Table: orders (id, customer_id, total)'
    ].join('\n'),
    exampleQuery: 'SELECT c.name, o.id, o.total FROM customers c JOIN orders o ON o.customer_id = c.id;',
    explanation: 'Connects orders with customers using the customer_id relationship key.',
    realWorld: 'Generates revenue reports per customer.'
  },
  {
    title: 'Quick View (VIEW)',
    scenario: 'The team wants a ready-made view of open projects for quick access.',
    schema: [
      'Table: projects (id, name, status, budget)'
    ].join('\n'),
    exampleQuery: [
      'CREATE VIEW open_projects AS',
      "SELECT name, budget FROM projects WHERE status = 'Open';"
    ].join('\n'),
    explanation: 'Creates a reusable view for frequent queries without rewriting SQL.',
    realWorld: 'Acts like a fixed dashboard with always-ready information for leadership.'
  }
];

export function getExamples(req: Request, res: Response): void {
  res.json({ examples: SQL_EXAMPLES });
}

export function getManual(req: Request, res: Response): void {
  res.json({ sections: SQL_MANUAL });
}

export function getMissionHints(req: Request, res: Response): void {
  const missions = getAllMissions();
  const hints = missions.map(m => ({
    id: m.id,
    title: m.title,
    hint: m.hint,
    level: m.level
  }));
  res.json({ hints });
}

export function getQueryTemplate(req: Request, res: Response): void {
  const { missionId } = req.params;
  const missions = getAllMissions();
  const mission = missions.find(m => m.id === missionId);
  
  if (!mission) {
    res.status(404).json({ error: 'Mission not found' });
    return;
  }

  // Generate a query template based on mission requirements
  const keywords = mission.validationRules.requiredKeywords || [];
  let template = '';

  if (keywords.includes('SELECT')) {
    template = 'SELECT ';
    if (mission.validationRules.expectedColumns) {
      template += mission.validationRules.expectedColumns.join(', ');
    } else {
      template += '*';
    }
    template += '\nFROM ...';
    
    if (keywords.includes('JOIN')) {
      template += '\nJOIN ... ON ...';
    }
    if (keywords.includes('WHERE')) {
      template += '\nWHERE ...';
    }
    if (keywords.includes('GROUP')) {
      template += '\nGROUP BY ...';
    }
    if (keywords.includes('HAVING')) {
      template += '\nHAVING ...';
    }
    if (keywords.includes('ORDER')) {
      template += '\nORDER BY ...';
    }
    template += ';';
  } else if (keywords.includes('INSERT')) {
    template = 'INSERT INTO table_name (column1, column2)\nVALUES (value1, value2);';
  } else if (keywords.includes('UPDATE')) {
    template = 'UPDATE table_name\nSET column1 = value1\nWHERE condition;';
  } else if (keywords.includes('DELETE')) {
    template = 'DELETE FROM table_name\nWHERE condition;';
  } else if (keywords.includes('CREATE')) {
    template = 'CREATE TABLE table_name (\n  id SERIAL PRIMARY KEY,\n  column1 VARCHAR(100),\n  column2 INT\n);';
  }

  res.json({ 
    missionId, 
    template,
    hint: mission.hint 
  });
}
