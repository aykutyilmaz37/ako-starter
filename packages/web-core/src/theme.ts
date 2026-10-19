/**
 * Açık/koyu tema tercihi. mari-ui teması `[data-theme="dark|light"]` ile açıkça, hiçbiri yoksa
 * `prefers-color-scheme` ile (sistem) seçilir. Tercih çerezde ("ako_theme") tutulur ve <html data-theme>'e
 * <head>'deki küçük bir betikle, sayfa çizilmeden önce yazılır. Sunucuda render edilmez: herkese açık sayfalar
 * CDN'de ortak önbelleğe alındığı için HTML kullanıcıya göre değişemez.
 */
export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_COOKIE = 'ako_theme';
export const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

/** <head>'e satır içi konur; tercih "light" / "dark" ise <html data-theme>'i hemen ayarlar. */
export const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);if(m)document.documentElement.setAttribute('data-theme',m[1]);}catch(e){}})();`;

/** Tarayıcıda: geçerli tercihi çerezden okur. */
export function getThemePreference(): ThemePreference {
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=(light|dark)`));
  return (match?.[1] as ThemePreference | undefined) ?? 'system';
}

/** Tarayıcıda: tercihi çereze (1 yıl) yazar ve sayfaya hemen uygular. */
export function setThemePreference(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === 'system') {
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    root.removeAttribute('data-theme');
  } else {
    document.cookie = `${THEME_COOKIE}=${preference}; path=/; max-age=31536000; SameSite=Lax`;
    root.setAttribute('data-theme', preference);
  }
}
