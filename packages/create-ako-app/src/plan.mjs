// Seçimlerden "ne silinecek / ne değişecek" kararı. Dosya sistemine dokunmaz, bu yüzden birim testle sınanır.

export const WEB_APPS = ['site', 'backoffice'];

/**
 * Şablonun kendisine ait olan, üretilen projeye hiç girmeyen yollar: lisans (proje kendi lisansını
 * seçer) ve create-ako-app'in npm yayın düzeni (changesets, release iş akışı).
 */
export const TEMPLATE_ONLY = [
  'ROADMAP.md',
  'LICENSE',
  '.changeset',
  '.github/workflows/release.yml',
  'packages/create-ako-app',
];

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
  // Mobil: giriş ekranları, auth özelliği (oturum, sosyal giriş, token deposu, bileşenler) ve alışveriş listesi (Todos).
  'apps/mobile/app/(auth)',
  'apps/mobile/app/(tabs)/list.tsx',
  'apps/mobile/features/auth',
  'apps/mobile/features/shopping-list',
];

/** Misafir girişi kapalıyken (auth açık) silinen yollar; auth kapalıyken zaten `AUTH_PATHS` ile gider. */
const GUEST_PATHS = [
  `${API}/Features/Auth/Actions/CreateGuest.cs`,
  `${API}/Features/Auth/Services/GuestAccounts.cs`,
  `${API}/Features/Auth/Services/GuestCleanupService.cs`,
  `${API}/Features/Todos/Data/TodoGuestData.cs`,
  `${API}/Common/GuestDataMerger.cs`,
  'apps/api/tests/Ako.Api.Tests/GuestTests.cs',
];

/**
 * Sosyal giriş kapalıyken (auth açık) silinen yollar; auth/backend kapalıyken zaten gider.
 * Sağlayıcı bazında seçim yoktur: sağlayıcılar ayarla (`Auth:Providers:<Ad>:ClientId`) açılır, ayarsız sağlayıcı etkin olmaz.
 */
const SOCIAL_PATHS = [
  `${API}/Features/Auth/Actions/ExternalLogin.cs`,
  `${API}/Features/Auth/Actions/NativeLogin.cs`,
  `${API}/Features/Auth/Actions/ExchangeCode.cs`,
  `${API}/Features/Auth/Actions/GetProviders.cs`,
  `${API}/Features/Auth/Services/ExternalProviders.cs`,
  `${API}/Features/Auth/Services/ExternalUserResolver.cs`,
  `${API}/Features/Auth/Services/IdTokenValidator.cs`,
  `${API}/Features/Auth/Services/LoginCodeStore.cs`,
  // Marka ikonları/renkleri yalnızca sosyal düğmelerde kullanılır.
  'packages/shared',
  'apps/web/site/app/features/auth/components/social-button.tsx',
  'apps/mobile/features/auth/components/social-button.tsx',
  'apps/mobile/features/auth/social-login.ts',
];

/** Sosyal giriş kapalıyken ayar dosyalarından çıkarılan anahtarlar (noktalı yol). */
const SOCIAL_JSON_KEYS = [
  {
    file: 'apps/mobile/package.json',
    keys: [
      'dependencies.@ako/shared',
      'dependencies.@react-native-google-signin/google-signin',
      'dependencies.expo-apple-authentication',
      'dependencies.expo-web-browser',
    ],
  },
  { file: 'apps/web/site/package.json', keys: ['dependencies.@ako/shared'] },
  { file: `${API}/appsettings.json`, keys: ['Auth.Providers', 'Auth.AllowedReturnUrls'] },
  { file: `${API}/appsettings.Development.json`, keys: ['Auth.AllowedReturnUrls'] },
];

/**
 * Örnek senaryo (Akı Kahve) kapalıyken silinen yollar: Products, Todos, görseller, seed ve onları kullanan ekranlar.
 * Geriye boş iskelet kalır: auth, çoklu dil, kullanıcı yönetimi, ana sayfa, hesap.
 */
const SAMPLE_PATHS = [
  `${API}/Features/Products`,
  `${API}/Features/Todos`,
  `${API}/wwwroot/images`,
  'apps/api/tests/Ako.Api.Tests/ProductsTests.cs',
  'apps/api/tests/Ako.Api.Tests/TodosTests.cs',
  // Site: katalog, liste, ana sayfanın mağaza bölümleri (hero/faydalar/kategoriler/hikâye) ve kategori yardımcıları.
  'apps/web/site/app/features/products',
  'apps/web/site/app/features/todos',
  'apps/web/site/app/features/home/components',
  'apps/web/site/app/shared/catalog.ts',
  'apps/web/site/app/shared/section-heading.tsx',
  // Backoffice: ürün yönetimi ve stok uyarıları.
  'apps/web/backoffice/app/features/products',
  'apps/web/backoffice/app/features/dashboard/components/stock-alerts.tsx',
  'apps/web/backoffice/app/shared/catalog.ts',
  // Mobil: katalog, alışveriş listesi, mağaza/liste sekmeleri, ürün sayfası.
  'apps/mobile/app/(tabs)/shop.tsx',
  'apps/mobile/app/(tabs)/list.tsx',
  'apps/mobile/app/product',
  'apps/mobile/features/catalog',
  'apps/mobile/features/shopping-list',
];

/**
 * Örnek senaryo kapalıyken yerelleştirme dosyalarından çıkarılan anahtarlar. Anahtarlar düz ve noktalıdır;
 * `*` ile biten önek eşleşir, diğerleri tam eşleşir.
 */
const SAMPLE_LOCALE_KEYS = [
  {
    file: 'apps/web/site/app/locales',
    keys: [
      'category.*',
      'stock.*',
      'layout.search',
      'layout.myList',
      'layout.menu.coffee',
      'layout.menu.equipment',
      'layout.menu.accessory',
      'layout.footer.shop',
      'layout.footer.coffee',
      'layout.footer.equipment',
      'layout.footer.accessory',
      'layout.footer.list',
      'home.hero.badge',
      'home.hero.cta*',
      'home.benefits.*',
      'home.featured.*',
      'home.categories.*',
      'home.story.*',
      'products.*',
      'todos.*',
    ],
  },
  {
    file: 'apps/web/backoffice/app/locales',
    keys: [
      'category.*',
      'layout.menu.products',
      'dashboard.newProduct',
      'dashboard.stat.products',
      'dashboard.stat.out',
      'dashboard.stat.low*',
      'dashboard.stockValue*',
      'dashboard.alerts.*',
      'products.*',
    ],
  },
  {
    file: 'apps/mobile/locales',
    keys: [
      'tab.shop',
      'tab.list',
      'category.*',
      'categoryBlurb.*',
      'stock.*',
      'home.hero.badge',
      'home.hero.cta*',
      'home.benefits.*',
      'home.featured.*',
      'home.loadFailed',
      'home.categories.*',
      'home.story.*',
      'shop.*',
      'product.*',
      'list.*',
      'products.*',
    ],
  },
];

const MIGRATIONS_DIR = `${API}/Infrastructure/Data/Migrations`;

/** Backend'siz mobilde silinen yollar: API ve ona bağlanan her şey (kök dosyalar dahil). */
const BACKEND_PATHS = [
  'apps/api',
  'packages/api-client',
  'packages/web-core',
  'packages/e2e',
  'compose.yaml',
  'compose.prod.yaml',
  '.env.prod.example',
  '.dockerignore',
  // API'ye bağlanan mobil dosyalar: istemci yapılandırması ve adres.
  'apps/mobile/shared/lib/api.ts',
  'apps/mobile/shared/lib/config.ts',
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
      'dependencies.@tanstack/react-query',
      'dependencies.expo-secure-store',
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

/** Kapalı özellik kümesinden migration varyantı adı: 'no-auth', 'no-guest-no-sample', 'no-lang'…; hiçbiri kapalı değilse null. */
export function variantName(disabled) {
  // Auth kapalıyken Identity yoktur; misafir de olmayacağından ad yalnızca `no-auth` kalır.
  const off = ['auth', 'guest', 'sample', 'lang'].filter(
    (f) => disabled.has(f) && !(f === 'guest' && disabled.has('auth')),
  );
  return off.length === 0 ? null : off.map((f) => `no-${f}`).join('-');
}

/** Auth kapalıyken ayar dosyalarından çıkarılan anahtarlar (noktalı yol). */
const AUTH_JSON_KEYS = [
  { file: `${API}/appsettings.json`, keys: ['Auth', 'Api.EnableAdminEndpoints'] },
  { file: `${API}/appsettings.Development.json`, keys: ['Auth', 'Api.EnableAdminEndpoints'] },
];

/**
 * @param {{ name: string, web: string[], mobile: boolean }} choices
 * @returns {{ name: string, web: string[], mobile: boolean, auth: boolean }}
 */
export function normalizeChoices({
  name,
  web,
  mobile,
  auth = true,
  guest = true,
  social = true,
  sample = true,
  lang = true,
  backend = true,
}) {
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
  if (!backend && !sample) {
    throw new Error(
      'Backend yokken örnek senaryo kapatılamaz: yerel veri katmanı (SQLite şeması, ekranlar) örneğin kendisidir. --sample ile kullanın.',
    );
  }
  // Backend'siz projede oturum açılacak bir sunucu yoktur: auth (misafir, sosyal giriş dahil) kapalı sayılır.
  return {
    name,
    web: WEB_APPS.filter((app) => web.includes(app)),
    mobile,
    auth: backend ? auth : false,
    // Misafir, auth'un bir parçasıdır: auth yoksa yoktur.
    guest: backend && auth ? guest : false,
    // Sosyal giriş de auth'un parçası: auth yoksa yoktur.
    social: backend && auth ? social : false,
    sample,
    lang,
    backend,
  };
}

/**
 * @param {{ name: string, web: string[], mobile: boolean, auth?: boolean }} choices
 */
export function buildPlan(choices) {
  const { web, mobile, auth, guest, social, sample, lang, backend } = normalizeChoices(choices);
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
  const keepE2e = web.length === WEB_APPS.length && lang && sample;
  if (!keepE2e) remove.push('packages/e2e');

  const disabled = new Set();
  const variants = [];
  const localeRemove = [];
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
  if (!guest) {
    disabled.add('guest');
    // Auth kapalıyken bu yollar zaten silinmiştir; yinelenen kayıt zararsızdır ama listeyi şişirmeyelim.
    if (auth) remove.push(...GUEST_PATHS);
  }
  if (!social) {
    disabled.add('social');
    // Auth/backend kapalıyken yollar zaten silinmiştir; yalnız ayar anahtarları (bağımlılıklar) ortak çıkarılır.
    remove.push(...SOCIAL_PATHS);
    jsonRemove.push(...SOCIAL_JSON_KEYS);
  }
  if (!sample) {
    disabled.add('sample');
    remove.push(...SAMPLE_PATHS);
    localeRemove.push(...SAMPLE_LOCALE_KEYS);
  }
  if (!lang) {
    disabled.add('lang');
    remove.push(...LANG_PATHS);
  }
  // Türetilmiş işaretler: tek bir seçimle ifade edilemeyen koşullar.
  //  - list: alışveriş listesi API'li sürümde giriş ister, backend'siz sürümde cihazdadır.
  //  - api-lang: sözlük ve dil listesi API'den gelir; dil kapalıysa ya da API yoksa yalnızca paketli dosyalar.
  //  - todos: kullanıcıya özel örnek veri (Todos); auth ya da örnek kapalıysa yoktur.
  if ((!auth && backend) || !sample) disabled.add('list');
  if (!auth || !sample) disabled.add('todos');
  if (!lang || !backend) disabled.add('api-lang');
  //  - site / backoffice: seçilmeyen web uygulamasının satırları (ör. compose.prod.yaml servisleri).
  for (const app of WEB_APPS) if (!web.includes(app)) disabled.add(app);

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
    /** Yerelleştirme dosyalarından çıkarılacak düz anahtarlar (klasör altındaki tüm `*.json`). */
    localeRemove,
    jsonSet,
    copy: backend ? [] : COPY_ASSETS,
    backend,
    /** Üretimden sonra `pnpm generate` gerekir mi (API/OpenAPI şablondakinden farklıysa). */
    needsGenerate: backend && (!auth || !guest || !social || !sample || !lang),
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

/**
 * Üretilen projenin köküne yazılan `.ako.json`: hangi sürümle ve hangi seçimlerle üretildiği. Şablon sonradan
 * değişince bir projeye hangi değişikliklerin gerektiği (ve ileride `upgrade` komutunun aynı seçimlerle iki sürümü
 * üretip farkı çıkarması) buradan bilinir. Elle düzenlenmez.
 */
export function buildManifest(choices, version) {
  const { name, ...selections } = choices;
  return { generator: 'create-ako-app', version, choices: selections };
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

export function renderReadme({
  name,
  web,
  mobile,
  auth = true,
  guest = true,
  social = true,
  sample = true,
  backend = true,
}) {
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
  if (backend && auth && !guest)
    lines.push(
      '',
      `Bu projede **misafir girişi yok**: \`/auth/guest\` uçları, temizlik işi ve veri taşıma kancası (\`IGuestDataMerger\`) çıkarıldı${mobile ? '; mobil uygulama giriş yapılmadan yalnızca katalogu gösterir, kişisel ekranlar için giriş ister' : ''}.`,
    );
  if (backend && auth && !social)
    lines.push(
      '',
      'Bu projede **sosyal giriş yok**: `/auth/external`, `/auth/native`, `/auth/exchange`, `/auth/providers` uçları, sağlayıcı paketleri, giriş düğmeleri ve `packages/shared` (marka ikonları) çıkarıldı; yalnızca e-posta + şifre vardır. `apps/api/README.md` ve `apps/web/README.md` içindeki sosyal giriş bölümleri bu projede geçerli değildir.',
    );
  if (!sample)
    lines.push(
      '',
      `Bu projede **örnek senaryo yok** (Akı Kahve): ürünler, alışveriş listesi (Todos), görseller, seed${web.includes('backoffice') ? ', ürün yönetimi' : ''} ve ilgili ekranlar çıkarıldı; auth, çoklu dil ve kullanıcı yönetimi gibi seçtiğiniz özellikler boş iskelet olarak kaldı. Marka metinleri (Akı Kahve) ve \`apps/*/README.md\` içindeki Products/Todos anlatımları örnek olarak kalmıştır; kendi markanıza göre değiştirin.`,
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
  if (backend) lines.push(...deployLines({ web, mobile, auth, social }));
  return lines.join('\n');
}

/** Üretilen README'nin deploy bölümü: tek sunucu + Docker (compose.prod.yaml). */
function deployLines({ web, mobile, auth, social }) {
  const apps = ['API', ...web.map((app) => (app === 'site' ? 'site' : 'backoffice'))].join(', ');
  const secrets = [
    'veritabanı şifresi',
    ...(web.length > 0 ? ['`*_SESSION_SECRET` (uygulama başına ayrı, en az 32 karakter)'] : []),
    'SMTP bilgileri',
    ...(social ? ['sosyal giriş anahtarları (`Auth__Providers__…`)'] : []),
  ];
  const lines = [
    '## Deploy',
    '',
    `Tek sunucu (VPS) + Docker için hazır örnek: \`compose.prod.yaml\` (Postgres, ${apps}).`,
    '',
    '```bash',
    'cp .env.prod.example .env.prod   # değerleri doldurun; gizli değerler: openssl rand -base64 48',
    'docker compose -f compose.prod.yaml --env-file .env.prod up -d --build',
    '```',
    '',
    "- **Migration:** her deploy'da API açılmadan önce `migrate` servisi bir kez çalışır (`dotnet Ako.Api.dll migrate`): bekleyen migration'ları uygular" +
      (auth ? ', `ADMIN_EMAIL` doluysa ilk Admin hesabını açar' : '') +
      '. Tekrar çalıştırmak güvenlidir. Geri alınamayan şema değişikliklerinden önce veritabanını yedekleyin.',
    `- **Gizli bilgiler** yalnızca \`.env.prod\`'da (git'e girmez) ya da sunucunun ortam değişkenlerinde durur: ${secrets.join(', ')}.`,
  ];
  if (web.length > 0)
    lines.push(
      "- **HTTPS:** web uygulamaları yalnızca `127.0.0.1`'e açılır; önlerine HTTPS sonlandıran bir reverse proxy (Caddy, nginx…) konur. Sağlık kontrolü: `GET /health`.",
    );
  lines.push(
    '- **API** varsayılan olarak dışarı açılmaz' +
      (web.length > 0 ? ' (web uygulamaları ona Docker ağından ulaşır)' : '') +
      (mobile || social
        ? `. ${mobile ? 'Mobil uygulama' : 'Sosyal giriş'} için API'yi de proxy'den yayınlayın (\`compose.prod.yaml\`'daki \`ports\` ve \`API_PUBLIC_URL\`)`
        : '') +
      '. Sağlık kontrolü: `GET /health/live`, `GET /health/ready`.',
    '',
  );
  return lines;
}
