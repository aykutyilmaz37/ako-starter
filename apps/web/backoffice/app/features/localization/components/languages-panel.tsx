import type { LanguageResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { Card } from '@mari-ui/components/card';
import { Field } from '@mari-ui/components/field';
import { Image } from '@mari-ui/components/image';
import { Input } from '@mari-ui/components/input';
import { List, ListItem, ListItemMeta } from '@mari-ui/components/list';
import { Switch } from '@mari-ui/components/switch';
import { Tag } from '@mari-ui/components/tag';
import { Popconfirm } from '@mari-ui/components/popconfirm';
import { Download, Plus, Trash2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useSaveLanguage, type Namespace } from '~/features/localization/hooks/use-translations';
import { useT } from '~/shared/i18n/i18n-provider';

interface LanguagesPanelProps {
  namespace: Namespace;
  languages: LanguageResponse[];
  loading: boolean;
}

/** Diller: aç-kapat, seçili alanın dosyasını dışa aktar ve yeni dil ekle. Varsayılan dil kapatılamaz. */
export function LanguagesPanel({ namespace, languages, loading }: LanguagesPanelProps) {
  const t = useT();
  const form = useForm<{ code: string; name: string }>({ defaultValues: { code: '', name: '' } });
  const { create, update, remove } = useSaveLanguage(() => form.reset());

  return (
    <Card title={t('translations.languages.title')}>
      <div className="flex flex-col gap-6">
        <List
          loading={loading}
          dataSource={languages}
          rowKey="code"
          renderItem={(language) => (
            <ListItem
              actions={[
                <Button
                  key="export"
                  size="sm"
                  variant="ghost"
                  icon={<Download size={16} aria-hidden />}
                  // Dosya indirme: BFF üzerinden /admin/localization/export/<alan>/<dil>
                  href={`/api/admin/localization/export/${namespace}/${language.code}`}
                  aria-label={t('translations.export.file', { lang: language.name })}
                >
                  {t('translations.export')}
                </Button>,
                !language.isDefault && (
                  <Popconfirm
                    key="delete"
                    title={t('translations.languages.confirmDelete')}
                    description={t('translations.languages.confirmDeleteText')}
                    okText={t('translations.languages.delete')}
                    cancelText={t('common.cancel')}
                    color="error"
                    onConfirm={() => remove.mutate({ code: language.code })}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      color="error"
                      icon={<Trash2 size={16} aria-hidden />}
                      aria-label={t('translations.languages.deleteLabel', { name: language.name })}
                    />
                  </Popconfirm>
                ),
                <Switch
                  key="enabled"
                  checked={language.isEnabled}
                  disabled={language.isDefault}
                  aria-label={t('translations.languages.enabled', { name: language.name })}
                  onChange={(isEnabled) =>
                    update.mutate({ code: language.code, data: { name: language.name, isEnabled } })
                  }
                />,
              ]}
            >
              <ListItemMeta
                avatar={<Image src={`/flags/${language.code}.png`} alt="" width={28} height={28} />}
                title={
                  <span className="flex items-center gap-2">
                    {language.name}
                    {language.isDefault && (
                      <Tag color="primary" variant="soft">
                        {t('translations.languages.default')}
                      </Tag>
                    )}
                  </span>
                }
                description={language.code}
              />
            </ListItem>
          )}
        />

        <form
          method="post"
          className="flex flex-col gap-3 border-t border-mari-border pt-4 sm:flex-row sm:items-end"
          onSubmit={form.handleSubmit((data) => create.mutate({ data }))}
        >
          <Controller
            control={form.control}
            name="code"
            rules={{ required: true, maxLength: 10 }}
            render={({ field, fieldState }) => (
              <Field
                label={t('translations.languages.code')}
                required
                error={fieldState.error ? ' ' : undefined}
              >
                <Input {...field} placeholder={t('translations.languages.codeHint')} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="name"
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <Field
                label={t('translations.languages.name')}
                required
                error={fieldState.error ? ' ' : undefined}
                className="flex-1"
              >
                <Input {...field} placeholder={t('translations.languages.nameHint')} />
              </Field>
            )}
          />
          <Button
            htmlType="submit"
            color="primary"
            loading={create.isPending}
            icon={<Plus size={16} aria-hidden />}
          >
            {t('translations.languages.submit')}
          </Button>
        </form>
      </div>
    </Card>
  );
}
