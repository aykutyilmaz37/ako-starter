import { sessionContext } from '@ako/web-core';
import { redirect } from 'react-router';
import { TodoForm } from '~/features/todos/components/todo-form';
import { TodoList } from '~/features/todos/components/todo-list';
import { SectionHeading } from '~/shared/section-heading';
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
      <SectionHeading
        level={1}
        eyebrow="HESABIM"
        title="Alışveriş listem"
        description="Aldıklarınızı işaretleyin; liste tüm cihazlarınızda aynı."
      />
      <TodoForm />
      <TodoList />
    </div>
  );
}
