import { API_URL } from '~/shared/lib/config';
import type { Product } from './schema';

/** API'nin görselleri ("/images/…") mutlak adrese çevrilir. */
export function productImage(product: Product | undefined): string | undefined {
  return product?.imageUrl ? `${API_URL}${product.imageUrl}` : undefined;
}
