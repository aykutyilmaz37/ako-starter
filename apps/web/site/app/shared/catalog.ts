import type { ProductCategory } from '@ako/api-client/model';

/** Kategori adları (Türkçe). API metin olarak döner: 'Coffee' | 'Equipment' | 'Accessory'. */
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  Coffee: 'Kahve',
  Equipment: 'Demleme ekipmanı',
  Accessory: 'Aksesuar',
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];

const currency = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

export function formatPrice(value: number): string {
  return currency.format(value);
}

/** Stok durumu: rozetin metni ve rengi. Az kalan ürün aciliyet hissi verir, tükenen ürün listeye eklenemez. */
export function stockState(stock: number) {
  if (stock <= 0) return { label: 'Tükendi', color: 'neutral', available: false } as const;
  if (stock <= 10)
    return { label: `Son ${stock} adet`, color: 'warning', available: true } as const;
  return { label: 'Stokta', color: 'success', available: true } as const;
}

/** API'nin kendi görselleri ("/images/…") tarayıcıda BFF üzerinden gelir ("/api/images/…"). */
export function productImageSrc(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  return imageUrl.startsWith('/') ? `/api${imageUrl}` : imageUrl;
}
