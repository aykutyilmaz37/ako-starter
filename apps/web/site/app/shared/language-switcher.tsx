import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@mari-ui/components/dropdown';
import { Image } from '@mari-ui/components/image';
import { useLocation } from 'react-router';
import { localizePath, stripLanguage } from '~/shared/i18n/i18n';
import { useI18n } from '~/shared/i18n/i18n-provider';

function Flag({ code }: { code: string }) {
  return <Image src={`/flags/${code}.png`} alt="" width={20} height={20} />;
}

/**
 * Dil seçici (bayrak + ad). Her seçenek aynı sayfanın o dildeki adresine giden düz bir bağlantıdır; sayfa yeni
 * dille baştan yüklenir. Açık dil tek ise görünmez.
 */
export function LanguageSwitcher() {
  const { lang, defaultLang, languages, t } = useI18n();
  const location = useLocation();
  if (languages.length < 2) return null;

  const current = languages.find((l) => l.code === lang) ?? languages[0]!;
  const path = stripLanguage(location.pathname, lang) + location.search;

  return (
    <Dropdown className="self-center">
      <DropdownTrigger className="flex items-center" aria-label={t('language.label')}>
        <span className="flex h-7 items-center gap-2 px-2">
          <Flag code={current.code} />
          <span className="hidden text-sm sm:inline">{current.name}</span>
        </span>
      </DropdownTrigger>
      <DropdownContent>
        {languages.map((l) => (
          <DropdownItem
            key={l.code}
            icon={<Flag code={l.code} />}
            href={localizePath(path, l.code, defaultLang)}
          >
            {l.name}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
