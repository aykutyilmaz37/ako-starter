import type { ProductCategory } from '@ako/api-client/model';

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

/** API'nin kendi görselleri ("/images/…") tarayıcıda BFF üzerinden gelir ("/api/images/…"). */
export function productImageSrc(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  return imageUrl.startsWith('/') ? `/api${imageUrl}` : imageUrl;
}
