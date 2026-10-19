import { Button } from '@mari-ui/components/button';
import { Paragraph, Text, Title } from '@mari-ui/components/typography';
import { useLocalePath, useT } from '~/shared/i18n/i18n-provider';
import { SectionHeading } from '~/shared/section-heading';

/** Kavurucunun hikâyesi: güven verir ve markayı "bir kişi" olarak tanıtır. */
export function Story({ signedIn }: { signedIn: boolean }) {
  const t = useT();
  const localePath = useLocalePath();

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-5 md:items-center">
      <figure className="rounded-mari-xl bg-mari-primary-solid p-10 text-mari-primary-solid-contrast md:col-span-2">
        <blockquote>
          <Title level={3} className="text-3xl font-normal leading-snug text-inherit">
            {t('home.story.quote')}
          </Title>
        </blockquote>
        <figcaption className="mt-6">
          <Text className="text-sm text-inherit opacity-80">{t('home.story.author')}</Text>
        </figcaption>
      </figure>
      <div className="flex flex-col gap-4 md:col-span-3">
        <SectionHeading eyebrow={t('home.story.eyebrow')} title={t('home.story.title')} />
        <Paragraph className="leading-relaxed text-mari-muted">{t('home.story.text')}</Paragraph>
        {!signedIn && (
          <div>
            <Button href={localePath('/register')} variant="outline">
              {t('home.story.cta')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
