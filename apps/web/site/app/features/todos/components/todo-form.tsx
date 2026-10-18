import { applyFieldErrors } from '@ako/api-client';
import { CreateTodoBody } from '@ako/api-client/zod/todos';
import { TextField } from '@ako/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mari-ui/components/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateTodoWithRefresh } from '../hooks/use-todos';

const Schema = CreateTodoBody.extend({ title: z.string().trim().min(1).max(200) });

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
      className="flex items-end gap-2"
      onSubmit={form.handleSubmit((data) => create.mutate({ data }))}
    >
      <div className="flex-1">
        <TextField control={form.control} name="title" label="Yeni görev" />
      </div>
      <Button htmlType="submit" color="primary" loading={create.isPending}>
        Ekle
      </Button>
    </form>
  );
}
