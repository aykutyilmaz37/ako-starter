import { applyFieldErrors, isApiError } from '@ako/api-client';
import { useConfirmEmail, useSendConfirmationCode } from '@ako/api-client/auth';
import { Alert } from '@mari-ui/components/alert';
import { Button } from '@mari-ui/components/button';
import { Field } from '@mari-ui/components/field';
import { OtpInput } from '@mari-ui/components/input';
import { useToast } from '@mari-ui/components/toast';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface VerifyEmailFormProps {
  email: string;
  /** true: form açılınca yeni kod gönderilir (doğrulanmamış hesapla girişte). */
  sendOnMount?: boolean;
  onVerified: () => void;
}

/** E-postaya gelen 6 haneli kodu doğrular; "tekrar gönder" butonu dahil. */
export function VerifyEmailForm({ email, sendOnMount, onVerified }: VerifyEmailFormProps) {
  const { showToast } = useToast();
  const form = useForm<{ code: string }>({ defaultValues: { code: '' } });

  const confirm = useConfirmEmail({
    mutation: {
      onSuccess: onVerified,
      onError: (error) => {
        if (!applyFieldErrors(error, form.setError))
          form.setError('code', { message: error.message });
      },
    },
  });
  const resend = useSendConfirmationCode({
    mutation: {
      onSuccess: () => showToast({ title: 'Yeni kod gönderildi.', type: 'success' }),
      onError: (error) =>
        showToast({
          title: isApiError(error) ? error.message : 'Kod gönderilemedi.',
          type: 'error',
        }),
    },
  });

  useEffect(() => {
    if (sendOnMount && email) resend.mutate({ data: { email } });
    // Yalnızca ilk açılışta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      method="post"
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(({ code }) => confirm.mutate({ data: { email, code } }))}
    >
      <Alert color="info" description={`${email} adresine 6 haneli bir kod gönderdik.`} />
      <Controller
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <Field label="Doğrulama kodu" required error={fieldState.error?.message}>
            <OtpInput
              length={6}
              inputMode="numeric"
              value={field.value}
              onChange={field.onChange}
            />
          </Field>
        )}
      />
      <Button htmlType="submit" color="primary" block loading={confirm.isPending}>
        Doğrula
      </Button>
      <Button
        variant="ghost"
        loading={resend.isPending}
        onClick={() => resend.mutate({ data: { email } })}
      >
        Kod gelmedi, tekrar gönder
      </Button>
    </form>
  );
}
