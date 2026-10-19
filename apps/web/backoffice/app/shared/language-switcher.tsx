import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@mari-ui/components/dropdown';
import { Image } from '@mari-ui/components/image';
import { useI18n } from '~/shared/i18n/i18n-provider';
import { LANGUAGE_COOKIE } from '~/shared/i18n/language-context';

function Flag({ code }: { code: string }) {
  return <Image src={`/flags/${code}.png`} alt="" width={20} height={20} />;
}

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Dil seçici (bayrak + ad). Seçim ako_lang çerezine yazılır ve sayfa yeni dille yenilenir. Açık dil tek ise görünmez. */
export function LanguageSwitcher() {
  const { lang, languages, t } = useI18n();
  if (languages.length < 2) return null;

  const current = languages.find((l) => l.code === lang) ?? languages[0]!;
  const select = (code: string) => {
    document.cookie = `${LANGUAGE_COOKIE}=${code}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    window.location.reload();
  };

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
          <DropdownItem key={l.code} icon={<Flag code={l.code} />} onClick={() => select(l.code)}>
            {l.name}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
