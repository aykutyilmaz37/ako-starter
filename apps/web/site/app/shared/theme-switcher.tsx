import { THEME_PREFERENCES, getThemePreference, setThemePreference } from '@ako/web-core/theme';
import type { ThemePreference } from '@ako/web-core/theme';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@mari-ui/components/dropdown';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useT } from '~/shared/i18n/i18n-provider';

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

/** Tema seçici (sistem / açık / koyu). Tercih çerezde durur; bkz. @ako/web-core theme. */
export function ThemeSwitcher() {
  const t = useT();
  // Sunucuda çerez okunmaz; ilk çizimde "system" gösterilir, tarayıcıda gerçek tercih okunur.
  const [preference, setPreference] = useState<ThemePreference>('system');
  useEffect(() => setPreference(getThemePreference()), []);

  const Current = ICONS[preference];
  const choose = (next: ThemePreference) => {
    setThemePreference(next);
    setPreference(next);
  };

  return (
    <Dropdown className="self-center">
      <DropdownTrigger className="flex items-center" aria-label={t('theme.label')}>
        <span className="flex h-7 items-center px-2">
          <Current size={18} aria-hidden />
        </span>
      </DropdownTrigger>
      <DropdownContent>
        {THEME_PREFERENCES.map((value) => {
          const Icon = ICONS[value];
          return (
            <DropdownItem
              key={value}
              icon={<Icon size={16} aria-hidden />}
              onClick={() => choose(value)}
            >
              {t(`theme.${value}`)}
            </DropdownItem>
          );
        })}
      </DropdownContent>
    </Dropdown>
  );
}
