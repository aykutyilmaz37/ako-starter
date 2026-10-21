import { describe, expect, it } from 'vitest';
import { applyMarkers } from './markers.mjs';

const off = new Set(['auth']);

describe('applyMarkers', () => {
  it('özellik açıkken metne dokunmaz', () => {
    const text = 'a(); // ako:auth\nb();';
    expect(applyMarkers(text, new Set())).toBe(text);
  });

  it('kapalıyken tek satırı siler, yan açıklamalı olanı da', () => {
    expect(applyMarkers('a();\nb(); // ako:auth — açıklama\nc();', off)).toBe('a();\nc();');
  });

  it('kapalıyken bloğu siler', () => {
    expect(applyMarkers('a\n// ako:begin auth\nb\nc\n// ako:end auth\nd', off)).toBe('a\nd');
  });

  it('else bölümünü etkinleştirir', () => {
    const text =
      'x\n// ako:begin auth\nIdentity\n// ako:else auth\n    //~ : DbContext\n// ako:end auth\ny';
    expect(applyMarkers(text, off)).toBe('x\n    : DbContext\ny');
    expect(applyMarkers(text, new Set())).toBe(
      'x\nIdentity\n    //~ : DbContext\ny'.replace('    //~ : DbContext\n', ''),
    );
  });

  it('başka özelliğin işaretine dokunmaz ve iç içe blokları çözer', () => {
    const text =
      '// ako:begin lang\nL\n// ako:begin auth\nA\n// ako:end auth\n// ako:end lang\nz // ako:lang';
    expect(applyMarkers(text, off)).toBe('L\nz // ako:lang');
  });

  it('kapatılmamış bloğu reddeder', () => {
    expect(() => applyMarkers('// ako:begin auth\nx', off)).toThrow(/kapatılmamış/);
  });

  it('yorum sözdiziminden bağımsızdır', () => {
    expect(applyMarkers('<a/>\n{/* ako:begin auth */}\n<b/>\n{/* ako:end auth */}', off)).toBe(
      '<a/>',
    );
  });
});

describe('iç içe else', () => {
  const text = [
    '// ako:begin sample',
    'S',
    '// ako:else sample',
    '// ako:begin auth',
    '//~ A',
    '// ako:end auth',
    '//~ B',
    '// ako:end sample',
  ].join('\n');

  it('else kolundaki iç bloğun satırları da etkinleşir', () => {
    expect(applyMarkers(text, new Set(['sample']))).toBe('A\nB');
  });

  it('iç blok kapalıysa kendi satırları gizlenir, dış else yine çalışır', () => {
    expect(applyMarkers(text, new Set(['sample', 'auth']))).toBe('B');
  });

  it('dış özellik açıkken else kolu (iç bloklarıyla) silinir', () => {
    expect(applyMarkers(text, new Set(['auth']))).toBe('S');
  });
});

describe('JSX else', () => {
  it('{/*~ ... */} satırını etkinleştirir', () => {
    const text =
      '{/* ako:begin auth */}\n<A />\n{/* ako:else auth */}\n  {/*~ <B /> */}\n{/* ako:end auth */}';
    expect(applyMarkers(text, off)).toBe('  <B />');
  });
});
