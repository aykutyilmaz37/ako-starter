import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { WEB_APPS, normalizeChoices } from './plan.mjs';
import { resolveTemplate, scaffold } from './scaffold.mjs';

const HELP = `create-ako-app <klasör> [seçenekler]

  --web=site,backoffice|none   Web uygulamaları (varsayılan: ikisi)
  --mobile / --no-mobile       Expo mobil uygulaması (varsayılan: evet)
  --install / --no-install     Üretimden sonra pnpm install (varsayılan: evet)
  --template=<klasör>          Şablon kaynağı (varsayılan: paketlenmiş şablon ya da depo)
  -y, --yes                    Soru sorma, belirtilmeyenlerde varsayılanı kullan
  -h, --help
`;

async function ask(rl, question, fallback) {
  const answer = (await rl.question(`${question} [${fallback ? 'E/h' : 'e/H'}] `))
    .trim()
    .toLowerCase();
  if (answer === '') return fallback;
  return ['e', 'evet', 'y', 'yes'].includes(answer);
}

export async function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      web: { type: 'string' },
      mobile: { type: 'boolean' },
      'no-mobile': { type: 'boolean' },
      install: { type: 'boolean' },
      'no-install': { type: 'boolean' },
      template: { type: 'string' },
      yes: { type: 'boolean', short: 'y' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) return console.log(HELP);

  const interactive = !values.yes && process.stdin.isTTY;
  const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
  try {
    let dir = positionals[0];
    if (!dir) {
      if (!rl) throw new Error(`Klasör adı gerekli.\n\n${HELP}`);
      dir = (await rl.question('Proje klasörü: ')).trim();
    }
    const target = resolve(dir);
    if (existsSync(target) && readdirSync(target).length > 0)
      throw new Error(`${target} boş değil.`);

    let web;
    if (values.web !== undefined) {
      web =
        values.web === 'none'
          ? []
          : values.web
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
    } else if (rl) {
      web = [];
      for (const app of WEB_APPS) if (await ask(rl, `Web: ${app} olsun mu?`, true)) web.push(app);
    } else web = WEB_APPS;

    let mobile = values.mobile ? true : values['no-mobile'] ? false : undefined;
    if (mobile === undefined) mobile = rl ? await ask(rl, 'Mobil (Expo) olsun mu?', true) : true;

    const choices = normalizeChoices({ name: basename(target), web, mobile });
    const plan = scaffold({
      target,
      template: resolveTemplate(values.template),
      choices,
      log: console.log,
    });
    console.log(
      `Silinenler: ${plan.remove.filter((p) => p !== 'ROADMAP.md' && p !== 'packages/create-ako-app').join(', ') || '-'}`,
    );

    const install = values.install
      ? true
      : values['no-install']
        ? false
        : interactive
          ? await ask(rl, 'pnpm install çalıştırılsın mı?', true)
          : false;
    if (install) execFileSync('pnpm', ['install'], { cwd: target, stdio: 'inherit' });

    console.log(`\n✔ Hazır: ${target}\n  cd ${dir}${install ? '' : ' && pnpm install'}`);
  } finally {
    rl?.close();
  }
}
