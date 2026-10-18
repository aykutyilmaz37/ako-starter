import { useRouteLoaderData } from 'react-router';
import type { loader } from '../root';

/** Giriş yapmış admin (root loader'da sunucuda alınır); oturum yoksa null. */
export function useMe() {
  return useRouteLoaderData<typeof loader>('root')?.me ?? null;
}
