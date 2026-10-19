import type { ProductCategory } from '@ako/api-client/model';
import { API_URL } from '~/lib/config';
import type { Translate } from '~/lib/i18n';

/** Web sitesiyle aynı kategori sırası ve adları. */
export const CATEGORIES: ProductCategory[] = ['Coffee', 'Equipment', 'Accessory'];

/** Fiyatlar TL; tr-TR gösterimi (1.200,00 ₺). Hermes'te Intl yoksa elle biçimlenir. */
export function formatPrice(value: number): string {
  const [int = '0', frac = '00'] = value.toFixed(2).split('.');
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${frac} ₺`;
}

/** API'nin görselleri ("/images/…") mutlak adrese çevrilir. */
export function imageSource(url: string | null | undefined): string | undefined {
  return url ? `${API_URL}${url}` : undefined;
}

/** Stok durumu: rozet metni ve rengi (webdeki ile aynı eşikler). */
export function stockState(stock: number, t: Translate) {
  if (stock <= 0) return { label: t('stock.soldOut'), color: 'neutral', available: false } as const;
  if (stock <= 10)
    return { label: t('stock.last', { count: stock }), color: 'warning', available: true } as const;
  return { label: t('stock.inStock'), color: 'success', available: true } as const;
}

/**
 * Kartta gösterilecek kısa özet: kahve açıklamaları "işlem. kavrum. tadım notaları." düzenindedir,
 * satın alma kararını en çok tadım notaları etkiler.
 */
export function summary(description: string | null | undefined): string {
  if (!description) return '';
  const sentences = description.split('. ');
  return (sentences[2] ?? sentences[0] ?? '').replace(/\.$/, '');
}

/** Köşe yarıçapları (mari-ui "lg" yoğunluğu ile uyumlu). */
export const RADIUS = { sm: 8, md: 12, lg: 18, xl: 24 } as const;

/** expo-font kayıt adları (@expo-google-fonts/playfair-display). */
export const FONT_HEADING = 'PlayfairDisplay_700Bold';
