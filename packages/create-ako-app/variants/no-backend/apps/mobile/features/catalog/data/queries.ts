import type { Product, ProductCategory } from './schema';
import catalog from './products.json';

const products = catalog as Product[];

export interface ProductFilter {
  category?: ProductCategory;
  search?: string;
  pageSize?: number;
}

export interface ProductPage {
  items: Product[];
  totalCount: number;
}

/** Kategori ve ad/açıklama aramasına göre ürünler; `totalCount` sayfa sınırından önceki sayıdır. */
export function listProducts({ category, search, pageSize }: ProductFilter = {}): ProductPage {
  const needle = search?.toLocaleLowerCase('tr-TR');
  const matches = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!needle ||
        p.name.toLocaleLowerCase('tr-TR').includes(needle) ||
        (p.description ?? '').toLocaleLowerCase('tr-TR').includes(needle)),
  );
  return { items: pageSize ? matches.slice(0, pageSize) : matches, totalCount: matches.length };
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
