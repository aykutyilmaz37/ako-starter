import { Checkbox } from '@mari-ui/components/checkbox';
import { SearchInput } from '@mari-ui/components/input';
import { Segmented } from '@mari-ui/components/segmented';
import { useSearchParams } from 'react-router';
import { LanguagesPanel } from '~/features/localization/components/languages-panel';
import { TranslationsTable } from '~/features/localization/components/translations-table';
import {
  NAMESPACES,
  useLanguages,
  useTranslations,
} from '~/features/localization/hooks/use-translations';
import { metaTranslator } from '~/shared/i18n/i18n';
import { useT } from '~/shared/i18n/i18n-provider';
import { PageHeader } from '~/shared/page-header';
import type { Route } from './+types/translations';

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: metaTranslator(matches)('translations.meta') }];
}

/** Çeviri yönetimi: alan (site / backoffice / api), arama, "yalnızca eksikler", dil sütunları ve satır içi düzenleme. */
export default function TranslationsPage() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const namespace = NAMESPACES.find((n) => n === params.get('namespace')) ?? 'site';
  const page = Number(params.get('page') ?? 1);
  const search = params.get('search') ?? undefined;
  const onlyMissing = params.get('missing') === '1';
  const translations = useTranslations({ namespace, search, onlyMissing, page, pageSize: 20 });
  const languages = useLanguages();

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('translations.title')} description={t('translations.description')} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Segmented
          name="namespace"
          size="sm"
          aria-label={t('translations.namespace')}
          value={namespace}
          onChange={(value) => setParam('namespace', value === 'site' ? undefined : String(value))}
          options={NAMESPACES.map((n) => ({ value: n, label: t(`translations.namespace.${n}`) }))}
        />
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Checkbox
            checked={onlyMissing}
            onChange={(e) => setParam('missing', e.target.checked ? '1' : undefined)}
            label={t('translations.onlyMissing')}
          />
          <div className="w-full md:w-72">
            <SearchInput
              size="sm"
              placeholder={t('translations.search.placeholder')}
              aria-label={t('translations.search.label')}
              defaultValue={search ?? ''}
              onSearch={(value) => setParam('search', value || undefined)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-mari-lg border border-mari-border bg-mari-surface">
        <TranslationsTable
          namespace={namespace}
          languages={languages.data ?? []}
          translations={translations.data}
          loading={translations.isFetching}
          onPageChange={(p) => setParam('page', String(p))}
        />
      </div>

      <LanguagesPanel
        namespace={namespace}
        languages={languages.data ?? []}
        loading={languages.isLoading}
      />
    </section>
  );
}
