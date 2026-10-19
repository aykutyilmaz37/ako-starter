import type { TranslationCellResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { Textarea } from '@mari-ui/components/input';
import { Tag } from '@mari-ui/components/tag';
import { Text } from '@mari-ui/components/typography';
import { useT } from '~/shared/i18n/i18n-provider';

interface TranslationCellProps {
  culture: string;
  translationKey: string;
  cell: TranslationCellResponse | undefined;
  /** Kaydedilmemiş değer; yoksa kayıtlı değer gösterilir. */
  draft: string | undefined;
  onChange: (value: string) => void;
}

/** Tablodaki bir (anahtar, dil) hücresi: her zaman düzenlenebilir alan; kaydetme sayfadaki tek "Kaydet" düğmesiyle. */
export function TranslationCell({
  culture,
  translationKey,
  cell,
  draft,
  onChange,
}: TranslationCellProps) {
  const t = useT();
  const changed = draft !== undefined;

  return (
    <div className="flex min-w-48 flex-col gap-1">
      <Textarea
        value={draft ?? cell?.value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        variant="underlined"
        autoSize={{ minRows: 1, maxRows: 8 }}
        color={changed ? 'primary' : !cell?.value ? 'warning' : undefined}
        aria-label={t('translations.cell.edit', { key: translationKey, lang: culture })}
      />
      {(cell?.isOverridden || !cell?.value) && (
        <div className="flex flex-wrap items-center gap-2">
          {!cell?.value && (
            <Tag color="warning" variant="soft">
              {t('translations.cell.missing')}
            </Tag>
          )}
          {cell?.isOverridden && (
            <>
              <Tag color="primary" variant="soft">
                {t('translations.cell.overridden')}
              </Tag>
              <Text muted className="text-xs">
                {t('translations.cell.fileValue', { value: cell.fileValue ?? '—' })}
              </Text>
              {/* Boş değer kaydedilince dosyadaki varsayılana dönülür. */}
              <Button size="sm" variant="link" onClick={() => onChange('')}>
                {t('translations.cell.reset')}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
