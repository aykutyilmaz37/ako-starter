import { existsSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { finalize } from './finalize.mjs';
import { WEB_APPS, normalizeChoices } from './plan.mjs';
import { resolveTemplate, scaffold } from './scaffold.mjs';

const HELP = `create-ako-app <klasör> [seçenekler]

  --web=site,backoffice|none   Web uygulamaları (varsayılan: ikisi)
  --mobile / --no-mobile       Expo mobil uygulaması (varsayılan: evet)
  --auth / --no-auth           Giriş, kayıt, misafir, Todos, yönetim (varsayılan: evet; kapalıyken backoffice olamaz)
  --install / --no-install     Üretimden sonra pnpm install (varsayılan: evet)
  --no-git                     git init + ilk commit yapma
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
      auth: { type: 'boolean' },
      'no-auth': { type: 'boolean' },
      install: { type: 'boolean' },
      'no-install': { type: 'boolean' },
      'no-git': { type: 'boolean' },
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

    let auth = values.auth ? true : values['no-auth'] ? false : undefined;
    if (auth === undefined)
      auth = rl ? await ask(rl, 'Auth (giriş, kayıt, misafir, yönetim) olsun mu?', true) : true;

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
      for (const app of WEB_APPS) {
        if (app === 'backoffice' && !auth) continue; // yönetim girişi auth ister
        if (await ask(rl, `Web: ${app} olsun mu?`, true)) web.push(app);
      }
    } else web = auth ? WEB_APPS : WEB_APPS.filter((app) => app !== 'backoffice');

    let mobile = values.mobile ? true : values['no-mobile'] ? false : undefined;
    if (mobile === undefined) mobile = rl ? await ask(rl, 'Mobil (Expo) olsun mu?', true) : true;

    const choices = normalizeChoices({ name: basename(target), web, mobile, auth });
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
    finalize({ target, plan, install, git: !values['no-git'] });

    console.log(
      `\n✔ Hazır: ${target}\n  cd ${dir}${install ? '' : ` && pnpm install${plan.disabled.size > 0 ? ' && pnpm generate' : ''}`}`,
    );
  } finally {
    rl?.close();
  }
}
