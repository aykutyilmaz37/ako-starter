// npm paketine girecek `template/` klasörünü deponun izlenen dosyalarından üretir (prepack; --clean: postpack).
import { rmSync, mkdirSync, copyFileSync, chmodSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEMPLATE_ONLY, isRemoved } from '../src/plan.mjs';
import { PACKED_GITIGNORE, listTemplateFiles } from '../src/scaffold.mjs';

const pkg = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(pkg, '../..');
const out = join(pkg, 'template');
rmSync(out, { recursive: true, force: true });
// postpack: paketlemeden sonra temizlenir; yoksa depodan çalışan CLI/verify bayat template/'i kullanır.
if (process.argv.includes('--clean')) {
  rmSync(join(pkg, 'LICENSE'), { force: true });
  process.exit(0);
}
for (const file of listTemplateFiles(root)) {
  // pnpm-lock.yaml pakete girer: üretilen proje `verify`'da sınanan sürümlerle kurulur (finalize budar).
  if (isRemoved(file, TEMPLATE_ONLY)) continue;
  // npm `.gitignore`'u paketten düşürür (ve iç içe olanları kural sayar); scaffold eski adına döndürür.
  const packed = basename(file) === '.gitignore' ? join(dirname(file), PACKED_GITIGNORE) : file;
  const to = join(out, packed);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(join(root, file), to);
  chmodSync(to, statSync(join(root, file)).mode);
}
// npm lisansı yalnız paket klasöründen alır; kökteki LICENSE şablona girmez (TEMPLATE_ONLY).
copyFileSync(join(root, 'LICENSE'), join(pkg, 'LICENSE'));
console.log('template/ hazır');
