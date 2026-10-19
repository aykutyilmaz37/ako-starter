import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, Empty, Field, Input, Text, useTheme } from '@mari-ui/native';
import { router } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useShoppingList } from '~/features/shopping-list/data/hooks';
import type { ShoppingItem } from '~/features/shopping-list/data/schema';
import { Eyebrow, Heading, Muted } from '~/components/ui';
import { RADIUS } from '~/lib/brand';
import { useT } from '~/lib/i18n';

const Schema = z.object({ title: z.string().trim().min(1).max(200) });

/** Alışveriş listem: veri cihazdaki SQLite'ta durur, ekran yalnızca hook'u kullanır. */
export default function ShoppingList() {
  const { color } = useTheme();
  const insets = useSafeAreaInsets();
  const t = useT();
  const list = useShoppingList();

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: { title: '' },
  });
  const submit = () =>
    void form.handleSubmit(async ({ title }) => {
      await list.add(title);
      form.reset();
    })();

  const pending = list.items.filter((item) => !item.isDone);
  const done = list.items.filter((item) => item.isDone);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, gap: 20 }}
    >
      <View style={{ gap: 4 }}>
        <Eyebrow>{t('list.eyebrow')}</Eyebrow>
        <Heading size={32}>{t('list.title')}</Heading>
        <Muted>{t('list.description.local')}</Muted>
      </View>

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
            icon={<Plus size={18} color={color.primary.solidContrast} />}
            accessibilityLabel={t('list.form.add')}
            onPress={submit}
          />
        </View>
      </View>

      {list.items.length === 0 ? (
        <Empty
          title={t('list.empty.title')}
          description={t('list.empty.description')}
          buttonText={t('list.empty.button')}
          onPress={() => router.navigate({ pathname: '/shop', params: { category: 'Coffee' } })}
        />
      ) : (
        <View style={{ gap: 24 }}>
          <ItemSection
            title={t('list.pending', { count: pending.length })}
            items={pending}
            onToggle={list.toggle}
            onRemove={list.remove}
          />
          {done.length > 0 ? (
            <ItemSection
              title={t('list.done', { count: done.length })}
              items={done}
              onToggle={list.toggle}
              onRemove={list.remove}
            />
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

function ItemSection({
  title,
  items,
  onToggle,
  onRemove,
}: {
  title: string;
  items: ShoppingItem[];
  onToggle: (item: ShoppingItem) => void;
  onRemove: (item: ShoppingItem) => void;
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
        {items.map((item, i) => (
          <View
            key={item.id}
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
                checked={item.isDone}
                onChange={() => onToggle(item)}
                label={
                  <Text
                    style={
                      item.isDone
                        ? { color: color.canvas.muted, textDecorationLine: 'line-through' }
                        : undefined
                    }
                  >
                    {item.title}
                  </Text>
                }
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('list.delete', { title: item.title })}
              hitSlop={10}
              onPress={() => onRemove(item)}
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
