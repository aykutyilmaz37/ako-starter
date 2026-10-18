import { isApiError } from '@ako/api-client';
import {
  getAdminListUsersQueryKey,
  useAdminListUsers,
  useAdminSetUserRoles,
} from '@ako/api-client/admin-users';
import type { AdminUserResponse } from '@ako/api-client/model';
import { useToast } from '@mari-ui/components/toast';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';

export const ADMIN_ROLE = 'Admin';

/** Sayfalı kullanıcı listesi; sayfa değişirken eski veri ekranda kalır (tablo zıplamaz). */
export function useUsers(params: { page: number; pageSize: number; search?: string }) {
  return useAdminListUsers(params, { query: { placeholderData: keepPreviousData } });
}

/** Kullanıcıya Admin rolü verir ya da alır; sonucu bildirir ve listeyi yeniler. */
export function useToggleAdmin() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const setRoles = useAdminSetUserRoles({
    mutation: {
      onSuccess: () => {
        showToast({ title: 'Roller güncellendi.', type: 'success' });
        void queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
      },
      onError: (error) =>
        showToast({
          title: isApiError(error) ? error.message : 'Roller güncellenemedi.',
          type: 'error',
        }),
    },
  });

  return {
    isPending: setRoles.isPending,
    toggle: (user: AdminUserResponse) => {
      const roles = user.roles.includes(ADMIN_ROLE)
        ? user.roles.filter((role) => role !== ADMIN_ROLE)
        : [...user.roles, ADMIN_ROLE];
      setRoles.mutate({ id: user.id, data: { roles } });
    },
  };
}
