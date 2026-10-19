// Özellik kapalı varyantların üretilmiş dosyalarını (EF migration setleri) yeniler.
// Şablondaki model değişince çalıştırılır: pnpm --filter create-ako-app variants
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { variantName } from '../src/plan.mjs';
import { resolveTemplate, scaffold } from '../src/scaffold.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = 'apps/api/src/Ako.Api/Infrastructure/Data/Migrations';

// (auth, lang) ikilisinin açık/kapalı kombinasyonları; ikisi de açıksa şablonun kendi migration'ları geçerlidir.
const SETS = [
  { auth: false, lang: true },
  { auth: true, lang: false },
  { auth: false, lang: false },
];

const tmp = mkdtempSync(join(tmpdir(), 'ako-variants-'));
try {
  for (const set of SETS) {
    const name = variantName(
      new Set(
        Object.entries(set)
          .filter(([, on]) => !on)
          .map(([f]) => f),
      ),
    );
    const target = join(tmp, name);
    scaffold({
      target,
      template: resolveTemplate(),
      // Web: auth kapalıyken backoffice olamaz; migration'a etkisi yok, en küçük geçerli seçim.
      choices: { name: `variant-${name}`, web: ['site'], mobile: false, ...set },
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

    rmSync(resolve(here, '../variants', name), { recursive: true, force: true });
    cpSync(join(target, MIGRATIONS), resolve(here, '../variants', name, MIGRATIONS), {
      recursive: true,
    });
    console.log(`variants/${name} yenilendi`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
