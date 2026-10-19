import type { Product } from './schema';

// Ürün görselleri uygulamayla paketlidir; Metro `require`'ı derleme zamanında çözer, bu yüzden liste elle yazılır.
// Yeni ürün eklerken görseli `assets/products` altına koyup buraya da ekleyin.
const IMAGES: Record<string, number> = {
  'etiyopya-yirgacheffe': require('../../../assets/products/etiyopya-yirgacheffe.svg'),
  'kolombiya-huila': require('../../../assets/products/kolombiya-huila.svg'),
  'kenya-nyeri': require('../../../assets/products/kenya-nyeri.svg'),
  'brezilya-cerrado': require('../../../assets/products/brezilya-cerrado.svg'),
  'guatemala-antigua': require('../../../assets/products/guatemala-antigua.svg'),
  'aki-espresso': require('../../../assets/products/aki-espresso.svg'),
  'v60-demleme-seti': require('../../../assets/products/v60-demleme-seti.svg'),
  'el-degirmeni': require('../../../assets/products/el-degirmeni.svg'),
  kettle: require('../../../assets/products/kettle.svg'),
  'hassas-terazi': require('../../../assets/products/hassas-terazi.svg'),
  'filtre-kagidi': require('../../../assets/products/filtre-kagidi.svg'),
  'seramik-kupa': require('../../../assets/products/seramik-kupa.svg'),
};

/** Ürün kaydındaki `image` anahtarının paketli görseli; bilinmeyen anahtarda `undefined`. */
export function productImage(product: Product | undefined): number | undefined {
  return product ? IMAGES[product.image] : undefined;
}
