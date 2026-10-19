// Özellik kapalı varyantların üretilmiş dosyalarını (EF migration setleri) yeniler.
// Şablondaki model değişince çalıştırılır: pnpm --filter create-ako-app variants
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveTemplate, scaffold } from '../src/scaffold.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = 'apps/api/src/Ako.Api/Infrastructure/Data/Migrations';

const tmp = mkdtempSync(join(tmpdir(), 'ako-variants-'));
try {
  const target = join(tmp, 'no-auth');
  scaffold({
    target,
    template: resolveTemplate(),
    choices: { name: 'variant-no-auth', web: ['site'], mobile: false, auth: false },
    skipVariants: true,
  });
  const api = join(target, 'apps/api');
  const run = (args) => execFileSync('dotnet', args, { cwd: api, stdio: 'inherit' });
  run(['tool', 'restore']);
  run(['restore', 'Ako.slnx']);
  run([
    'ef',
    'migrations',
    'add',
    'Initial',
    '--project',
    'src/Ako.Api',
    '-o',
    'Infrastructure/Data/Migrations',
  ]);

  const out = resolve(here, '../variants/no-auth', MIGRATIONS);
  rmSync(resolve(here, '../variants/no-auth'), { recursive: true, force: true });
  cpSync(join(target, MIGRATIONS), out, { recursive: true });
  console.log(`variants/no-auth/${MIGRATIONS} yenilendi`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
