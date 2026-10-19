import type { ProductCategory } from '@ako/api-client/model';
import type { Translate } from '~/shared/i18n/i18n';

/** Kategoriler. API metin olarak döner: 'Coffee' | 'Equipment' | 'Accessory'; adları çeviri anahtarı "category.<ad>". */
export const CATEGORIES: ProductCategory[] = ['Coffee', 'Equipment', 'Accessory'];

/** Fiyatlar TL cinsindendir; yalnızca gösterim biçimi dile göre değişir (1.200,00 ₺ / ₺1,200.00). */
export function formatPrice(value: number, lang: string): string {
  return new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: 'TRY',
    currencyDisplay: 'narrowSymbol',
  }).format(value);
}

/** Stok durumu: rozetin metni ve rengi. Az kalan ürün aciliyet hissi verir, tükenen ürün listeye eklenemez. */
export function stockState(stock: number, t: Translate) {
  if (stock <= 0) return { label: t('stock.soldOut'), color: 'neutral', available: false } as const;
  if (stock <= 10)
    return { label: t('stock.last', { count: stock }), color: 'warning', available: true } as const;
  return { label: t('stock.inStock'), color: 'success', available: true } as const;
}

/** API'nin kendi görselleri ("/images/…") tarayıcıda BFF üzerinden gelir ("/api/images/…"). */
export function productImageSrc(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  return imageUrl.startsWith('/') ? `/api${imageUrl}` : imageUrl;
}
