import type {
  LanguageResponse,
  PagedResponseOfTranslationEntryResponse,
  TranslationEntryResponse,
} from '@ako/api-client/model';
import { Table, type ColumnDef } from '@mari-ui/components/table';
import { Text } from '@mari-ui/components/typography';
import { TranslationCell } from '~/features/localization/components/translation-cell';
import { useT } from '~/shared/i18n/i18n-provider';

/** Kaydedilmemiş değişikliklerin sözlük anahtarı. */
export const draftId = (key: string, culture: string) => `${culture}:${key}`;

// Table satırları `id` ister; anahtar zaten tekildir.
type Row = TranslationEntryResponse & { id: string };

interface TranslationsTableProps {
  drafts: Record<string, string>;
  onDraftChange: (key: string, culture: string, value: string) => void;
  languages: LanguageResponse[];
  translations: PagedResponseOfTranslationEntryResponse | undefined;
  loading: boolean;
  onPageChange: (page: number) => void;
}

/** Anahtar sütunu + her dil için bir sütun. */
export function TranslationsTable({
  drafts,
  onDraftChange,
  languages,
  translations,
  loading,
  onPageChange,
}: TranslationsTableProps) {
  const t = useT();

  const columns: ColumnDef<Row>[] = [
    {
      header: t('translations.col.key'),
      columnName: 'key',
      render: (_, entry) => <Text className="break-all font-mono text-xs">{entry.key}</Text>,
    },
    ...languages.map((language): ColumnDef<Row> => ({
      header: language.name,
      columnName: 'values',
      render: (_, entry) => (
        <TranslationCell
          culture={language.code}
          translationKey={entry.key}
          cell={entry.values[language.code]}
          draft={drafts[draftId(entry.key, language.code)]}
          onChange={(value) => onDraftChange(entry.key, language.code, value)}
        />
      ),
    })),
  ];

  return (
    <Table
      label={t('translations.table')}
      data={(translations?.items ?? []).map((entry) => ({ ...entry, id: entry.key }))}
      columns={columns}
      skeleton={loading && !translations}
      paginationMode="server"
      pagination={{
        page: translations?.page ?? 1,
        pageSize: translations?.pageSize ?? 20,
        total: translations?.totalCount ?? 0,
        onPageChange,
      }}
      emptyState={{
        title: t('translations.empty.title'),
        description: t('translations.empty.description'),
      }}
    />
  );
}
