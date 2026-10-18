import { Field } from '@mari-ui/components/field';
import { Input, OtpInput } from '@mari-ui/components/input';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

/**
 * react-hook-form alanını mari-ui'a bağlar: Field (etiket, hata, erişilebilirlik) + Input.
 * Hata metni hem istemci doğrulamasından (zod) hem API'den (applyFieldErrors) gelir; ikisi aynı yere düşer.
 */
interface TextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'search' | 'number';
  autoComplete?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  hint,
  required,
  ...input
}: TextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field label={label} hint={hint} required={required} error={fieldState.error?.message}>
          <Input
            {...input}
            type={type}
            name={field.name}
            value={field.value ?? ''}
            onChange={(e) =>
              field.onChange(type === 'number' ? e.target.valueAsNumber : e.target.value)
            }
            onBlur={field.onBlur}
            visibilityToggle={type === 'password'}
          />
        </Field>
      )}
    />
  );
}

/** 6 haneli e-posta kodu alanı. */
export function CodeField<T extends FieldValues>({
  control,
  name,
  label,
}: Pick<TextFieldProps<T>, 'control' | 'name' | 'label'>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field label={label} required error={fieldState.error?.message}>
          <OtpInput
            length={6}
            inputMode="numeric"
            value={field.value ?? ''}
            onChange={field.onChange}
          />
        </Field>
      )}
    />
  );
}
