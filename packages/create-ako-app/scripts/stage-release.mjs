// Release iş akışının yayın adımı (`pnpm --filter create-ako-app release`): paketin npm'de
// olmayan sürümünü TASLAK olarak yükler (`npm stage publish`). Taslak, npmjs.com'da
// (Staged Packages → Approve) ya da `npm stage approve <id>` ile 2FA'yla onaylanınca yayınlanır.
//
// Neden `changeset publish` değil: changesets taslak yüklemeyi bilmiyor.
// Neden önce `npm pack`: prepack `template/`'i üretir, postpack siler (npm stage publish bir
// tarball yükler). `pnpm pack` DEĞİL: kök .gitignore'u uygulayıp `bin/`'i ve şablonun lockfile'ını
// düşürdü, 0.1.1 komutsuz yayınlandı. Paketin `workspace:*` bağımlılığı yok, pnpm'e gerek yok.
// Yüklemeden önce tarball'da zorunlu dosyalar denetlenir (REQUIRED).
//
// Kimlik: GitHub OIDC (trusted publishing); token yok, provenance npm'ce eklenir.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// changesets/action v2, yayın betiğinin `CHANGESETS_OUTPUT` dosyasına (ndjson `git-tag` olayları)
// yazmasını bekler. Taslak henüz yayın değil: olay yazılmaz → action etiket / GitHub Release açmaz.
if (process.env.CHANGESETS_OUTPUT) writeFileSync(process.env.CHANGESETS_OUTPUT, '');

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    ...opts,
  }).trim();

/** Bu sürüm npm'de yayınlanmış mı? (404 → hayır) */
function isPublished(name, version) {
  try {
    return (
      run('npm', ['view', `${name}@${version}`, 'version'], {
        stdio: ['ignore', 'pipe', 'ignore'],
      }) === version
    );
  } catch {
    return false;
  }
}

/** Bu sürüm onay bekleyen bir taslak olarak zaten var mı? Okunamazsa `null`. */
function isStaged(name, version) {
  try {
    const list = JSON.parse(
      run('npm', ['stage', 'list', name, '--json'], { stdio: ['ignore', 'pipe', 'ignore'] }) ||
        '[]',
    );
    const entries = Array.isArray(list) ? list : Object.values(list).flat();
    return entries.some((e) => e && (e.version === version || e.packageVersion === version));
  } catch {
    return null;
  }
}

const { name, version } = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'));
if (isPublished(name, version)) {
  console.log(`= ${name}@${version} npm'de yayınlanmış; yüklenecek yeni sürüm yok.`);
  process.exit(0);
}
const already = isStaged(name, version);
if (already) {
  console.log(`= ${name}@${version} zaten taslakta, onay bekliyor.`);
  process.exit(0);
}
if (already === null) console.log(`! ${name}: taslak listesi okunamadı, yine de yükleniyor.`);

const outDir = mkdtempSync(join(tmpdir(), 'create-ako-app-stage-'));
const tarball = join(
  outDir,
  run('npm', ['pack', '--pack-destination', outDir], { cwd: pkg }).split('\n').pop(),
);

// Eksik paket bir daha npm'e gitmesin: komut, şablon ve lockfile'ı yoksa yükleme yapılmaz.
const { bin } = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'));
const REQUIRED = [
  ...Object.values(bin).map((file) => file.replace(/^\.\//, '')),
  'LICENSE',
  'template/package.json',
  'template/pnpm-lock.yaml',
];
const packed = new Set(
  run('tar', ['-tzf', tarball])
    .split('\n')
    .map((line) => line.replace(/^package\//, '')),
);
const missing = REQUIRED.filter((file) => !packed.has(file));
if (missing.length > 0) {
  console.error(
    `✖ ${name}@${version} tarball'ında eksik dosya: ${missing.join(', ')}. Yüklenmedi.`,
  );
  process.exit(1);
}
try {
  // Çıktı doğrudan log'a gider (stdio: inherit); `run` kullanılmaz, çünkü o zaman dönüş null olur ve
  // `.trim()` başarılı yüklemeyi hata sanıp "yüklenemedi" yazdırıyordu.
  execFileSync('npm', ['stage', 'publish', tarball, '--access', 'public', '--tag', 'latest'], {
    stdio: 'inherit',
  });
} catch (error) {
  // Liste okunamadıysa en olası neden, sürümün zaten taslakta beklemesi: onaylanana kadar her
  // main push'unda iş akışı kırmızıya dönmesin. Liste okunduysa gerçek hata.
  if (already !== null) throw error;
  console.log(
    `! ${name}@${version} yüklenemedi (büyük ihtimalle zaten taslakta); npmjs.com → Staged Packages'a bakın.`,
  );
  process.exit(0);
}
console.log(
  `+ ${name}@${version} taslak olarak yüklendi; npmjs.com → Staged Packages'tan onaylayın.`,
);
