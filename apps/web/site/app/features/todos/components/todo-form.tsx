import { applyFieldErrors } from '@ako/api-client';
import { CreateTodoBody } from '@ako/api-client/zod/todos';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mari-ui/components/button';
import { Field } from '@mari-ui/components/field';
import { Input } from '@mari-ui/components/input';
import { Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateTodoWithRefresh } from '~/features/todos/hooks/use-todos';

const Schema = CreateTodoBody.extend({ title: z.string().trim().min(1).max(200) });

/** Listeye elle madde ekleme (ör. "Süt", "Filtre kağıdı"). Ürün sayfasından da eklenebilir. */
export function TodoForm() {
  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: { title: '' },
  });
  const create = useCreateTodoWithRefresh({
    mutation: {
      onSuccess: () => form.reset(),
      onError: (error) => applyFieldErrors(error, form.setError),
    },
  });

  return (
    <form
      method="post"
      className="flex items-start gap-2"
      onSubmit={form.handleSubmit((data) => create.mutate({ data }))}
    >
      <Controller
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <Field label="Listeye ekle" error={fieldState.error?.message} className="flex-1">
            <Input {...field} placeholder="Ör. filtre kağıdı, süt" />
          </Field>
        )}
      />
      <Button
        htmlType="submit"
        color="primary"
        loading={create.isPending}
        icon={<Plus size={18} aria-hidden />}
        className="mt-7"
      >
        Ekle
      </Button>
    </form>
  );
}
