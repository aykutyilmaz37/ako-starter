import { sessionContext } from '@ako/web-core';
import { redirect } from 'react-router';
import { TodoForm } from '../components/todo-form';
import { TodoList } from '../components/todo-list';
import type { Route } from './+types/todos';

// ÖRNEK SAYFA: giriş gerektiren, kullanıcıya özel veri (şablondaki "Todos" özelliği; bu senaryoda alışveriş
// listesi). Veri tarayıcıda TanStack Query ile çekilir. Projede gerekmiyorsa features/todos'u silin.

export function meta() {
  return [{ title: 'Alışveriş listem | Akı Kahve' }];
}

/** Oturum yoksa sayfa hiç render edilmeden girişe yönlendirilir. */
export function loader({ context }: Route.LoaderArgs) {
  if (!context.get(sessionContext)) {
    throw redirect('/login');
  }
  return null;
}

export default function ShoppingListPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold tracking-widest text-mari-primary">HESABIM</p>
        <h1 className="font-heading text-4xl font-bold">Alışveriş listem</h1>
        <p className="text-mari-muted">Aldıklarınızı işaretleyin; liste tüm cihazlarınızda aynı.</p>
      </header>
      <TodoForm />
      <TodoList />
    </div>
  );
}
