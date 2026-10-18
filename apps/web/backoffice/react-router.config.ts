import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  future: {
    // Geliştirmede route dosyaları baştan taranır; ilk açılışta "Outdated Optimize Dep" (504) ile
    // JavaScript'in yüklenememesi ve sayfanın canlanmaması önlenir.
    unstable_optimizeDeps: true,
  },
} satisfies Config;
