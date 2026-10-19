import { Button } from '@mari-ui/components/button';
import { Image } from '@mari-ui/components/image';
import { Tag } from '@mari-ui/components/tag';
import { Paragraph, Title } from '@mari-ui/components/typography';
import { ArrowRight } from 'lucide-react';
import { productImageSrc } from '~/shared/catalog';
import { useLocalePath, useT } from '~/shared/i18n/i18n-provider';

const placements = [
  'left-0 top-8 -rotate-6',
  'right-0 top-0 rotate-6',
  'bottom-0 left-1/2 z-10 -translate-x-1/2',
];

/** Ana sayfa girişi: değer önerisi + iki çağrı + üst üste duran üç paket görseli. */
export function Hero({ images }: { images: (string | null)[] }) {
  const t = useT();
  const localePath = useLocalePath();

  return (
    <section className="bg-mari-surface-alt">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6">
          <Tag color="primary" variant="soft" className="w-fit tracking-widest">
            {t('home.hero.badge')}
          </Tag>
          <Title level={1} className="text-5xl leading-tight md:text-6xl">
            {t('home.hero.title')}
          </Title>
          <Paragraph className="max-w-md text-lg leading-relaxed text-mari-muted">
            {t('home.hero.text')}
          </Paragraph>
          <div className="flex flex-wrap gap-3">
            <Button
              href={localePath('/products?category=Coffee')}
              color="primary"
              size="lg"
              icon={<ArrowRight size={18} aria-hidden />}
              iconPosition="end"
            >
              {t('home.hero.ctaCoffee')}
            </Button>
            <Button href={localePath('/products?category=Equipment')} variant="outline" size="lg">
              {t('home.hero.ctaEquipment')}
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
          {images.slice(0, 3).map((src, i) => (
            <div key={src ?? i} className={`absolute w-3/5 ${placements[i]}`}>
              <Image
                src={productImageSrc(src)}
                alt=""
                aspectRatio={1}
                priority
                wrapperClassName="overflow-hidden rounded-mari-xl shadow-mari-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
