// Özellik kapalı varyantların üretilmiş dosyalarını yeniler: API'nin EF migration setleri ve
// backend'siz mobilin Drizzle migration'ları. Şablondaki model/şema değişince çalıştırılır:
//   pnpm --filter create-ako-app variants              # hepsi
//   pnpm --filter create-ako-app variants --only=drizzle   # yalnız Drizzle (dotnet gerekmez)
//   pnpm --filter create-ako-app variants --only=ef        # tüm EF setleri (hepsi yeni zaman damgasıyla yeniden üretilir!)
//   pnpm --filter create-ako-app variants --set=no-sample,no-sample-no-lang   # yalnız adı geçen EF setleri
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { variantName } from '../src/plan.mjs';
import { resolveTemplate, scaffold } from '../src/scaffold.mjs';

const { values } = parseArgs({
  allowPositionals: true,
  options: { only: { type: 'string' }, set: { type: 'string' } },
});
const onlySets = values.set?.split(',');
const want = (part) =>
  (!values.only || values.only === part) && !(values.set && part === 'drizzle');

const here = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = 'apps/api/src/Ako.Api/Infrastructure/Data/Migrations';

// (auth, misafir, örnek senaryo, lang) açık/kapalı kombinasyonları; hepsi açıksa şablonun kendi migration'ları geçerlidir.
// Auth kapalıyken misafir de yoktur, bu yüzden ayrı set gerekmez.
const SETS = [
  { auth: false, lang: true },
  { auth: true, lang: false },
  { auth: false, lang: false },
  { auth: true, guest: false, lang: true },
  { auth: true, guest: false, lang: false },
  // Örnek senaryo kapalı: Products ve Todos tabloları yok.
  { auth: true, sample: false, lang: true },
  { auth: true, sample: false, lang: false },
  { auth: false, sample: false, lang: true },
  { auth: false, sample: false, lang: false },
  { auth: true, guest: false, sample: false, lang: true },
  { auth: true, guest: false, sample: false, lang: false },
];

/** Backend'siz mobil: şemadan Drizzle migration'larını yeniden üretir (variants/no-backend/apps/mobile/drizzle). */
function refreshNoBackend() {
  const target = join(tmp, 'no-backend');
  scaffold({
    target,
    template: resolveTemplate(),
    choices: { name: 'variant-no-backend', web: [], mobile: true, backend: false },
  });
  const mobile = join(target, 'apps/mobile');
  rmSync(join(mobile, 'drizzle'), { recursive: true, force: true });
  execFileSync('pnpm', ['install', '--no-frozen-lockfile'], { cwd: target, stdio: 'inherit' });
  execFileSync('pnpm', ['exec', 'drizzle-kit', 'generate', '--name', 'initial'], {
    cwd: mobile,
    stdio: 'inherit',
  });
  const dest = resolve(here, '../variants/no-backend/apps/mobile/drizzle');
  rmSync(dest, { recursive: true, force: true });
  cpSync(join(mobile, 'drizzle'), dest, { recursive: true });
  console.log('variants/no-backend/apps/mobile/drizzle yenilendi');
}

const tmp = mkdtempSync(join(tmpdir(), 'ako-variants-'));
try {
  if (want('drizzle')) refreshNoBackend();
  for (const set of want('ef') ? SETS : []) {
    const name = variantName(
      new Set(
        Object.entries(set)
          .filter(([, on]) => !on)
          .map(([f]) => f),
      ),
    );
    if (onlySets && !onlySets.includes(name)) continue;
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
