// Şablon dosyalarındaki `ako:` işaretleri. Özellik kapalıysa ilgili satırlar çıkarılır; açıksa işaretler dosyada kalır
// (şablon kendi başına derlenir, işaretler yalnızca yorumdur).
//
//   foo(); // ako:auth                  → tek satır; özellik kapalıysa silinir
//   // ako:begin auth ... // ako:end auth → blok; özellik kapalıysa silinir
//   // ako:begin auth
//   asıl kod
//   // ako:else auth
//   //~ özellik kapalıyken geçerli kod  → `//~ ` öneki kaldırılır, satır etkinleşir (JSX içinde `{/*~ <A /> */}`)
//   // ako:end auth
//
// İşaret sözdizimi dosya türüne bağlı değildir (`//`, `{/* */}`, `<!-- -->` hepsi çalışır): satırda `ako:begin <ad>` vb. aranır.

const BEGIN = /ako:begin ([\w-]+)/;
const ELSE = /ako:else ([\w-]+)/;
const END = /ako:end ([\w-]+)/;
const SINGLE = /ako:([\w-]+)(?![\w-])/;
const ENABLED_LINE = /^(\s*)(?:(?:\/\/|#)~ ?(.*)|\{\/\*~ ?(.*?) ?\*\/\})$/;

/**
 * @param {string} text
 * @param {Set<string>} disabled kapalı özellik adları
 * @param {string} [file] hata iletileri için
 */
export function applyMarkers(text, disabled, file = '<metin>') {
  const lines = text.split('\n');
  const out = [];
  /** @type {{ name: string, off: boolean, inElse: boolean }[]} */
  const stack = [];
  const hidden = () => stack.some((s) => (s.inElse ? !s.off : s.off));

  lines.forEach((line, i) => {
    const where = `${file}:${i + 1}`;
    const begin = line.match(BEGIN);
    const otherwise = line.match(ELSE);
    const end = line.match(END);

    if (begin) {
      stack.push({ name: begin[1], off: disabled.has(begin[1]), inElse: false });
      return;
    }
    if (otherwise) {
      const top = stack.at(-1);
      if (!top || top.name !== otherwise[1] || top.inElse)
        throw new Error(`${where}: beklenmeyen ako:else ${otherwise[1]}`);
      top.inElse = true;
      return;
    }
    if (end) {
      const top = stack.pop();
      if (!top || top.name !== end[1]) throw new Error(`${where}: ako:end ${end[1]} eşleşmiyor`);
      return;
    }
    if (hidden()) return;

    const top = stack.at(-1);
    if (top?.inElse) {
      const enabled = line.match(ENABLED_LINE);
      out.push(enabled ? `${enabled[1]}${enabled[2] ?? enabled[3]}` : line);
      return;
    }
    const single = line.match(SINGLE);
    if (single && disabled.has(single[1])) return;
    out.push(line);
  });

  if (stack.length > 0) throw new Error(`${file}: ako:begin ${stack.at(-1).name} kapatılmamış`);
  const result = out.join('\n');
  if (out.length === lines.length) return result;
  // Çıkarılan bloklar yanında boş satır bırakabilir: art arda boşlukları ve sondaki fazlalığı toparla.
  return result.replace(/\n{3,}/g, '\n\n').replace(/\n+$/, text.endsWith('\n') ? '\n' : '');
}

/** Dosyada işaret var mı (hızlı ön süzgeç). */
export const hasMarkers = (text) => text.includes('ako:');
