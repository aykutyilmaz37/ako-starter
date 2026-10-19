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

const MIGRATIONS_DIR = `${API}/Infrastructure/Data/Migrations`;

/** Backend'siz mobilde silinen yollar: API ve ona bağlanan her şey (kök dosyalar dahil). */
const BACKEND_PATHS = [
  'apps/api',
  'packages/api-client',
  'packages/web-core',
  'packages/e2e',
  // Yalnızca site/backoffice ve auth'lu mobil kullanır (sosyal giriş markaları).
  'packages/shared',
  'compose.yaml',
  // API'ye bağlanan mobil dosyalar: istemci yapılandırması ve adres.
  'apps/mobile/lib/api.ts',
  'apps/mobile/lib/config.ts',
];

/** Ürün görselleri API'nin wwwroot'unda durur; backend'siz mobil bunları uygulamaya paketler. */
const COPY_ASSETS = [
  {
    from: `${API}/wwwroot/images/products`,
    to: 'apps/mobile/assets/products',
  },
];

/** Çoklu dil kapalıyken silinen yollar. */
const LANG_PATHS = [
  `${API}/Features/Localization`,
  `${API}/Resources/Localization/Messages.en.resx`,
  `${API}/Resources/Localization/Messages.de.resx`,
  'apps/api/tests/Ako.Api.Tests/LocalizationTests.cs',
  // Dil seçici, adres öneki ve çeviri yönetimi; sözlük yalnızca varsayılan dil dosyasından gelir.
  'apps/web/site/app/shared/i18n/lang-layout.tsx',
  'apps/web/site/app/shared/language-switcher.tsx',
  'apps/web/site/app/locales/en.json',
  'apps/web/site/app/locales/de.json',
  'apps/web/backoffice/app/features/localization',
  'apps/web/backoffice/app/shared/language-switcher.tsx',
  'apps/web/backoffice/app/locales/en.json',
  'apps/web/backoffice/app/locales/de.json',
  'apps/mobile/locales/en.json',
  'apps/mobile/locales/de.json',
];

/** Backend'siz mobilde ayar dosyalarından çıkarılan anahtarlar (noktalı yol). */
const NO_BACKEND_JSON_REMOVE = [
  {
    file: 'package.json',
    keys: ['scripts.db:up', 'scripts.db:down', 'scripts.generate', 'scripts.generate:check'],
  },
  {
    file: 'apps/mobile/package.json',
    keys: [
      'dependencies.@ako/api-client',
      'dependencies.@ako/shared',
      'dependencies.@tanstack/react-query',
      'dependencies.expo-secure-store',
      'dependencies.expo-web-browser',
    ],
  },
  { file: 'turbo.json', keys: ['tasks.generate', 'tasks.generate:check'] },
];

/** Backend'siz mobilde ayar dosyalarına eklenen/değiştirilen anahtarlar: yerel veri (SQLite + Drizzle). */
const NO_BACKEND_JSON_SET = [
  {
    file: 'apps/mobile/package.json',
    values: {
      'scripts.db:generate': 'drizzle-kit generate',
      'dependencies.drizzle-orm': '^0.45.4',
      'dependencies.expo-sqlite': '~57.0.4',
      'devDependencies.babel-plugin-inline-import': '^3.0.0',
      'devDependencies.babel-preset-expo': '~57.0.16',
      'devDependencies.drizzle-kit': '^0.31.11',
    },
  },
  {
    file: 'apps/mobile/app.json',
    values: { 'expo.plugins': ['expo-router', 'expo-sqlite', 'expo-status-bar'] },
  },
  // `generate` görevi (Orval) kalmadı: build ve typecheck yalnızca bağımlı paketleri bekler.
  {
    file: 'turbo.json',
    values: { 'tasks.build.dependsOn': ['^build'], 'tasks.typecheck.dependsOn': ['^build'] },
  },
];

/** Kapalı özellik kümesinden varyant klasörü adı: 'no-auth', 'no-lang', 'no-auth-no-lang'; hiçbiri kapalıysa null. */
export function variantName(disabled) {
  const off = ['auth', 'lang'].filter((f) => disabled.has(f));
  return off.length === 0 ? null : off.map((f) => `no-${f}`).join('-');
}

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
export function normalizeChoices({ name, web, mobile, auth = true, lang = true, backend = true }) {
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
  if (!backend && web.length > 0) {
    throw new Error(
      "Backend yokken web uygulaması olamaz (web BFF'i API'ye bağlıdır). --no-web kullanın.",
    );
  }
  // Backend'siz projede oturum açılacak bir sunucu yoktur: auth (misafir, sosyal giriş dahil) kapalı sayılır.
  return {
    name,
    web: WEB_APPS.filter((app) => web.includes(app)),
    mobile,
    auth: backend ? auth : false,
    lang,
    backend,
  };
}

/**
 * @param {{ name: string, web: string[], mobile: boolean, auth?: boolean }} choices
 */
export function buildPlan(choices) {
  const { web, mobile, auth, lang, backend } = normalizeChoices(choices);
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
  const keepE2e = web.length === WEB_APPS.length && lang;
  if (!keepE2e) remove.push('packages/e2e');

  const disabled = new Set();
  const variants = [];
  const jsonRemove = [];
  const jsonSet = [];
  if (!backend) {
    disabled.add('backend');
    remove.push(...BACKEND_PATHS);
    jsonRemove.push(...NO_BACKEND_JSON_REMOVE);
    jsonSet.push(...NO_BACKEND_JSON_SET);
  }
  if (!auth) {
    disabled.add('auth');
    remove.push(...AUTH_PATHS);
    jsonRemove.push(...AUTH_JSON_KEYS);
  }
  if (!lang) {
    disabled.add('lang');
    remove.push(...LANG_PATHS);
  }
  // Türetilmiş işaretler: tek bir seçimle ifade edilemeyen koşullar.
  //  - list: alışveriş listesi API'li sürümde giriş ister, backend'siz sürümde cihazdadır.
  //  - api-lang: sözlük ve dil listesi API'den gelir; dil kapalıysa ya da API yoksa yalnızca paketli dosyalar.
  if (!auth && backend) disabled.add('list');
  if (!lang || !backend) disabled.add('api-lang');

  if (!backend) {
    // Hazır yerel veri katmanı (şema, Drizzle migration'ları, ekranlar): variants/no-backend/.
    variants.push('no-backend');
  } else {
    // Migration'lar yalnızca (auth, lang) ikilisine bağlıdır: hazır set variants/<ad>/ altında.
    const variant = variantName(disabled);
    if (variant) {
      variants.push(variant);
      remove.push(MIGRATIONS_DIR);
    }
  }

  return {
    remove,
    disabled,
    variants,
    jsonRemove,
    jsonSet,
    copy: backend ? [] : COPY_ASSETS,
    backend,
    /** Üretimden sonra `pnpm generate` gerekir mi (API/OpenAPI şablondakinden farklıysa). */
    needsGenerate: backend && (!auth || !lang),
    keepE2e,
    /** `.claude/launch.json` içinde kalacak sunucular. */
    launchServers: backend ? ['api', ...web] : [],
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

export function renderReadme({ name, web, mobile, auth = true, backend = true }) {
  const lines = [
    `# ${name}`,
    '',
    'Üretici: `create-ako-app` (ako-starter). Mimari kararlar için [DECISIONS.md](DECISIONS.md).',
    '',
  ];
  lines.push('## Uygulamalar', '');
  if (backend) lines.push('- `apps/api`: .NET 10 API');
  if (web.includes('site')) lines.push('- `apps/web/site`: herkese açık web sitesi (port 5173)');
  if (web.includes('backoffice')) lines.push('- `apps/web/backoffice`: yönetim paneli (port 5174)');
  if (mobile)
    lines.push(
      backend
        ? '- `apps/mobile`: Expo mobil uygulaması'
        : '- `apps/mobile`: Expo mobil uygulaması (backend yok: veri cihazda, SQLite + Drizzle)',
    );
  if (!backend)
    lines.push(
      '',
      'Bu projede **backend yok**: API, `api-client`, oturum, sosyal giriş ve API sözlüğü çıkarıldı. Katalog uygulamayla paketli JSON, kullanıcının alışveriş listesi cihazdaki SQLite veritabanındadır. Ayrıntı: [apps/mobile/README.md](apps/mobile/README.md).',
    );
  else if (!auth)
    lines.push(
      '',
      'Bu projede **auth yok**: giriş, kayıt, misafir, Todos ve yönetim (`/admin`) uçları çıkarıldı.',
    );
  lines.push('', '## Çalıştırma', '', '```bash', 'pnpm install');
  if (backend)
    lines.push(
      'pnpm db:up                 # Postgres + Mailpit + Aspire Dashboard (Docker)',
      'pnpm --filter @ako/api dev # http://localhost:5165',
    );
  if (web.includes('site')) lines.push('pnpm --filter @ako/web-site dev');
  if (web.includes('backoffice'))
    lines.push('pnpm --filter @ako/web-backoffice dev   # admin@ako.local / Admin123!');
  if (mobile) lines.push('pnpm --filter @ako/mobile dev');
  lines.push('```', '', '## Doğrulama', '', '```bash');
  lines.push(
    backend
      ? 'pnpm generate:check && pnpm typecheck && pnpm lint && pnpm build && pnpm test'
      : 'pnpm typecheck && pnpm lint && pnpm build && pnpm test',
  );
  if (backend) lines.push('dotnet test apps/api/Ako.slnx');
  lines.push('```', '');
  return lines.join('\n');
}
