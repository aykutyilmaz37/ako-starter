import type { TranslationCellResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { Textarea } from '@mari-ui/components/input';
import { Tag } from '@mari-ui/components/tag';
import { Text } from '@mari-ui/components/typography';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useSaveTranslation, type Namespace } from '~/features/localization/hooks/use-translations';
import { useT } from '~/shared/i18n/i18n-provider';

interface TranslationCellProps {
  namespace: Namespace;
  culture: string;
  translationKey: string;
  cell: TranslationCellResponse | undefined;
}

/** Tablodaki bir (anahtar, dil) hücresi: metni gösterir; kalem ile satır içinde düzenlenir, kaydet / ezmeyi sil. */
export function TranslationCell({
  namespace,
  culture,
  translationKey,
  cell,
}: TranslationCellProps) {
  const t = useT();
  const [draft, setDraft] = useState<string | null>(null);
  const save = useSaveTranslation(() => setDraft(null));
  const submit = (value: string | null) =>
    save.mutate({ data: { namespace, culture, key: translationKey, value } });

  if (draft !== null) {
    return (
      <div className="flex min-w-64 flex-col gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoSize={{ minRows: 2, maxRows: 8 }}
          aria-label={t('translations.cell.edit', { key: translationKey, lang: culture })}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            color="primary"
            loading={save.isPending}
            onClick={() => submit(draft.trim() ? draft : null)}
          >
            {t('translations.cell.save')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-48 items-start justify-between gap-2">
      <div className="flex min-w-0 flex-col gap-1">
        {cell?.value ? (
          <Text className="text-sm">{cell.value}</Text>
        ) : (
          <Tag color="warning" variant="soft" className="w-fit">
            {t('translations.cell.missing')}
          </Tag>
        )}
        {cell?.isOverridden && (
          <>
            <Tag color="primary" variant="soft" className="w-fit">
              {t('translations.cell.overridden')}
            </Tag>
            <Text muted className="text-xs">
              {t('translations.cell.fileValue', { value: cell.fileValue ?? '—' })}
            </Text>
            <Button
              size="sm"
              variant="link"
              className="w-fit"
              loading={save.isPending}
              onClick={() => submit(null)}
            >
              {t('translations.cell.reset')}
            </Button>
          </>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        icon={<Pencil size={16} aria-hidden />}
        aria-label={t('translations.cell.edit', { key: translationKey, lang: culture })}
        onClick={() => setDraft(cell?.value ?? '')}
      />
    </div>
  );
}
