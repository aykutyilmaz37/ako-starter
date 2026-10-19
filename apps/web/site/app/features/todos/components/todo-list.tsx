import type { TodoResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { Checkbox } from '@mari-ui/components/checkbox';
import { Empty } from '@mari-ui/components/empty';
import { List, ListItem } from '@mari-ui/components/list';
import { Trash2 } from 'lucide-react';
import { useTodos } from '~/features/todos/hooks/use-todos';

/** Alınacaklar üstte, alınanlar altta (soluk ve üstü çizili). */
export function TodoList() {
  const { todos, isLoading, toggle, remove } = useTodos();

  if (!isLoading && todos.length === 0) {
    return (
      <Empty
        title="Listeniz boş"
        description="Ürün sayfalarındaki “Alışveriş listeme ekle” ile ya da yukarıdan madde ekleyin."
        buttonText="Kahvelere göz at"
        href="/products?category=Coffee"
      />
    );
  }

  const pending = todos.filter((t) => !t.isDone);
  const done = todos.filter((t) => t.isDone);

  return (
    <div className="flex flex-col gap-8">
      <TodoSection
        title={`Alınacaklar (${pending.length})`}
        items={pending}
        loading={isLoading}
        onToggle={toggle}
        onRemove={remove}
      />
      {done.length > 0 && (
        <TodoSection
          title={`Alındı (${done.length})`}
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
              aria-label={`${todo.title} maddesini sil`}
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
