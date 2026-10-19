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
import { buildPlan, filterLaunch, isRemoved, renderReadme, stripE2eJob } from './plan.mjs';

const here = dirname(fileURLToPath(import.meta.url));

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

export function scaffold({ target, template, choices, log = () => {} }) {
  const plan = buildPlan(choices);
  const files = listTemplateFiles(template).filter((file) => !isRemoved(file, plan.remove));

  for (const file of files) {
    const from = join(template, file);
    const to = join(target, file);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
    chmodSync(to, statSync(from).mode);
  }

  const edit = (file, change) => {
    const path = join(target, file);
    if (existsSync(path)) writeFileSync(path, change(readFileSync(path, 'utf8')));
  };

  edit('package.json', (text) => {
    const pkg = JSON.parse(text);
    pkg.name = choices.name;
    return `${JSON.stringify(pkg, null, 2)}\n`;
  });
  edit('.claude/launch.json', (text) => filterLaunch(text, plan.launchServers));
  if (!plan.keepE2e) edit('.github/workflows/ci.yml', stripE2eJob);
  writeFileSync(join(target, 'README.md'), renderReadme(choices));

  log(`${files.length} dosya yazıldı.`);
  return plan;
}
