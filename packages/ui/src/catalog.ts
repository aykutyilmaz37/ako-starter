import type { ProductCategory } from '@ako/api-client/model';

/** Kategori adları (Türkçe). API metin olarak döner: 'Coffee' | 'Equipment' | 'Accessory'. */
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  Coffee: 'Kahve',
  Equipment: 'Demleme ekipmanı',
  Accessory: 'Aksesuar',
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];

const currency = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return currency.format(value);
}

/** Stok durumu: rozetin metni ve rengi. Az kalan ürün aciliyet hissi verir, tükenen ürün satın alınamaz. */
export function stockState(stock: number): {
  label: string;
  color: 'success' | 'warning' | 'neutral';
  available: boolean;
} {
  if (stock <= 0) return { label: 'Tükendi', color: 'neutral', available: false };
  if (stock <= 10) return { label: `Son ${stock} adet`, color: 'warning', available: true };
  return { label: 'Stokta', color: 'success', available: true };
}

/**
 * Ürün görselinin tarayıcıdaki adresi. API'nin kendi görselleri ("/images/…") web'de BFF üzerinden gelir
 * ("/api/images/…"); tam adresler olduğu gibi kullanılır.
 */
export function productImageSrc(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined;
  return imageUrl.startsWith('/') ? `/api${imageUrl}` : imageUrl;
}
