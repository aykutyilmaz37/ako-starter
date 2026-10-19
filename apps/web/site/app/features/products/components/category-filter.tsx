import type { ProductCategory } from '@ako/api-client/model';
import { Segmented } from '@mari-ui/components/segmented';
import { CATEGORIES } from '~/shared/catalog';
import { useT } from '~/shared/i18n/i18n-provider';

const ALL = 'all';

interface CategoryFilterProps {
  value: ProductCategory | undefined;
  onChange: (category: ProductCategory | undefined) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const t = useT();

  return (
    <Segmented
      name="category"
      aria-label={t('products.filter.name')}
      value={value ?? ALL}
      onChange={(next) => onChange(next === ALL ? undefined : (next as ProductCategory))}
      options={[
        { value: ALL, label: t('products.filter.all') },
        ...CATEGORIES.map((c) => ({ value: c, label: t(`category.${c}`) })),
      ]}
    />
  );
}
