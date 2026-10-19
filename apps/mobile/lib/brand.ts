import type { ProductCategory } from '@ako/api-client/model';
import { API_URL } from '~/lib/config';

/** Web sitesiyle aynı kategori sırası ve adları. */
export const CATEGORIES: ProductCategory[] = ['Coffee', 'Equipment', 'Accessory'];

export const CATEGORY_NAMES: Record<ProductCategory, string> = {
  Coffee: 'Kahve',
  Equipment: 'Ekipman',
  Accessory: 'Aksesuar',
};

export const CATEGORY_BLURBS: Record<ProductCategory, string> = {
  Coffee: 'Tek menşeli çekirdekler ve espresso harmanımız.',
  Equipment: 'V60, değirmen ve su ısıtıcısı: evde kafe kalitesi.',
  Accessory: 'Terazi, filtre ve kupalar.',
};

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
export function stockState(stock: number) {
  if (stock <= 0) return { label: 'Tükendi', color: 'neutral', available: false } as const;
  if (stock <= 10)
    return { label: `Son ${stock} paket`, color: 'warning', available: true } as const;
  return { label: 'Stokta', color: 'success', available: true } as const;
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
