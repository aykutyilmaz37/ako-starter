import { applyFieldErrors } from '@ako/api-client';
import { useForgotPassword, useResetPassword } from '@ako/api-client/auth';
import { Alert } from '@mari-ui/components/alert';
import { Button } from '@mari-ui/components/button';
import { Field } from '@mari-ui/components/field';
import { Input, OtpInput } from '@mari-ui/components/input';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

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
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field label="E-posta" required error={fieldState.error?.message}>
            <Input {...field} type="email" autoComplete="email" />
          </Field>
        )}
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
      <Controller
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <Field label="Kod" required error={fieldState.error?.message}>
            <OtpInput
              length={6}
              inputMode="numeric"
              value={field.value}
              onChange={field.onChange}
            />
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="newPassword"
        render={({ field, fieldState }) => (
          <Field label="Yeni şifre" required error={fieldState.error?.message}>
            <Input {...field} type="password" autoComplete="new-password" visibilityToggle />
          </Field>
        )}
      />
      <Button htmlType="submit" color="primary" block loading={reset.isPending}>
        Şifreyi değiştir
      </Button>
    </form>
  );
}
