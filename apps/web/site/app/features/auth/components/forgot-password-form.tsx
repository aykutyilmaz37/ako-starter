import { applyFieldErrors } from '@ako/api-client';
import { useForgotPassword, useResetPassword } from '@ako/api-client/auth';
import { CodeField, TextField } from '@ako/ui';
import { Alert } from '@mari-ui/components/alert';
import { Button } from '@mari-ui/components/button';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

/** İki adım: e-posta → kod + yeni şifre. E-posta doğrulamayla aynı 6 haneli kod akışı. */
export function ForgotPasswordForm({ onReset }: { onReset: () => void }) {
  const [email, setEmail] = useState<string | null>(null);
  return email === null ? (
    <RequestCodeStep onSent={setEmail} />
  ) : (
    <ResetStep email={email} onReset={onReset} />
  );
}

function RequestCodeStep({ onSent }: { onSent: (email: string) => void }) {
  const form = useForm<{ email: string }>({ defaultValues: { email: '' } });
  const forgot = useForgotPassword({
    mutation: {
      onSuccess: (_, { data }) => onSent(data.email),
      onError: (error) => applyFieldErrors(error, form.setError),
    },
  });

  return (
    <form
      method="post"
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((data) => forgot.mutate({ data }))}
    >
      <TextField
        control={form.control}
        name="email"
        label="E-posta"
        type="email"
        autoComplete="email"
        required
      />
      <Button htmlType="submit" color="primary" block loading={forgot.isPending}>
        Kod gönder
      </Button>
    </form>
  );
}

function ResetStep({ email, onReset }: { email: string; onReset: () => void }) {
  const form = useForm<{ code: string; newPassword: string }>({
    defaultValues: { code: '', newPassword: '' },
  });
  const reset = useResetPassword({
    mutation: {
      onSuccess: onReset,
      onError: (error) => {
        if (!applyFieldErrors(error, form.setError))
          form.setError('code', { message: error.message });
      },
    },
  });

  return (
    <form
      method="post"
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) => reset.mutate({ data: { email, ...values } }))}
    >
      <Alert
        color="info"
        description={`Hesap varsa ${email} adresine 6 haneli bir kod gönderdik.`}
      />
      <CodeField control={form.control} name="code" label="Kod" />
      <TextField
        control={form.control}
        name="newPassword"
        label="Yeni şifre"
        type="password"
        autoComplete="new-password"
        required
      />
      <Button htmlType="submit" color="primary" block loading={reset.isPending}>
        Şifreyi değiştir
      </Button>
    </form>
  );
}
