import { applyFieldErrors, isApiError } from '@ako/api-client';
import type { ProductCategory, ProductResponse } from '@ako/api-client/model';
import { AdminCreateProductBody } from '@ako/api-client/zod/admin-products';
import { CATEGORIES, CATEGORY_LABELS, productImageSrc, TextField } from '@ako/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@mari-ui/components/alert';
import { Field } from '@mari-ui/components/field';
import { Select } from '@mari-ui/components/select';
import { Modal } from '@mari-ui/components/modal';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSaveProduct } from '../hooks/use-products';

// API şeması + istemci tarafı kurallar (API'deki FluentValidation kurallarının kopyası değil, hızlı geri bildirim için).
const Schema = AdminCreateProductBody.extend({
  sku: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9-]+$/, 'Yalnızca harf, rakam ve tire.'),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullish(),
  category: z.enum(CATEGORIES as [ProductCategory, ...ProductCategory[]]),
  imageUrl: z.string().max(500).nullish(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
});
type Values = z.infer<typeof Schema>;

const empty: Values = {
  sku: '',
  name: '',
  description: '',
  category: 'Coffee',
  imageUrl: '',
  price: 0,
  stock: 0,
};

interface ProductFormModalProps {
  open: boolean;
  /** Verilirse düzenleme, verilmezse ekleme. */
  product?: ProductResponse | null;
  onClose: () => void;
}

/** Ürün ekleme / düzenleme. SKU yalnızca eklemede girilir; ürünün kimliği gibidir, sonradan değişmez. */
export function ProductFormModal({ open, product, onClose }: ProductFormModalProps) {
  const isEdit = !!product;
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(Schema), defaultValues: empty });

  // Modal her açılışta seçili ürünle (ya da boş) başlar.
  useEffect(() => {
    if (open) {
      setMessage(null);
      form.reset(
        product
          ? { ...product, description: product.description ?? '', imageUrl: product.imageUrl ?? '' }
          : empty,
      );
    }
  }, [open, product, form]);

  const { create, update } = useSaveProduct(onClose, (error) => {
    if (applyFieldErrors(error, form.setError)) return;
    setMessage(isApiError(error) ? error.message : 'Ürün kaydedilemedi.');
  });

  const submit = form.handleSubmit(({ sku, ...values }) => {
    const data = {
      ...values,
      description: values.description || null,
      imageUrl: values.imageUrl || null,
    };
    if (product) update.mutate({ id: product.id, data });
    else create.mutate({ data: { sku, ...data } });
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Ürünü düzenle' : 'Yeni ürün'}
      confirmButtonText="Kaydet"
      cancelButtonText="Vazgeç"
      onConfirm={submit}
      confirmLoading={create.isPending || update.isPending}
    >
      <form method="post" className="flex flex-col gap-4" onSubmit={submit}>
        {message && <Alert color="error" description={message} />}
        {!isEdit && (
          <TextField
            control={form.control}
            name="sku"
            label="SKU"
            hint="Sonradan değiştirilemez."
            required
          />
        )}
        <TextField control={form.control} name="name" label="Ad" required />
        <Controller
          control={form.control}
          name="category"
          render={({ field, fieldState }) => (
            <Field label="Kategori" required error={fieldState.error?.message}>
              <Select
                value={field.value}
                onChange={(value) => field.onChange(value)}
                options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
              />
            </Field>
          )}
        />
        <TextField
          control={form.control}
          name="description"
          label="Açıklama"
          hint="Kahvelerde: işlem. kavrum. tadım notaları."
        />
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <TextField
              control={form.control}
              name="imageUrl"
              label="Görsel adresi"
              placeholder="/images/products/… ya da https://…"
            />
          </div>
          {/* Girilen adresin önizlemesi */}
          <img
            src={productImageSrc(form.watch('imageUrl')) ?? ''}
            alt=""
            width={56}
            height={56}
            className="mb-0.5 size-14 shrink-0 rounded-mari-md border border-mari-border bg-mari-surface-alt object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField control={form.control} name="price" label="Fiyat (₺)" type="number" required />
          <TextField control={form.control} name="stock" label="Stok" type="number" required />
        </div>
        {/* Enter ile gönderim için */}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
