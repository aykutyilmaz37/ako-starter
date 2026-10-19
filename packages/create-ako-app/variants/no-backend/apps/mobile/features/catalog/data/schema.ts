/** Katalog salt okunurdur ve uygulamayla paketlidir (`products.json`); veritabanında tutulmaz. */
export type ProductCategory = 'Coffee' | 'Equipment' | 'Accessory';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  /** TL */
  price: number;
  stock: number;
  /** `assets/products` altındaki görselin anahtarı (bkz. `images.ts`). */
  image: string;
}
