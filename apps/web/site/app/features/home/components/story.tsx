import { Button } from '@mari-ui/components/button';
import { Paragraph, Text, Title } from '@mari-ui/components/typography';
import { SectionHeading } from '~/shared/section-heading';

/** Kavurucunun hikâyesi: güven verir ve markayı "bir kişi" olarak tanıtır. */
export function Story({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-5 md:items-center">
      <figure className="rounded-mari-xl bg-mari-primary-solid p-10 text-mari-primary-solid-contrast md:col-span-2">
        <blockquote>
          <Title level={3} className="text-3xl font-normal leading-snug text-inherit">
            “İyi bir fincan kahve, çiftçiden fincana kadar her adımın özenle yapılmasıyla olur.”
          </Title>
        </blockquote>
        <figcaption className="mt-6">
          <Text className="text-sm text-inherit opacity-80">Elif Akı · Kurucu, baş kavurucu</Text>
        </figcaption>
      </figure>
      <div className="flex flex-col gap-4 md:col-span-3">
        <SectionHeading eyebrow="HİKÂYEMİZ" title="Moda'da 12 kiloluk bir kavurucuyla başladık." />
        <Paragraph className="leading-relaxed text-mari-muted">
          2019'dan beri çekirdekleri çiftçilerle doğrudan ya da güvendiğimiz ithalatçılar
          aracılığıyla alıyoruz. Her yeni hasadı önce tadım masasında deniyor, en iyi ifade eden
          profili bulana kadar kavuruyoruz. Sonra da siparişinize göre küçük partiler hâlinde
          kavurup gönderiyoruz.
        </Paragraph>
        {!signedIn && (
          <div>
            <Button href="/register" variant="outline">
              Hesap oluştur, alışveriş listeni kaydet
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
