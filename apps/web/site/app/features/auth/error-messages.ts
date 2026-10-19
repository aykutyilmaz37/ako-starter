/** Sosyal giriş dönüşünde (?error=…) ve BFF'te gelen hata kodlarının kullanıcıya gösterilen karşılığı. */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth.email_in_use':
    'Bu e-posta ile kayıtlı bir hesap var. Önce e-posta ve şifrenizle giriş yapın.',
  'auth.external_failed': 'Sosyal giriş tamamlanamadı.',
  'auth.provider_unavailable': 'Bu giriş yöntemi etkin değil.',
  'auth.role_required': 'Bu uygulamaya erişim yetkiniz yok.',
};
