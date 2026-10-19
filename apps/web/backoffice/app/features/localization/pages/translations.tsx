import { Button } from '@mari-ui/components/button';
import { Checkbox } from '@mari-ui/components/checkbox';
import { SearchInput } from '@mari-ui/components/input';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { LanguagesPanel } from '~/features/localization/components/languages-panel';
import { TranslationsTable, draftId } from '~/features/localization/components/translations-table';
import {
  NAMESPACE,
  useLanguages,
  useSaveTranslations,
  useTranslations,
} from '~/features/localization/hooks/use-translations';
import { metaTranslator } from '~/shared/i18n/i18n';
import { useT } from '~/shared/i18n/i18n-provider';
import { PageHeader } from '~/shared/page-header';
import type { Route } from './+types/translations';

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: metaTranslator(matches)('translations.meta') }];
}

/** Çeviri yönetimi (yalnızca site metinleri): arama, "yalnızca eksikler", dil sütunları ve satır içi düzenleme. */
export default function TranslationsPage() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? 1);
  const search = params.get('search') ?? undefined;
  const onlyMissing = params.get('missing') === '1';
  const translations = useTranslations({
    namespace: NAMESPACE,
    search,
    onlyMissing,
    page,
    pageSize: 20,
  });
  const languages = useLanguages();

  // Kaydedilmemiş değişiklikler (sayfalar arasında da korunur); kayıtlı değerle aynıya dönen hücre listeden çıkar.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const { saveAll, isPending } = useSaveTranslations(() => setDrafts({}));
  const count = Object.keys(drafts).length;
  const setDraft = (key: string, culture: string, value: string) => {
    const saved = translations.data?.items.find((e) => e.key === key)?.values[culture]?.value ?? '';
    setDrafts((current) => {
      const { [draftId(key, culture)]: _, ...rest } = current;
      return value === saved ? rest : { ...rest, [draftId(key, culture)]: value };
    });
  };

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={t('translations.title')}
        description={t('translations.description')}
        actions={
          <>
            <Button
              variant="ghost"
              disabled={count === 0 || isPending}
              onClick={() => setDrafts({})}
            >
              {t('translations.discard')}
            </Button>
            <Button
              color="primary"
              disabled={count === 0}
              loading={isPending}
              onClick={() =>
                void saveAll(
                  Object.entries(drafts).map(([id, value]) => {
                    const i = id.indexOf(':');
                    return {
                      namespace: NAMESPACE,
                      culture: id.slice(0, i),
                      key: id.slice(i + 1),
                      value,
                    };
                  }),
                )
              }
            >
              {t('translations.save', { count })}
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
          drafts={drafts}
          onDraftChange={setDraft}
          languages={languages.data ?? []}
          translations={translations.data}
          loading={translations.isFetching}
          onPageChange={(p) => setParam('page', String(p))}
        />
      </div>

      <LanguagesPanel
        namespace={NAMESPACE}
        languages={languages.data ?? []}
        loading={languages.isLoading}
      />
    </section>
  );
}
