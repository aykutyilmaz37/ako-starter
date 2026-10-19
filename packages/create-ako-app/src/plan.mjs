// Seçimlerden "ne silinecek / ne değişecek" kararı. Dosya sistemine dokunmaz, bu yüzden birim testle sınanır.

export const WEB_APPS = ['site', 'backoffice'];

/** Şablonun kendisine ait olan, üretilen projeye hiç girmeyen yollar. */
const TEMPLATE_ONLY = ['ROADMAP.md', 'packages/create-ako-app'];

/**
 * @param {{ name: string, web: string[], mobile: boolean }} choices
 * @returns {{ name: string, web: string[], mobile: boolean }}
 */
export function normalizeChoices({ name, web, mobile }) {
  const unknown = web.filter((app) => !WEB_APPS.includes(app));
  if (unknown.length > 0) {
    throw new Error(
      `Bilinmeyen web uygulaması: ${unknown.join(', ')} (geçerli: ${WEB_APPS.join(', ')})`,
    );
  }
  if (web.length === 0 && !mobile) {
    throw new Error('En az bir uygulama seçilmeli: web (site, backoffice) ya da mobil.');
  }
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
    throw new Error(
      `Geçersiz proje adı "${name}": küçük harf, rakam, "-", "_" ve "." kullanılabilir.`,
    );
  }
  return { name, web: WEB_APPS.filter((app) => web.includes(app)), mobile };
}

/**
 * @param {{ name: string, web: string[], mobile: boolean }} choices
 */
export function buildPlan(choices) {
  const { web, mobile } = normalizeChoices(choices);
  const remove = [...TEMPLATE_ONLY];

  for (const app of WEB_APPS) {
    if (!web.includes(app)) remove.push(`apps/web/${app}`);
  }
  if (web.length === 0) {
    // Web yoksa BFF paketi de gereksiz (yalnızca web uygulamaları kullanır).
    remove.push('apps/web', 'packages/web-core');
  }
  if (!mobile) remove.push('apps/mobile');

  // Duman testi iki web uygulamasını birlikte çalıştırır; biri yoksa config'i bozulur. Şimdilik tümüyle çıkar.
  const keepE2e = web.length === WEB_APPS.length;
  if (!keepE2e) remove.push('packages/e2e');

  return {
    remove,
    keepE2e,
    /** `.claude/launch.json` içinde kalacak sunucular. */
    launchServers: ['api', ...web],
  };
}

/** Çıkarılan yollardan birinin altında mı? */
export function isRemoved(file, remove) {
  return remove.some((path) => file === path || file.startsWith(`${path}/`));
}

/** CI iş akışından `e2e` işini çıkarır (dosyanın son işidir). */
export function stripE2eJob(yaml) {
  const index = yaml.search(/^ {2}e2e:/m);
  return index === -1 ? yaml : `${yaml.slice(0, index).trimEnd()}\n`;
}

export function filterLaunch(launchJson, keep) {
  const launch = JSON.parse(launchJson);
  launch.configurations = launch.configurations.filter((c) => keep.includes(c.name));
  return `${JSON.stringify(launch, null, 2)}\n`;
}

export function renderReadme({ name, web, mobile }) {
  const lines = [
    `# ${name}`,
    '',
    'Üretici: `create-ako-app` (ako-starter). Mimari kararlar için [DECISIONS.md](DECISIONS.md).',
    '',
  ];
  lines.push('## Uygulamalar', '', '- `apps/api`: .NET 10 API');
  if (web.includes('site')) lines.push('- `apps/web/site`: herkese açık web sitesi (port 5173)');
  if (web.includes('backoffice')) lines.push('- `apps/web/backoffice`: yönetim paneli (port 5174)');
  if (mobile) lines.push('- `apps/mobile`: Expo mobil uygulaması');
  lines.push(
    '',
    '## Çalıştırma',
    '',
    '```bash',
    'pnpm install',
    'pnpm db:up                 # Postgres + Mailpit + Aspire Dashboard (Docker)',
    'pnpm --filter @ako/api dev # http://localhost:5165',
  );
  if (web.includes('site')) lines.push('pnpm --filter @ako/web-site dev');
  if (web.includes('backoffice'))
    lines.push('pnpm --filter @ako/web-backoffice dev   # admin@ako.local / Admin123!');
  if (mobile) lines.push('pnpm --filter @ako/mobile dev');
  lines.push(
    '```',
    '',
    '## Doğrulama',
    '',
    '```bash',
    'pnpm generate:check && pnpm typecheck && pnpm lint && pnpm build && pnpm test',
    'dotnet test apps/api/Ako.slnx',
    '```',
    '',
  );
  return lines.join('\n');
}
