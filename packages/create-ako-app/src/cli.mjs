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
  --guest / --no-guest         Misafir girişi: mobilde açılışta anonim hesap, kayıtta veri taşınır (varsayılan: evet; auth kapalıyken yok)
  --social / --no-social       Sosyal giriş: Google, Apple, GitHub… (varsayılan: evet; auth kapalıyken yok)
  --sample / --no-sample       Örnek senaryo (Akı Kahve): ürünler, alışveriş listesi, görseller, seed (varsayılan: evet; backend yokken kapatılamaz)
  --backend / --no-backend     API (varsayılan: evet). Hayır: veri cihazda (SQLite), yalnız mobilde; auth ve web olmaz
  --install / --no-install     Üretimden sonra pnpm install (varsayılan: evet)
  --no-git                     git init + ilk commit yapma
  --lang / --no-lang           Çoklu dil: dil seçici, adres öneki, çeviri yönetimi (varsayılan: evet)
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
      backend: { type: 'boolean' },
      'no-backend': { type: 'boolean' },
      guest: { type: 'boolean' },
      'no-guest': { type: 'boolean' },
      social: { type: 'boolean' },
      'no-social': { type: 'boolean' },
      sample: { type: 'boolean' },
      'no-sample': { type: 'boolean' },
      lang: { type: 'boolean' },
      'no-lang': { type: 'boolean' },
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

    const backendFlag = values.backend ? true : values['no-backend'] ? false : undefined;
    const authFlag = values.auth ? true : values['no-auth'] ? false : undefined;
    if (backendFlag === false && authFlag === true)
      throw new Error(
        '--no-backend ile --auth birlikte kullanılamaz (sunucu yoksa oturum da yok).',
      );

    let lang = values.lang ? true : values['no-lang'] ? false : undefined;

    let web;
    if (values.web !== undefined) {
      web =
        values.web === 'none'
          ? []
          : values.web
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
    } else if (backendFlag === false) {
      web = [];
    } else if (rl) {
      web = [];
      for (const app of WEB_APPS) {
        if (app === 'backoffice' && authFlag === false) continue; // yönetim girişi auth ister
        if (await ask(rl, `Web: ${app} olsun mu?`, true)) web.push(app);
      }
    } else web = authFlag === false ? WEB_APPS.filter((app) => app !== 'backoffice') : WEB_APPS;

    let mobile = values.mobile ? true : values['no-mobile'] ? false : undefined;
    if (mobile === undefined) mobile = rl ? await ask(rl, 'Mobil (Expo) olsun mu?', true) : true;

    // "Yok" yalnızca yalnız-mobilde sunulur (web BFF'i API'ye bağlıdır).
    let backend = backendFlag;
    if (backend === undefined)
      backend =
        rl && web.length === 0 && mobile
          ? await ask(rl, 'Backend (API) olsun mu? Hayır: veri yalnızca cihazda (SQLite)', true)
          : true;

    // Backend yoksa auth sorulmaz (kapalı sayılır); backoffice varsa yönetim girişi için açık kalır.
    let auth = authFlag;
    if (!backend) auth = false;
    else if (auth === undefined)
      auth = web.includes('backoffice')
        ? true
        : rl
          ? await ask(rl, 'Auth (giriş, kayıt, misafir, yönetim) olsun mu?', true)
          : true;

    // Misafir auth'un parçası: auth yoksa sorulmaz. Seçenekle zorlanırsa çelişki hatası verilir.
    let guest = values.guest ? true : values['no-guest'] ? false : undefined;
    if (guest && !auth)
      throw new Error(
        '--guest için auth gerekir (--no-auth ya da --no-backend ile birlikte olmaz).',
      );
    if (guest === undefined)
      guest =
        auth && rl
          ? await ask(
              rl,
              'Misafir girişi olsun mu? (mobil açılışta anonim hesap, kayıtta veri taşınır)',
              true,
            )
          : true;

    // Sosyal giriş de auth'un parçası: auth yoksa sorulmaz.
    let social = values.social ? true : values['no-social'] ? false : undefined;
    if (social && !auth)
      throw new Error(
        '--social için auth gerekir (--no-auth ya da --no-backend ile birlikte olmaz).',
      );
    if (social === undefined)
      social =
        auth && rl ? await ask(rl, 'Sosyal giriş (Google, Apple, GitHub…) olsun mu?', true) : true;

    // Backend'siz projede yerel veri katmanı örneğin kendisidir: kapatılamaz, sorulmaz.
    let sample = values.sample ? true : values['no-sample'] ? false : undefined;
    if (sample === undefined)
      sample =
        backend && rl
          ? await ask(rl, 'Örnek senaryo (Akı Kahve: ürünler, alışveriş listesi) kalsın mı?', true)
          : true;

    if (lang === undefined) lang = rl ? await ask(rl, 'Çoklu dil olsun mu?', true) : true;

    const choices = normalizeChoices({
      name: basename(target),
      web,
      mobile,
      auth,
      guest,
      social,
      sample,
      lang,
      backend,
    });
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
      `\n✔ Hazır: ${target}\n  cd ${dir}${install ? '' : ` && pnpm install${plan.needsGenerate ? ' && pnpm generate' : ''}`}`,
    );
  } finally {
    rl?.close();
  }
}
