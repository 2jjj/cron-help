import { parseExpression, describeExpression, nextRuns } from './cron.js';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Uso: node src/index.js "<expressão cron>" [quantidade]');
  console.log('Exemplo: node src/index.js "*/15 9-18 * * 1-5" 5');
  process.exit(0);
}

const expr = args[0];
const count = args[1] ? parseInt(args[1], 10) : 5;

try {
  const parsed = parseExpression(expr);
  const description = describeExpression(parsed);
  console.log(description);
  console.log('Próximas execuções:');
  const runs = nextRuns(parsed, count);
  for (const run of runs) {
    console.log('  ' + run.toISOString().slice(0, 16).replace('T', ' '));
  }
} catch (err) {
  console.error('Erro: ' + err.message);
  process.exit(1);
}
