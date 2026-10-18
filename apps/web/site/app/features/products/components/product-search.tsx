import { SearchInput } from '@mari-ui/components/input';

interface ProductSearchProps {
  defaultValue: string;
  onSearch: (value: string) => void;
}

export function ProductSearch({ defaultValue, onSearch }: ProductSearchProps) {
  return (
    <SearchInput
      placeholder="Ad ya da SKU ile ara"
      defaultValue={defaultValue}
      onSearch={onSearch}
    />
  );
}
