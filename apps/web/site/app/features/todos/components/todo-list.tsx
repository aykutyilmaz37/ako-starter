import type { TodoResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { Checkbox } from '@mari-ui/components/checkbox';
import { Empty } from '@mari-ui/components/empty';
import { List, ListItem } from '@mari-ui/components/list';
import { Trash2 } from 'lucide-react';
import { useTodos } from '~/features/todos/hooks/use-todos';
import { useLocalePath, useT } from '~/shared/i18n/i18n-provider';

/** Alınacaklar üstte, alınanlar altta (soluk ve üstü çizili). */
export function TodoList() {
  const { todos, isLoading, toggle, remove } = useTodos();
  const t = useT();
  const localePath = useLocalePath();

  if (!isLoading && todos.length === 0) {
    return (
      <Empty
        title={t('todos.empty.title')}
        description={t('todos.empty.description')}
        buttonText={t('todos.empty.button')}
        href={localePath('/products?category=Coffee')}
      />
    );
  }

  const pending = todos.filter((t) => !t.isDone);
  const done = todos.filter((t) => t.isDone);

  return (
    <div className="flex flex-col gap-8">
      <TodoSection
        title={t('todos.pending', { count: pending.length })}
        items={pending}
        loading={isLoading}
        onToggle={toggle}
        onRemove={remove}
      />
      {done.length > 0 && (
        <TodoSection
          title={t('todos.done', { count: done.length })}
          items={done}
          onToggle={toggle}
          onRemove={remove}
        />
      )}
    </div>
  );
}

interface TodoSectionProps {
  title: string;
  items: TodoResponse[];
  loading?: boolean;
  onToggle: (todo: TodoResponse) => void;
  onRemove: (todo: TodoResponse) => void;
}

function TodoSection({ title, items, loading, onToggle, onRemove }: TodoSectionProps) {
  const t = useT();

  return (
    <List
      header={title}
      bordered
      loading={loading}
      dataSource={items}
      rowKey="id"
      renderItem={(todo) => (
        <ListItem
          actions={[
            <Button
              key="sil"
              size="sm"
              variant="ghost"
              color="error"
              icon={<Trash2 size={16} aria-hidden />}
              aria-label={t('todos.delete', { title: todo.title })}
              onClick={() => onRemove(todo)}
            />,
          ]}
        >
          <Checkbox
            checked={todo.isDone}
            onChange={() => onToggle(todo)}
            label={
              <span className={todo.isDone ? 'text-mari-muted line-through' : undefined}>
                {todo.title}
              </span>
            }
          />
        </ListItem>
      )}
    />
  );
}
