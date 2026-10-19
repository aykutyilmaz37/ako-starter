import { Paragraph, Text, Title } from '@mari-ui/components/typography';
import type { ReactNode } from 'react';

interface SectionHeadingProps {
  /** Küçük üst başlık, ör. "MAĞAZA". */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Sayfanın ana başlığıysa 1, bölüm başlığıysa 2. */
  level?: 1 | 2;
  id?: string;
}

/** Sayfa ve bölüm başlıklarının ortak kalıbı (mari-ui Title + Text). */
export function SectionHeading({
  eyebrow,
  title,
  description,
  level = 2,
  id,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow && (
        <Text color="primary" weight="semibold" className="text-sm tracking-widest">
          {eyebrow}
        </Text>
      )}
      <Title level={level} id={id} className={level === 1 ? 'text-4xl' : 'text-3xl'}>
        {title}
      </Title>
      {description && <Paragraph className="max-w-2xl text-mari-muted">{description}</Paragraph>}
    </div>
  );
}
