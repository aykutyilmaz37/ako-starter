// Seçimlerden "ne silinecek / ne değişecek" kararı. Dosya sistemine dokunmaz, bu yüzden birim testle sınanır.

export const WEB_APPS = ['site', 'backoffice'];

/** Şablonun kendisine ait olan, üretilen projeye hiç girmeyen yollar. */
const TEMPLATE_ONLY = ['ROADMAP.md', 'packages/create-ako-app'];

/** Auth kapalıyken silinen yollar (API tarafı). İstemci tarafı sonraki adımda eklenir. */
const API = 'apps/api/src/Ako.Api';
const AUTH_PATHS = [
  `${API}/Features/Auth`,
  `${API}/Features/Todos`,
  `${API}/Features/Products/Actions/Admin`,
  `${API}/Features/Localization/Actions/Admin`,
  `${API}/Infrastructure/AdminEndpoints.cs`,
  `${API}/Infrastructure/Email`,
  `${API}/Resources/EmailTemplates`,
  `${API}/Common/GuestDataMerger.cs`,
  // Migration'lar Identity tablolarını içerir; auth'suz set variants/no-auth altından gelir.
  `${API}/Infrastructure/Data/Migrations`,
  'apps/api/tests/Ako.Api.Tests/AdminTests.cs',
  'apps/api/tests/Ako.Api.Tests/AuthTests.cs',
  'apps/api/tests/Ako.Api.Tests/EmailCodeTests.cs',
  'apps/api/tests/Ako.Api.Tests/EmailTemplateTests.cs',
  'apps/api/tests/Ako.Api.Tests/GuestTests.cs',
  'apps/api/tests/Ako.Api.Tests/TodosTests.cs',
  // Ürün testleri ürünü admin ucuyla oluşturur; yönetim yoksa anlamlı karşılığı kalmaz.
  'apps/api/tests/Ako.Api.Tests/ProductsTests.cs',
  // Site: giriş/kayıt/liste sayfaları ve oturum bilgisini okuyan yardımcılar.
  'apps/web/site/app/features/auth',
  'apps/web/site/app/features/todos',
  'apps/web/site/app/features/products/hooks/use-add-to-list.ts',
  'apps/web/site/app/shared/use-me.ts',
  // Mobil: giriş ekranları, oturum, sosyal giriş, alışveriş listesi (Todos) ve token deposu.
  'apps/mobile/app/(auth)',
  'apps/mobile/app/(tabs)/list.tsx',
  'apps/mobile/lib/session.tsx',
  'apps/mobile/lib/social-login.ts',
  'apps/mobile/lib/todos.ts',
  'apps/mobile/lib/token-store.ts',
  'apps/mobile/components/auth-screen.tsx',
  'apps/mobile/components/social-button.tsx',
  'apps/mobile/components/offline-screen.tsx',
];

/** Auth kapalıyken ayar dosyalarından çıkarılan anahtarlar (noktalı yol). */
const AUTH_JSON_KEYS = [
  {
    file: 'apps/mobile/package.json',
    keys: [
      'dependencies.@react-native-google-signin/google-signin',
      'dependencies.expo-apple-authentication',
    ],
  },
  { file: `${API}/appsettings.json`, keys: ['Auth', 'Api.EnableAdminEndpoints'] },
  { file: `${API}/appsettings.Development.json`, keys: ['Auth', 'Api.EnableAdminEndpoints'] },
];

/**
 * @param {{ name: string, web: string[], mobile: boolean }} choices
 * @returns {{ name: string, web: string[], mobile: boolean, auth: boolean }}
 */
export function normalizeChoices({ name, web, mobile, auth = true }) {
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
  if (!auth && web.includes('backoffice')) {
    throw new Error(
      'Auth kapalıyken backoffice olamaz (yönetim girişi gerekir). --web=site ya da --no-web kullanın.',
    );
  }
  return { name, web: WEB_APPS.filter((app) => web.includes(app)), mobile, auth };
}

/**
 * @param {{ name: string, web: string[], mobile: boolean, auth?: boolean }} choices
 */
export function buildPlan(choices) {
  const { web, mobile, auth } = normalizeChoices(choices);
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

  const disabled = new Set();
  const variants = [];
  const jsonRemove = [];
  if (!auth) {
    disabled.add('auth');
    variants.push('no-auth');
    remove.push(...AUTH_PATHS);
    jsonRemove.push(...AUTH_JSON_KEYS);
  }

  return {
    remove,
    disabled,
    variants,
    jsonRemove,
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
  return formatJson(launch);
}

/** Prettier'ın JSON çıktısına yakın biçim: sığan diziler tek satırda kalır (CI `format:check` değişmez). */
export function formatJson(value, indent = '', lead = 0, width = 100) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  const isArray = Array.isArray(value);
  const entries = isArray ? value : Object.entries(value);
  if (entries.length === 0) return isArray ? '[]' : '{}';
  if (isArray && value.every((v) => v === null || typeof v !== 'object')) {
    const inline = `[${value.map((v) => JSON.stringify(v)).join(', ')}]`;
    if (indent.length + lead + inline.length <= width) return inline;
  }
  const inner = `${indent}  `;
  const body = isArray
    ? value.map((v) => `${inner}${formatJson(v, inner, 0, width)}`)
    : entries.map(([k, v]) => {
        const key = `${JSON.stringify(k)}: `;
        return `${inner}${key}${formatJson(v, inner, key.length, width)}`;
      });
  const [open, close] = isArray ? ['[', ']'] : ['{', '}'];
  return `${open}\n${body.join(',\n')}\n${indent}${close}`;
}

export function renderReadme({ name, web, mobile, auth = true }) {
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
  if (!auth)
    lines.push(
      '',
      'Bu projede **auth yok**: giriş, kayıt, misafir, Todos ve yönetim (`/admin`) uçları çıkarıldı.',
    );
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
