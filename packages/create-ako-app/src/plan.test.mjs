import { describe, expect, it } from 'vitest';
import { buildPlan, filterLaunch, isRemoved, normalizeChoices, stripE2eJob } from './plan.mjs';

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
