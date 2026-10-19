import { sessionContext } from '@ako/web-core';
import { redirect } from 'react-router';
import { TodoForm } from '~/features/todos/components/todo-form';
import { TodoList } from '~/features/todos/components/todo-list';
import { localizePath, metaTranslator } from '~/shared/i18n/i18n';
import { useT } from '~/shared/i18n/i18n-provider';
import { languageContext } from '~/shared/i18n/language-context';
import { SectionHeading } from '~/shared/section-heading';
import type { Route } from './+types/todos';

// ÖRNEK SAYFA: giriş gerektiren, kullanıcıya özel veri (şablondaki "Todos" özelliği; bu senaryoda alışveriş
// listesi). Veri tarayıcıda TanStack Query ile çekilir. Projede gerekmiyorsa features/todos'u silin.

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: metaTranslator(matches)('todos.meta.title') }];
}

/** Oturum yoksa sayfa hiç render edilmeden girişe yönlendirilir. */
export function loader({ context }: Route.LoaderArgs) {
  if (!context.get(sessionContext)) {
    const { lang, defaultLang } = context.get(languageContext);
    throw redirect(localizePath('/login', lang, defaultLang));
  }
  return null;
}

export default function ShoppingListPage() {
  const t = useT();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12 sm:px-6">
      <SectionHeading
        level={1}
        eyebrow={t('todos.eyebrow')}
        title={t('todos.title')}
        description={t('todos.description')}
      />
      <TodoForm />
      <TodoList />
    </div>
  );
}
