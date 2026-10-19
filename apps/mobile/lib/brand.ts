import type { Translate } from '~/lib/i18n';
// ako:begin backend
import type { ProductCategory, ProductResponse } from '@ako/api-client/model';
import { API_URL } from '~/lib/config';
// ako:else backend
//~ import { productImage as catalogImage } from '~/features/catalog/data/images';
//~ import type { Product, ProductCategory } from '~/features/catalog/data/schema';
// ako:end backend

export type { ProductCategory };
// ako:begin backend
export type Product = ProductResponse;
// ako:else backend
//~ export type { Product };
// ako:end backend

/** Web sitesiyle aynı kategori sırası ve adları. */
export const CATEGORIES: ProductCategory[] = ['Coffee', 'Equipment', 'Accessory'];

/** Fiyatlar TL; tr-TR gösterimi (1.200,00 ₺). Hermes'te Intl yoksa elle biçimlenir. */
export function formatPrice(value: number): string {
  const [int = '0', frac = '00'] = value.toFixed(2).split('.');
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${frac} ₺`;
}

// ako:begin backend
/** API'nin görselleri ("/images/…") mutlak adrese çevrilir. */
export function productImage(product: Product | undefined): string | undefined {
  return product?.imageUrl ? `${API_URL}${product.imageUrl}` : undefined;
}
// ako:else backend
//~ /** Ürün görselleri uygulamayla paketlidir (assets/products). */
//~ export function productImage(product: Product | undefined) {
//~   return product ? catalogImage(product.image) : undefined;
//~ }
// ako:end backend

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
