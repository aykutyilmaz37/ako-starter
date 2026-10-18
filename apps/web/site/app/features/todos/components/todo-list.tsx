import { Button } from '@mari-ui/components/button';
import { Checkbox } from '@mari-ui/components/checkbox';
import { Empty } from '@mari-ui/components/empty';
import { useTodos } from '../hooks/use-todos';

export function TodoList() {
  const { todos, isLoading, toggle, remove } = useTodos();

  if (!isLoading && todos.length === 0) {
    return <Empty title="Henüz görev yok" description="Yukarıdan ilk görevinizi ekleyin." />;
  }

  return (
    <ul className="flex flex-col divide-y divide-mari-border">
      {todos.map((todo) => (
        <li key={todo.id} className="flex items-center gap-3 py-2">
          <Checkbox
            checked={todo.isDone}
            onChange={() => toggle(todo)}
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
            onClick={() => remove(todo)}
          >
            Sil
          </Button>
        </li>
      ))}
    </ul>
  );
}
