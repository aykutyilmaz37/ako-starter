import { Button } from '@mari-ui/components/button';

/** Kavurucunun hikâyesi: güven verir ve markayı "bir kişi" olarak tanıtır. */
export function Story({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-5 md:items-center">
      <div className="rounded-mari-xl bg-mari-primary-solid p-10 text-mari-primary-solid-contrast md:col-span-2">
        <p className="font-heading text-3xl leading-snug">
          “İyi bir fincan kahve, çiftçiden fincana kadar her adımın özenle yapılmasıyla olur.”
        </p>
        <p className="mt-6 text-sm opacity-80">Elif Akı · Kurucu, baş kavurucu</p>
      </div>
      <div className="flex flex-col gap-4 md:col-span-3">
        <p className="text-sm font-semibold tracking-widest text-mari-primary">HİKÂYEMİZ</p>
        <h2 className="font-heading text-3xl font-bold">
          Moda'da 12 kiloluk bir kavurucuyla başladık.
        </h2>
        <p className="leading-relaxed text-mari-muted">
          2019'dan beri çekirdekleri çiftçilerle doğrudan ya da güvendiğimiz ithalatçılar
          aracılığıyla alıyoruz. Her yeni hasadı önce tadım masasında deniyor, en iyi ifade eden
          profili bulana kadar kavuruyoruz. Sonra da siparişinize göre küçük partiler hâlinde
          kavurup gönderiyoruz.
        </p>
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
