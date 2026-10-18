import type { TodoResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { Checkbox } from '@mari-ui/components/checkbox';
import { Empty } from '@mari-ui/components/empty';
import { Skeleton } from '@mari-ui/components/skeleton';
import { Trash2 } from 'lucide-react';
import { useTodos } from '../hooks/use-todos';

/** Alınacaklar üstte, alınanlar altta (soluk ve üstü çizili). */
export function TodoList() {
  const { todos, isLoading, toggle, remove } = useTodos();

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 3 }} />;
  }

  if (todos.length === 0) {
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
      <Section
        title={`Alınacaklar (${pending.length})`}
        items={pending}
        onToggle={toggle}
        onRemove={remove}
      />
      {done.length > 0 && (
        <Section
          title={`Alındı (${done.length})`}
          items={done}
          onToggle={toggle}
          onRemove={remove}
        />
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  items: TodoResponse[];
  onToggle: (todo: TodoResponse) => void;
  onRemove: (todo: TodoResponse) => void;
}

function Section({ title, items, onToggle, onRemove }: SectionProps) {
  return (
    <section aria-label={title}>
      <h2 className="font-sans text-sm font-semibold text-mari-muted">{title}</h2>
      <ul className="mt-3 divide-y divide-mari-border rounded-mari-lg border border-mari-border bg-mari-surface">
        {items.map((todo) => (
          <li key={todo.id} className="flex min-h-14 items-center gap-3 px-4">
            <Checkbox
              checked={todo.isDone}
              onChange={() => onToggle(todo)}
              label={
                <span className={todo.isDone ? 'text-mari-muted line-through' : undefined}>
                  {todo.title}
                </span>
              }
            />
            <Button
              size="sm"
              variant="ghost"
              color="error"
              className="ml-auto"
              icon={<Trash2 size={16} aria-hidden />}
              aria-label={`${todo.title} maddesini sil`}
              onClick={() => onRemove(todo)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
