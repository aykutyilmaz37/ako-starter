import { applyFieldErrors, isApiError } from '@ako/api-client';
import { useConfirmEmail, useSendConfirmationCode } from '@ako/api-client/auth';
import { Alert, Button, Field, OtpInput, useToast } from '@mari-ui/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AuthScreen } from '~/components/auth-screen';
import { s } from '~/lib/strings';

/** E-postaya gelen 6 haneli kodu doğrular; doğrulanınca girişe döner. */
export default function VerifyScreen() {
  const { email = '', resend: sendOnMount } = useLocalSearchParams<{
    email?: string;
    resend?: string;
  }>();
  const { showToast } = useToast();
  const form = useForm<{ code: string }>({ defaultValues: { code: '' } });

  const confirm = useConfirmEmail({
    mutation: {
      onSuccess: () => router.replace({ pathname: '/login', params: { verified: '1' } }),
      onError: (error) => {
        if (!applyFieldErrors(error, form.setError))
          form.setError('code', { message: error.message });
      },
    },
  });
  const resend = useSendConfirmationCode({
    mutation: {
      onSuccess: () => showToast({ title: s.verify.resent, type: 'success' }),
      onError: (error) =>
        showToast({
          title: isApiError(error) ? error.message : s.verify.resendFailed,
          type: 'error',
        }),
    },
  });

  useEffect(() => {
    if (sendOnMount && email) resend.mutate({ data: { email } });
    // Yalnızca ilk açılışta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () =>
    void form.handleSubmit(({ code }) => confirm.mutate({ data: { email, code } }))();

  return (
    <AuthScreen title={s.verify.title}>
      <Alert color="info" description={s.verify.info(email)} />
      <Controller
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <Field label={s.verify.code} required error={fieldState.error?.message}>
            <OtpInput
              length={6}
              inputMode="numeric"
              value={field.value}
              onChange={field.onChange}
            />
          </Field>
        )}
      />
      <Button block loading={confirm.isPending} onPress={submit}>
        {s.verify.submit}
      </Button>
      <Button
        variant="ghost"
        loading={resend.isPending}
        onPress={() => resend.mutate({ data: { email } })}
      >
        {s.verify.resend}
      </Button>
      <Button variant="link" onPress={() => router.replace('/login')}>
        {s.verify.back}
      </Button>
    </AuthScreen>
  );
}
