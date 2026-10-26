import { describe, expect, it } from 'vitest';
import {
  buildManifest,
  buildPlan,
  filterLaunch,
  isRemoved,
  normalizeChoices,
  renderReadme,
  stripE2eJob,
  variantName,
} from './plan.mjs';
import { setJsonKeys } from './scaffold.mjs';

const both = { name: 'demo', web: ['site', 'backoffice'], mobile: true };

describe('buildPlan', () => {
  it('her şey seçiliyken yalnızca şablona ait yolları çıkarır', () => {
    const plan = buildPlan(both);
    expect(plan.remove).toEqual([
      'ROADMAP.md',
      'LICENSE',
      '.changeset',
      '.github/workflows/release.yml',
      'packages/create-ako-app',
    ]);
    expect(plan.keepE2e).toBe(true);
  });

  it('yalnız mobil: web, web-core ve e2e gider', () => {
    const plan = buildPlan({ ...both, web: [] });
    expect(plan.remove).toEqual(
      expect.arrayContaining(['apps/web', 'packages/web-core', 'packages/e2e']),
    );
    expect(plan.launchServers).toEqual(['api']);
  });

  it('yalnız web: mobil gider', () => {
    const plan = buildPlan({ ...both, mobile: false });
    expect(plan.remove).toContain('apps/mobile');
    expect(plan.remove).not.toContain('apps/web');
  });

  it('tek web uygulaması: diğeri ve e2e gider, web-core kalır', () => {
    const plan = buildPlan({ ...both, web: ['site'] });
    expect(plan.remove).toEqual(expect.arrayContaining(['apps/web/backoffice', 'packages/e2e']));
    expect(plan.remove).not.toContain('packages/web-core');
  });
});

describe("backend'siz mobil", () => {
  const noBackend = { name: 'demo', web: [], mobile: true, backend: false };

  it('API, api-client, web-core, e2e ve kök compose çıkar; yerel veri varyantı eklenir', () => {
    const plan = buildPlan(noBackend);
    expect(plan.remove).toEqual(
      expect.arrayContaining([
        'apps/api',
        'packages/api-client',
        'packages/web-core',
        'packages/e2e',
        'compose.yaml',
        'apps/mobile/shared/lib/api.ts',
        'apps/mobile/features/auth',
      ]),
    );
    expect(plan.variants).toEqual(['no-backend']);
    expect(plan.launchServers).toEqual([]);
    expect(plan.needsGenerate).toBe(false);
    expect(plan.copy[0].to).toBe('apps/mobile/assets/products');
  });

  it("auth kapalı sayılır; alışveriş listesi kalır, sözlük API'den gelmez", () => {
    const { disabled } = buildPlan(noBackend);
    expect(disabled).toEqual(
      new Set(['backend', 'auth', 'guest', 'social', 'todos', 'api-lang', 'site', 'backoffice']),
    );
  });

  it('dil kapalıysa migration varyantı değişmez, yalnızca dil dosyaları çıkar', () => {
    const plan = buildPlan({ ...noBackend, lang: false });
    expect(plan.variants).toEqual(['no-backend']);
    expect(plan.remove).toContain('apps/mobile/locales/en.json');
  });

  it('web ya da mobilsiz seçimi reddeder', () => {
    expect(() => normalizeChoices({ ...noBackend, web: ['site'] })).toThrow(/Backend yokken web/);
    expect(() => normalizeChoices({ ...noBackend, mobile: false })).toThrow(/En az bir/);
  });

  it('auth açık istenirse bile kapatır', () => {
    expect(normalizeChoices({ ...noBackend, auth: true }).auth).toBe(false);
  });

  it("API'li auth kapalı: liste ve sözlük işaretleri doğru türer", () => {
    expect(buildPlan({ ...both, web: ['site'], auth: false }).disabled).toEqual(
      new Set(['auth', 'guest', 'social', 'list', 'todos', 'backoffice']),
    );
    expect(buildPlan({ ...both, lang: false }).disabled).toEqual(new Set(['lang', 'api-lang']));
    expect(buildPlan({ ...both, lang: false }).needsGenerate).toBe(true);
    expect(buildPlan(both).needsGenerate).toBe(false);
  });

  it('README API anlatmaz', () => {
    const readme = renderReadme({ ...noBackend, backend: false });
    expect(readme).not.toMatch(/apps\/api|db:up|dotnet/);
    expect(readme).toContain('**backend yok**');
  });

  it('setJsonKeys bağımlılıkları sıralı tutar ve ara nesne oluşturur', () => {
    const out = JSON.parse(
      setJsonKeys('{"dependencies":{"b":"1","d":"1"}}', {
        'dependencies.c': '2',
        'scripts.x': 'y',
      }),
    );
    expect(Object.keys(out.dependencies)).toEqual(['b', 'c', 'd']);
    expect(out.scripts.x).toBe('y');
  });
});

describe('misafir girişi', () => {
  it('kapalıyken yalnızca misafir yolları çıkar, auth ve migration varyantı ayrı kalır', () => {
    const plan = buildPlan({ ...both, guest: false });
    expect(plan.disabled).toEqual(new Set(['guest']));
    expect(plan.remove).toEqual(
      expect.arrayContaining([
        'apps/api/src/Ako.Api/Features/Auth/Actions/CreateGuest.cs',
        'apps/api/tests/Ako.Api.Tests/GuestTests.cs',
      ]),
    );
    expect(plan.remove).not.toContain('apps/api/src/Ako.Api/Features/Auth');
    expect(plan.variants).toEqual(['no-guest']);
    expect(plan.needsGenerate).toBe(true);
  });

  it('dil kapalıyla birleşince tek migration varyantı seçilir', () => {
    expect(buildPlan({ ...both, guest: false, lang: false }).variants).toEqual([
      'no-guest-no-lang',
    ]);
  });

  it('auth kapalıyken misafir istense de kapalıdır ve varyant adı no-auth kalır', () => {
    expect(normalizeChoices({ ...both, web: ['site'], auth: false, guest: true }).guest).toBe(
      false,
    );
    expect(buildPlan({ ...both, web: ['site'], auth: false }).variants).toEqual(['no-auth']);
  });

  it('README misafir yokluğunu belirtir', () => {
    expect(renderReadme({ ...both, guest: false })).toContain('**misafir girişi yok**');
    expect(renderReadme(both)).not.toContain('misafir girişi yok');
  });
});

describe('sosyal giriş', () => {
  it('kapalıyken sağlayıcı kodu, düğmeler ve marka paketi çıkar; auth ve migration varyantı kalır', () => {
    const plan = buildPlan({ ...both, social: false });
    expect(plan.disabled).toEqual(new Set(['social']));
    expect(plan.remove).toEqual(
      expect.arrayContaining([
        'apps/api/src/Ako.Api/Features/Auth/Actions/ExternalLogin.cs',
        'apps/api/src/Ako.Api/Features/Auth/Services/IdTokenValidator.cs',
        'apps/mobile/features/auth/social-login.ts',
        'packages/shared',
      ]),
    );
    expect(plan.remove).not.toContain('apps/api/src/Ako.Api/Features/Auth');
    expect(plan.variants).toEqual([]);
    expect(plan.needsGenerate).toBe(true);
    const mobile = plan.jsonRemove.find((r) => r.file === 'apps/mobile/package.json');
    expect(mobile.keys).toEqual(
      expect.arrayContaining([
        'dependencies.@react-native-google-signin/google-signin',
        'dependencies.expo-apple-authentication',
        'dependencies.expo-web-browser',
      ]),
    );
  });

  it('auth ya da backend kapalıyken sosyal istense de kapalıdır', () => {
    expect(normalizeChoices({ ...both, web: ['site'], auth: false, social: true }).social).toBe(
      false,
    );
    expect(
      normalizeChoices({ name: 'x', web: [], mobile: true, backend: false, social: true }).social,
    ).toBe(false);
  });

  it('diğer kapalı özelliklerle birleşince yalnız kendi işaretini ekler', () => {
    const plan = buildPlan({ ...both, social: false, guest: false });
    expect(plan.disabled).toEqual(new Set(['guest', 'social']));
    expect(plan.variants).toEqual(['no-guest']);
  });

  it('README sosyal girişin yokluğunu belirtir', () => {
    expect(renderReadme({ ...both, social: false })).toContain('**sosyal giriş yok**');
    expect(renderReadme(both)).not.toContain('sosyal giriş yok');
  });
});

describe('örnek senaryo', () => {
  it('kapalıyken Products/Todos, görseller ve ekranlar çıkar; auth ve migration adı sample ile birleşir', () => {
    const plan = buildPlan({ ...both, sample: false });
    expect(plan.disabled).toEqual(new Set(['sample', 'list', 'todos']));
    expect(plan.remove).toEqual(
      expect.arrayContaining([
        'apps/api/src/Ako.Api/Features/Products',
        'apps/api/src/Ako.Api/wwwroot/images',
        'apps/web/site/app/features/products',
        'apps/web/backoffice/app/features/products',
        'apps/mobile/features/catalog',
        'apps/mobile/features/shopping-list',
      ]),
    );
    expect(plan.remove).not.toContain('apps/api/src/Ako.Api/Features/Auth');
    expect(plan.variants).toEqual(['no-sample']);
    expect(plan.keepE2e).toBe(false);
    expect(plan.needsGenerate).toBe(true);
    expect(plan.localeRemove.map((r) => r.file)).toEqual(
      expect.arrayContaining(['apps/web/site/app/locales', 'apps/mobile/locales']),
    );
  });

  it('diğer kapalı özelliklerle tek migration varyantı adı olur', () => {
    expect(variantName(new Set(['sample', 'lang']))).toBe('no-sample-no-lang');
    expect(variantName(new Set(['auth', 'sample']))).toBe('no-auth-no-sample');
    expect(variantName(new Set(['guest', 'sample', 'lang']))).toBe('no-guest-no-sample-no-lang');
    expect(buildPlan({ ...both, web: ['site'], auth: false, sample: false }).variants).toEqual([
      'no-auth-no-sample',
    ]);
  });

  it('backend yokken kapatılamaz', () => {
    expect(() =>
      normalizeChoices({ name: 'x', web: [], mobile: true, backend: false, sample: false }),
    ).toThrow(/Backend yokken örnek/);
  });

  it('README örnek senaryonun yokluğunu belirtir', () => {
    expect(renderReadme({ ...both, sample: false })).toContain('**örnek senaryo yok**');
    expect(renderReadme(both)).not.toContain('örnek senaryo yok');
  });
});

describe('normalizeChoices', () => {
  it('uygulama seçilmezse hata verir', () => {
    expect(() => normalizeChoices({ name: 'x', web: [], mobile: false })).toThrow(/En az bir/);
  });
  it('bilinmeyen web uygulamasını ve geçersiz adı reddeder', () => {
    expect(() => normalizeChoices({ name: 'x', web: ['admin'], mobile: true })).toThrow(
      /Bilinmeyen/,
    );
    expect(() => normalizeChoices({ name: 'Büyük Harf', web: [], mobile: true })).toThrow(
      /Geçersiz proje adı/,
    );
  });
});

describe('yardımcılar', () => {
  it('isRemoved yalnızca tam yol ve alt yolları eşler', () => {
    expect(isRemoved('apps/web/site/a.ts', ['apps/web/site'])).toBe(true);
    expect(isRemoved('apps/web/site2/a.ts', ['apps/web/site'])).toBe(false);
  });
  it('stripE2eJob e2e işini keser', () => {
    expect(stripE2eJob('jobs:\n  api:\n    x: 1\n\n  e2e:\n    y: 2\n')).toBe(
      'jobs:\n  api:\n    x: 1\n',
    );
  });
  it('filterLaunch istenmeyen sunucuları çıkarır', () => {
    const json = JSON.stringify({ configurations: [{ name: 'api' }, { name: 'site' }] });
    expect(JSON.parse(filterLaunch(json, ['api'])).configurations).toEqual([{ name: 'api' }]);
  });
});

describe('buildManifest', () => {
  it('sürümü ve seçimleri yazar, proje adını yazmaz', () => {
    const choices = normalizeChoices({ ...both, lang: false });
    expect(buildManifest(choices, '0.3.0')).toEqual({
      generator: 'create-ako-app',
      version: '0.3.0',
      choices: {
        web: ['site', 'backoffice'],
        mobile: true,
        auth: true,
        guest: true,
        social: true,
        sample: true,
        lang: false,
        backend: true,
      },
    });
  });
});
