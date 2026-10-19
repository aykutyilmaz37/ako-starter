import { Paragraph, Title } from '@mari-ui/components/typography';
import type { ReactNode } from 'react';

/** Her yönetim sayfasının üstü: başlık, kısa açıklama ve sağda sayfaya ait işlemler (mari-ui Title + Paragraph). */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-mari-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Title level={1} className="text-2xl">
          {title}
        </Title>
        {description && (
          <Paragraph className="mt-1 text-sm text-mari-muted">{description}</Paragraph>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}
