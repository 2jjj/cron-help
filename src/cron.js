const FIELDS = [
  { name: 'minuto', min: 0, max: 59 },
  { name: 'hora', min: 0, max: 23 },
  { name: 'dia do mês', min: 1, max: 31 },
  { name: 'mês', min: 1, max: 12 },
  { name: 'dia da semana', min: 0, max: 6 }
];

const DAY_NAMES = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

export function parseExpression(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error('A expressão deve ter 5 campos');
  }
  return parts.map((part, i) => parseField(part, FIELDS[i]));
}

function parseField(text, field) {
  if (text === '*') return { type: 'all', values: null };
  const values = new Set();
  for (const segment of text.split(',')) {
    const stepMatch = segment.match(/^(\*|\d+(?:-\d+)?)\/(\d+)$/);
    if (stepMatch) {
      const step = parseInt(stepMatch[2], 10);
      let start = field.min;
      let end = field.max;
      if (stepMatch[1] !== '*') {
        const [s, e] = stepMatch[1].split('-').map(Number);
        start = s;
        end = e;
      }
      for (let v = start; v <= end; v += step) values.add(v);
      continue;
    }
    const rangeMatch = segment.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (start < field.min || end > field.max || start > end) {
        throw new Error(`Intervalo inválido no campo ${field.name}: ${segment}`);
      }
      for (let v = start; v <= end; v++) values.add(v);
      continue;
    }
    const num = parseInt(segment, 10);
    if (isNaN(num) || num < field.min || num > field.max) {
      throw new Error(`Valor inválido no campo ${field.name}: ${segment}`);
    }
    values.add(num);
  }
  return { type: 'values', values: Array.from(values).sort((a, b) => a - b) };
}

export function describeExpression(parsed) {
  const [min, hour, dom, month, dow] = parsed;
  const parts = [];
  parts.push(describeField(min, 'minuto', 'minutos'));
  parts.push(describeField(hour, 'hora', 'horas'));
  if (dom.type !== 'all') parts.push(describeField(dom, 'dia do mês', 'dias do mês'));
  if (month.type !== 'all') parts.push(describeField(month, 'mês', 'meses'));
  if (dow.type !== 'all') parts.push(describeDayOfWeek(dow));
  return parts.filter(Boolean).join(', ');
}

function describeField(field, singular, plural) {
  if (field.type === 'all') return `todo ${singular}`;
  const vals = field.values;
  if (vals.length === 1) return `${singular} ${vals[0]}`;
  if (vals.length === 2 && vals[1] === vals[0] + 1) return `${singular} ${vals[0]} e ${vals[1]}`;
  const isConsecutive = vals.every((v, i) => i === 0 || v === vals[i - 1] + 1);
  if (isConsecutive && vals.length > 2) {
    return `entre ${vals[0]} e ${vals[vals.length - 1]} ${plural}`;
  }
  return `${plural} ${vals.join(', ')}`;
}

function describeDayOfWeek(field) {
  if (field.type === 'all') return 'todos os dias da semana';
  const names = field.values.map(v => DAY_NAMES[v]);
  if (names.length === 1) return names[0];
  return names.join(', ');
}

export function nextRuns(parsed, count) {
  const [min, hour, dom, month, dow] = parsed;
  const runs = [];
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);
  let current = new Date(now);
  const limit = 100000;
  let iterations = 0;
  while (runs.length < count && iterations < limit) {
    iterations++;
    if (matches(min, current.getMinutes()) &&
        matches(hour, current.getHours()) &&
        matches(dom, current.getDate()) &&
        matches(month, current.getMonth() + 1) &&
        matches(dow, current.getDay())) {
      runs.push(new Date(current));
    }
    current.setMinutes(current.getMinutes() + 1);
  }
  return runs;
}

function matches(field, value) {
  if (field.type === 'all') return true;
  return field.values.includes(value);
}
