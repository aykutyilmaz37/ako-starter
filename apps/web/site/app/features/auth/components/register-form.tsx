import { applyFieldErrors } from '@ako/api-client';
import { useRegister } from '@ako/api-client/auth';
import { RegisterBody } from '@ako/api-client/zod/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@mari-ui/components/alert';
import { Button } from '@mari-ui/components/button';
import { Field } from '@mari-ui/components/field';
import { Input } from '@mari-ui/components/input';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// API şeması (RegisterBody) + istemci tarafı kurallar. Şifre kuralları API'de; hataları forma gelir.
const Schema = RegisterBody.extend({ email: z.email(), password: z.string().min(8) });
type Values = z.infer<typeof Schema>;

/** Kayıt formu. Başarılı olunca API e-postaya 6 haneli kod gönderir. */
export function RegisterForm({ onRegistered }: { onRegistered: (email: string) => void }) {
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { email: '', password: '' },
  });
  const register = useRegister({
    mutation: {
      onSuccess: (_, { data }) => onRegistered(data.email),
      onError: (error) => applyFieldErrors(error, form.setError),
    },
  });

  // Identity'nin şifre hataları alan adıyla değil kodla döner (PasswordTooShort…); formun üstünde gösterilir.
  const passwordRuleErrors = Object.entries(register.error?.fieldErrors ?? {})
    .filter(([key]) => key !== 'email' && key !== 'password')
    .flatMap(([, messages]) => messages);

  return (
    <form
      method="post"
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((data) => register.mutate({ data }))}
      noValidate
    >
      {passwordRuleErrors.map((message) => (
        <Alert key={message} color="error" description={message} />
      ))}
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field label="E-posta" required error={fieldState.error?.message}>
            <Input {...field} type="email" autoComplete="email" />
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Field
            label="Şifre"
            required
            hint="En az 8 karakter; büyük harf, küçük harf, rakam ve özel karakter içermeli."
            error={fieldState.error?.message}
          >
            <Input {...field} type="password" autoComplete="new-password" visibilityToggle />
          </Field>
        )}
      />
      <Button htmlType="submit" color="primary" block loading={register.isPending}>
        Hesap oluştur
      </Button>
    </form>
  );
}
