import { applyFieldErrors } from '@ako/api-client';
import type { TodoResponse } from '@ako/api-client/model';
import { CreateTodoBody } from '@ako/api-client/zod/todos';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, Empty, Field, Input, Paragraph, Text, useTheme } from '@mari-ui/native';
import { router } from 'expo-router';
import { Heart, Plus, Trash2 } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Eyebrow, Heading, Muted } from '~/shared/components/ui';
import { RADIUS } from '~/shared/lib/brand';
import { useT } from '~/features/localization/i18n';
import { useSession } from '~/features/auth/session';
import { useShoppingList } from '~/features/shopping-list/data/hooks';

const Schema = CreateTodoBody.extend({ title: z.string().trim().min(1).max(200) });

/** Alışveriş listem: giriş gerektiren tek sekme; girişsizken davet gösterir. */
export default function ShoppingList() {
  const { color } = useTheme();
  const insets = useSafeAreaInsets();
  const t = useT();
  const { status } = useSession();
  const list = useShoppingList(status === 'guest' || status === 'member');

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: { title: '' },
  });
  const submit = () =>
    void form.handleSubmit(async (data) => {
      try {
        await list.add({ data });
        form.reset();
      } catch (error) {
        applyFieldErrors(error, form.setError);
      }
    })();

  const pending = list.todos.filter((todo) => !todo.isDone);
  const done = list.todos.filter((todo) => todo.isDone);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, gap: 20 }}
    >
      <View style={{ gap: 4 }}>
        <Eyebrow>{t('list.eyebrow')}</Eyebrow>
        <Heading size={32}>{t('list.title')}</Heading>
        <Muted>{t('list.description')}</Muted>
      </View>

      {status === 'guest' ? (
        <View
          style={{
            gap: 14,
            padding: 20,
            borderRadius: RADIUS.lg,
            borderWidth: 1,
            borderColor: color.canvas.border,
            backgroundColor: color.canvas.surfaceAlt,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: color.primary.subtle,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={20} color={color.primary.subtleContrast} />
          </View>
          <Heading size={20}>{t('list.guest.title')}</Heading>
          <Paragraph muted>{t('list.guest.text')}</Paragraph>
          <Button block onPress={() => router.push('/login')}>
            {t('account.login')}
          </Button>
          <Button block variant="outline" onPress={() => router.push('/register')}>
            {t('account.register')}
          </Button>
        </View>
      ) : null}

      <>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field label={t('list.form.label')} error={fieldState.error?.message}>
                  <Input
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    onPressEnter={submit}
                    placeholder={t('list.form.placeholder')}
                  />
                </Field>
              )}
            />
          </View>
          <View style={{ marginTop: 28 }}>
            <Button
              loading={list.isAdding}
              icon={<Plus size={18} color={color.primary.solidContrast} />}
              accessibilityLabel={t('list.form.add')}
              onPress={submit}
            />
          </View>
        </View>

        {!list.isLoading && list.todos.length === 0 ? (
          <Empty
            title={t('list.empty.title')}
            description={t('list.empty.description')}
            buttonText={t('list.empty.button')}
            onPress={() => router.navigate({ pathname: '/shop', params: { category: 'Coffee' } })}
          />
        ) : (
          <View style={{ gap: 24 }}>
            <TodoSection
              title={t('list.pending', { count: pending.length })}
              items={pending}
              onToggle={list.toggle}
              onRemove={list.remove}
            />
            {done.length > 0 ? (
              <TodoSection
                title={t('list.done', { count: done.length })}
                items={done}
                onToggle={list.toggle}
                onRemove={list.remove}
              />
            ) : null}
          </View>
        )}
      </>
    </ScrollView>
  );
}

function TodoSection({
  title,
  items,
  onToggle,
  onRemove,
}: {
  title: string;
  items: TodoResponse[];
  onToggle: (todo: TodoResponse) => void;
  onRemove: (todo: TodoResponse) => void;
}) {
  const { color } = useTheme();
  const t = useT();
  if (items.length === 0) return null;

  return (
    <View style={{ gap: 8 }}>
      <Text weight="semibold">{title}</Text>
      <View
        style={{
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderColor: color.canvas.border,
          overflow: 'hidden',
        }}
      >
        {items.map((todo, i) => (
          <View
            key={todo.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              minHeight: 52,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: color.canvas.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <Checkbox
                checked={todo.isDone}
                onChange={() => onToggle(todo)}
                label={
                  <Text
                    style={
                      todo.isDone
                        ? { color: color.canvas.muted, textDecorationLine: 'line-through' }
                        : undefined
                    }
                  >
                    {todo.title}
                  </Text>
                }
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('list.delete', { title: todo.title })}
              hitSlop={10}
              onPress={() => onRemove(todo)}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Trash2 size={18} color={color.error.text} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
