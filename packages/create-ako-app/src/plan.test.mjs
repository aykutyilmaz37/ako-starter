import { describe, expect, it } from 'vitest';
import {
  buildPlan,
  filterLaunch,
  isRemoved,
  normalizeChoices,
  renderReadme,
  stripE2eJob,
} from './plan.mjs';
import { setJsonKeys } from './scaffold.mjs';

const both = { name: 'demo', web: ['site', 'backoffice'], mobile: true };

describe('buildPlan', () => {
  it('her şey seçiliyken yalnızca şablona ait yolları çıkarır', () => {
    const plan = buildPlan(both);
    expect(plan.remove).toEqual(['ROADMAP.md', 'packages/create-ako-app']);
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
        'apps/mobile/lib/api.ts',
        'apps/mobile/lib/session.tsx',
      ]),
    );
    expect(plan.variants).toEqual(['no-backend']);
    expect(plan.launchServers).toEqual([]);
    expect(plan.needsGenerate).toBe(false);
    expect(plan.copy[0].to).toBe('apps/mobile/assets/products');
  });

  it("auth kapalı sayılır; alışveriş listesi kalır, sözlük API'den gelmez", () => {
    const { disabled } = buildPlan(noBackend);
    expect(disabled).toEqual(new Set(['backend', 'auth', 'api-lang']));
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
      new Set(['auth', 'list']),
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
