// Her kombinasyon için: üret → CLI'ın son adımları → CI komutları (format:check, generate:check, typecheck, lint, build, test).
// Kullanım: pnpm --filter create-ako-app verify [--only=web,mobile] [--out=<klasör>] [--skip-tests]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { finalize } from '../src/finalize.mjs';
import { resolveTemplate, scaffold } from '../src/scaffold.mjs';

const COMBOS = {
  both: { web: ['site', 'backoffice'], mobile: true },
  web: { web: ['site', 'backoffice'], mobile: false },
  mobile: { web: [], mobile: true },
  site: { web: ['site'], mobile: false },
  backoffice: { web: ['backoffice'], mobile: false },
  'no-auth-site': { web: ['site'], mobile: false, auth: false },
  'no-auth-mobile': { web: [], mobile: true, auth: false },
  'no-lang-both': { web: ['site', 'backoffice'], mobile: true, lang: false },
  'no-auth-no-lang': { web: ['site'], mobile: true, auth: false, lang: false },
  'no-auth-both': { web: ['site'], mobile: true, auth: false },
};

const { values } = parseArgs({
  options: {
    only: { type: 'string' },
    out: { type: 'string' },
    'skip-tests': { type: 'boolean' },
    keep: { type: 'boolean' },
  },
});
const names = values.only ? values.only.split(',') : Object.keys(COMBOS);
const base = values.out ?? mkdtempSync(join(tmpdir(), 'ako-combos-'));
const run = (cwd, cmd, args) => {
  console.log(`  $ ${cmd} ${args.join(' ')}`);
  execFileSync(cmd, args, { cwd, stdio: 'inherit' });
};

const failed = [];
for (const name of names) {
  const combo = COMBOS[name];
  if (!combo) throw new Error(`Bilinmeyen kombinasyon: ${name}`);
  const target = join(base, name);
  console.log(`\n=== ${name} → ${target}`);
  try {
    scaffold({ target, template: resolveTemplate(), choices: { name: `combo-${name}`, ...combo } });
    run(target, 'pnpm', ['install', '--no-frozen-lockfile']);
    run(target, 'pnpm', ['typecheck']);
    run(target, 'pnpm', ['build']);
    run(target, 'dotnet', ['build', 'apps/api/Ako.slnx', '-c', 'Release']);
    if (values['dotnet-test'])
      run(target, 'dotnet', ['test', 'apps/api/Ako.slnx', '-c', 'Release', '--no-build']);
    console.log(`✔ ${name}`);
  } catch (error) {
    console.error(`✖ ${name}: ${error.message}`);
    failed.push(name);
  }
}
if (!values.keep && !values.out) rmSync(base, { recursive: true, force: true });
if (failed.length > 0) {
  console.error(`\nBaşarısız: ${failed.join(', ')}`);
  process.exit(1);
}
console.log('\nTüm kombinasyonlar geçti.');
