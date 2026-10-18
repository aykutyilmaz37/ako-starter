import { sessionContext } from '@ako/web-core';
import { Title } from '@mari-ui/components/typography';
import { redirect } from 'react-router';
import { TodoForm } from '../components/todo-form';
import { TodoList } from '../components/todo-list';
import type { Route } from './+types/todos';

// ÖRNEK SAYFA: giriş gerektiren, kullanıcıya özel veri; tarayıcıda TanStack Query ile. Projede gerekmiyorsa features/todos'u silin.

export function meta() {
  return [{ title: 'Görevlerim | Ako' }];
}

/** Oturum yoksa sayfa hiç render edilmeden girişe yönlendirilir. */
export function loader({ context }: Route.LoaderArgs) {
  if (!context.get(sessionContext)) {
    throw redirect('/login');
  }
  return null;
}

export default function TodosPage() {
  return (
    <section className="flex flex-col gap-6">
      <Title level={2}>Görevlerim</Title>
      <TodoForm />
      <TodoList />
    </section>
  );
}
