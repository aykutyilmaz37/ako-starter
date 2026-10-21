import { execFileSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  copyFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyMarkers, hasMarkers } from './markers.mjs';
import {
  buildPlan,
  filterLaunch,
  formatJson,
  isRemoved,
  renderReadme,
  stripE2eJob,
} from './plan.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const VARIANTS_DIR = resolve(here, '../variants');
const MARKED_EXTENSIONS = /\.(cs|csproj|props|slnx|ts|tsx|mjs|yml|yaml|html|css|resx)$/;

function listFilesRecursive(root, dir = '') {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    return entry.isDirectory() ? listFilesRecursive(root, rel) : [rel];
  });
}

/** Noktalı yollarla JSON anahtarı siler; yoksa sessizce geçer. */
const SORTED_PARENTS = ['dependencies', 'devDependencies'];

/** Noktalı yollarla JSON anahtarı ekler/değiştirir; ara nesneler yoksa oluşturulur, bağımlılık listeleri sıralı kalır. */
export function setJsonKeys(text, values) {
  const json = JSON.parse(text);
  for (const [key, value] of Object.entries(values)) {
    const path = key.split('.');
    let node = json;
    for (const part of path.slice(0, -1)) node = node[part] ??= {};
    node[path.at(-1)] = value;
    if (SORTED_PARENTS.includes(path.at(-2))) {
      const sorted = Object.fromEntries(
        Object.entries(node).sort(([a], [b]) => a.localeCompare(b)),
      );
      for (const k of Object.keys(node)) delete node[k];
      Object.assign(node, sorted);
    }
  }
  return `${formatJson(json)}\n`;
}

/**
 * Düz (noktalı) anahtarlı JSON'dan anahtar siler: `*` ile biten desen önek, diğerleri tam eşleşir.
 * Yerelleştirme sözlükleri böyledir (`"home.hero.title": "…"`), `removeJsonKeys`'in yol mantığına uymaz.
 */
export function removeFlatKeys(text, patterns) {
  const json = JSON.parse(text);
  const matches = (key) =>
    patterns.some((p) => (p.endsWith('*') ? key.startsWith(p.slice(0, -1)) : key === p));
  for (const key of Object.keys(json)) if (matches(key)) delete json[key];
  return `${formatJson(json)}\n`;
}

export function removeJsonKeys(text, keys) {
  const json = JSON.parse(text);
  for (const key of keys) {
    const path = key.split('.');
    let node = json;
    for (const part of path.slice(0, -1)) node = node?.[part];
    if (node && typeof node === 'object') delete node[path.at(-1)];
  }
  return `${formatJson(json)}\n`;
}

/** Yayınlanan pakette `template/` yanında durur; depodan çalışınca deponun kökü kullanılır. */
export function resolveTemplate(explicit) {
  if (explicit) return resolve(explicit);
  const bundled = resolve(here, '../template');
  if (existsSync(bundled)) return bundled;
  return resolve(here, '../../..');
}

/** Şablon dosyaları: git deposuysa izlenenler (node_modules, bin/obj gelmez), değilse klasörü gezer. */
export function listTemplateFiles(root) {
  if (existsSync(join(root, '.git'))) {
    const out = execFileSync('git', ['ls-files', '-z'], {
      cwd: root,
      maxBuffer: 64 * 1024 * 1024,
    }).toString('utf8');
    return out.split('\0').filter((file) => file && existsSync(join(root, file)));
  }
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(rel);
      else files.push(rel);
    }
  };
  walk('');
  return files;
}

export function scaffold({ target, template, choices, skipVariants = false, log = () => {} }) {
  const plan = buildPlan(choices);
  const files = listTemplateFiles(template).filter((file) => !isRemoved(file, plan.remove));

  for (const file of files) {
    const from = join(template, file);
    const to = join(target, file);
    mkdirSync(dirname(to), { recursive: true });
    if (plan.disabled.size > 0 && MARKED_EXTENSIONS.test(file)) {
      const text = readFileSync(from, 'utf8');
      writeFileSync(to, hasMarkers(text) ? applyMarkers(text, plan.disabled, file) : text);
    } else {
      copyFileSync(from, to);
    }
    chmodSync(to, statSync(from).mode);
  }

  // Silinecek klasörlerden alınıp yeni yere konan dosyalar (ör. backend'siz mobil ürün görselleri).
  for (const { from, to } of plan.copy) {
    for (const file of listTemplateFiles(template).filter((f) => f.startsWith(`${from}/`))) {
      const dest = join(target, to, file.slice(from.length + 1));
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(join(template, file), dest);
    }
  }

  // Özelliğe özel hazır dosyalar (ör. auth'suz migration seti) şablonun üstüne yazılır.
  for (const variant of skipVariants ? [] : plan.variants) {
    const root = join(VARIANTS_DIR, variant);
    if (!existsSync(root))
      throw new Error(
        `Varyant bulunamadı: ${root} (pnpm --filter create-ako-app variants ile üretin)`,
      );
    for (const file of listFilesRecursive(root)) {
      const to = join(target, file);
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(join(root, file), to);
    }
  }

  const edit = (file, change) => {
    const path = join(target, file);
    if (existsSync(path)) writeFileSync(path, change(readFileSync(path, 'utf8')));
  };

  for (const { file, keys } of plan.jsonRemove) {
    edit(file, (text) => removeJsonKeys(text, keys));
  }

  for (const { file: dir, keys } of plan.localeRemove) {
    const root = join(target, dir);
    if (!existsSync(root)) continue;
    for (const name of readdirSync(root).filter((f) => f.endsWith('.json'))) {
      edit(`${dir}/${name}`, (text) => removeFlatKeys(text, keys));
    }
  }

  for (const { file, values } of plan.jsonSet) {
    edit(file, (text) => setJsonKeys(text, values));
  }

  edit('package.json', (text) => {
    const pkg = JSON.parse(text);
    pkg.name = choices.name;
    return `${formatJson(pkg)}\n`;
  });
  edit('.claude/launch.json', (text) => filterLaunch(text, plan.launchServers));
  if (!plan.keepE2e) edit('.github/workflows/ci.yml', stripE2eJob);
  writeFileSync(join(target, 'README.md'), renderReadme(choices));

  log(`${files.length} dosya yazıldı.`);
  return plan;
}
