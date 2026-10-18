import { productImageSrc } from '@ako/ui';
import { Button } from '@mari-ui/components/button';
import { ArrowRight } from 'lucide-react';

/** Ana sayfa girişi: değer önerisi + iki çağrı + üst üste duran üç paket görseli. */
export function Hero({ images }: { images: (string | null)[] }) {
  return (
    <section className="relative overflow-hidden bg-mari-surface-alt">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6">
          <p className="w-fit rounded-mari-full bg-mari-primary-subtle px-3 py-1 text-xs font-semibold tracking-widest text-mari-primary-subtle-contrast">
            BU HAFTA KAVRULDU
          </p>
          <h1 className="font-heading text-5xl font-bold leading-[1.05] md:text-6xl">
            Her fincanda, kavrulduğu günün tazeliği.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-mari-muted">
            Tek menşeli çekirdekleri küçük partiler hâlinde kavuruyor, kavrulduğu hafta kapınıza
            gönderiyoruz.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              href="/products?category=Coffee"
              color="primary"
              size="lg"
              icon={<ArrowRight size={18} aria-hidden />}
              iconPosition="end"
            >
              Kahveleri keşfet
            </Button>
            <Button href="/products?category=Equipment" variant="outline" size="lg">
              Demleme ekipmanı
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
          {images.slice(0, 3).map((src, i) => (
            <img
              key={src ?? i}
              src={productImageSrc(src)}
              alt=""
              width={800}
              height={800}
              className={[
                'absolute w-3/5 rounded-mari-xl shadow-mari-lg',
                i === 0 && 'left-0 top-8 -rotate-6',
                i === 1 && 'right-0 top-0 rotate-6',
                i === 2 && 'bottom-0 left-1/2 z-10 -translate-x-1/2',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
