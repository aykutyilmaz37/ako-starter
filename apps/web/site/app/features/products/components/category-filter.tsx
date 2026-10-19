import type { ProductCategory } from '@ako/api-client/model';
import { CATEGORIES, CATEGORY_LABELS } from '~/shared/catalog';
import { Segmented } from '@mari-ui/components/segmented';

const ALL = 'all';

interface CategoryFilterProps {
  value: ProductCategory | undefined;
  onChange: (category: ProductCategory | undefined) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <Segmented
      name="kategori"
      value={value ?? ALL}
      onChange={(next) => onChange(next === ALL ? undefined : (next as ProductCategory))}
      options={[
        { value: ALL, label: 'Tümü' },
        ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
      ]}
    />
  );
}
