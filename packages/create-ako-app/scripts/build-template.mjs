// npm paketine girecek `template/` klasörünü deponun izlenen dosyalarından üretir (prepack).
import { rmSync, mkdirSync, copyFileSync, chmodSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isRemoved } from '../src/plan.mjs';
import { listTemplateFiles } from '../src/scaffold.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../template');
rmSync(out, { recursive: true, force: true });
for (const file of listTemplateFiles(root)) {
  if (isRemoved(file, ['packages/create-ako-app', 'ROADMAP.md', 'pnpm-lock.yaml'])) continue;
  const to = join(out, file);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(join(root, file), to);
  chmodSync(to, statSync(join(root, file)).mode);
}
console.log('template/ hazır');
