---
name: mari-ui-native
description: mari-ui React Native (@mari-ui/native) ile ekran, form ya da component kurarken kullan — component envanteri, prop sözleşmesi, kesin kurallar, ekran kalıpları ve component seçimi.
---
<!-- mari-ui:start -->
# mari-ui Tasarım Sistemi Kuralları — React Native (`@mari-ui/native`)

Bu dosya `npx @mari-ui/cli sync` ile OTOMATİK üretilir — `manifest.json` (component envanteri + prop sözleşmesi) ve projenin çözümlenmiş temasından türetilir. Elle düzenlemeyin; değişiklik için `mari-ui.config.json`ı güncelleyip `npx @mari-ui/cli sync`i tekrar çalıştırın.

## Kesin kurallar

Bunlar her zaman geçerli; sapma yok.

1. **Önce mari-ui.** İhtiyacı karşılayan bir `@mari-ui/native` component'i varsa (component envanterine bak) onu kullan. Yoksa projede yeni bir component yaz — ama `react-native` temel öğeleri ve mari-ui token'larıyla; ayrı bir stil dili icat etme. _Neden:_ Tutarlılık, erişilebilirlik, güvenli alan ve tema desteği component'lerde zaten çözülmüş.
2. **Yalnız `@mari-ui/native`.** Import'lar `@mari-ui/native/<subpath>`ten (ör. `@mari-ui/native/button`). `@mari-ui/components` web paketidir, bu kodda import edilmez. _Neden:_ Web paketi DOM ve CSS bekler; React Native'de derlenmez ya da sessizce bozuk çizer.
3. **Stil `StyleSheet` + token objesi.** Stil yalnız `style` prop'u ile verilir: düzen için `StyleSheet.create`, renk/boşluk/köşe için `useTheme()` (`@mari-ui/native/theme`) ya da `mari-ui-theme.ts`deki `mariTheme`. Sınıf adı dizesiyle stil verilmez; React Native bunu tanımaz. _Neden:_ Tema değişince (koyu mod, kişilik, marka rengi) token'dan okunan stil kendiliğinden güncellenir.
4. **Sabit renk ve sabit boyut yok.** Hex, `rgb()` ya da elle seçilmiş sayı (`padding: 13`) yazma. Renk `theme.color.<rol>.solid/subtle/text` ya da `theme.color.canvas.*`; boşluk `theme.spacing[n]`, köşe `theme.radius.*`. Bu değerler `"1rem"` gibi string'dir; tek bir proje yardımcısıyla sayıya çevir (bkz. rehber). Component'lerde önce `color`/`size`/`variant` prop'u. _Neden:_ Sabit değer temayla birlikte değişmez; koyu modda ve başka kişilikte yanlış görünür.
5. **Metin her zaman `Text` içinde.** Her metin `Title`, `Text` ya da `Paragraph` (`@mari-ui/native/typography`) içinde olur; `View` içine çıplak string ya da sayı koyma. Koşullu metinde `{count > 0 && …}` yerine üçlü ifade kullan. _Neden:_ React Native `View` içindeki çıplak metinde hata verir; `{0 && …}` ekrana çıplak `0` basar.
6. **Etkileşim `onPress`, erişilebilirlik zorunlu.** Dokunma olayı `onPress` / `onLongPress`. Kendi dokunulabilir öğende (`Pressable`) `accessibilityRole` ve `accessibilityLabel` zorunlu; yalnız ikonlu `Button`, `AppBarAction`, `FloatButton` için `accessibilityLabel` ver. Form kontrolü `Field` içinde ya da `accessibilityLabel` ile adlı. _Neden:_ Ekran okuyucu (VoiceOver/TalkBack) adı ve rolü yalnız bu prop'lardan okur.
7. **Gezinme router'la.** Sayfa geçişi router'ın gezinme fonksiyonuyla yapılır (ör. `onPress={() => router.push("/orders")}`). `Sidebar` için `onNavigate`, `BottomNavigation` için `onChange` içinde router'ı çağır. Adres string'iyle çalışan bağlantı öğesi yok. _Neden:_ React Native'de bağlantı etiketi yoktur; geçmiş, geri tuşu ve derin bağlantı router'da yönetilir.
8. **Yüklenme `skeleton` ile.** Veri beklenirken component'in kendi `skeleton` prop'unu kullan (aynı boyutta iskelet çizer). Elle iskelet ya da tek başına spinner çizme. _Neden:_ Ekran yüklenince yerleşim zıplamaz; tüm uygulamada aynı yükleme dili.

## Serbest alanlar

Kesin kurallar yalnız component kullanımı, token'lar ve erişilebilirlik içindir. Bunların dışı **serbest** — her uygulamayı aynı iskelete dökme:

- **Ekran düzeni ve kompozisyon:** bölüm sırası, yoğunluk ritmi, kart mı liste mi, yatay kaydırılan şeritler (`Carousel`) ekrana göre seçilir; "başlık + kart listesi" tek kalıp değildir.
- **İfade alanları:** karşılama ekranları, büyük görseller (`Image`), tipografi ağırlıklı başlıklar, giriş hareketleri kalıplaşmaz — token renkleri (`theme.color.*`), tema fontları ve kişiliğin hareket süreleriyle özgürce kurulur.
- **İçerik dili:** metinler, görsel seçimi ve ton uygulamanın hedef kitlesine göre; kişiliğin karakterini taşır.

## Tasarım kişiliği

**Editoryal** (`editorial`) — Okuma odaklı siteler: haber, blog, dergi, içerik platformları. Serif başlık, mürekkep tonları, belirgin vurgu rengi.

- Fontlar: gövde `Source Sans 3`, başlık `Fraunces`, kod `JetBrains Mono` (`ThemeProvider fonts="brand"` ile; vermezsen platform fontu)
- Köşe: `theme.radius.md` = 0.75rem · hareket: calm
- Bu değerler `useTheme()` / `mari-ui-theme.ts`den gelir; kodda tekrar yazma. Kişiliğin karakterini düzen ve içerik diliyle destekle (bkz. Serbest alanlar).

## Component envanteri

- `Accordion` → `import { Accordion } from "@mari-ui/native/accordion"`
- `ActionSheet` → `import { ActionSheet } from "@mari-ui/native/bottom-sheet"`
- `Alert` → `import { Alert } from "@mari-ui/native/alert"`
- `AppBar` → `import { AppBar } from "@mari-ui/native/app-bar"`
- `AppBarAction` → `import { AppBarAction } from "@mari-ui/native/app-bar"`
- `Avatar` → `import { Avatar } from "@mari-ui/native/avatar"`
- `AvatarGroup` → `import { AvatarGroup } from "@mari-ui/native/avatar"`
- `BackTop` → `import { BackTop } from "@mari-ui/native/float-button"`
- `Badge` → `import { Badge } from "@mari-ui/native/badge"`
- `BottomNavigation` → `import { BottomNavigation } from "@mari-ui/native/bottom-navigation"`
- `BottomSheet` → `import { BottomSheet } from "@mari-ui/native/bottom-sheet"`
- `Button` → `import { Button } from "@mari-ui/native/button"`
- `Card` → `import { Card } from "@mari-ui/native/card"`
- `CardMeta` → `import { CardMeta } from "@mari-ui/native/card"`
- `Carousel` → `import { Carousel } from "@mari-ui/native/carousel"`
- `Checkbox` → `import { Checkbox } from "@mari-ui/native/checkbox"`
- `Clock` → `import { Clock } from "@mari-ui/native/statistic"`
- `Countdown` → `import { Countdown } from "@mari-ui/native/statistic"`
- `Dialog` → `import { Dialog } from "@mari-ui/native/modal"`
- `Divider` → `import { Divider } from "@mari-ui/native/divider"`
- `Empty` → `import { Empty } from "@mari-ui/native/empty"`
- `Field` → `import { Field } from "@mari-ui/native/field"`
- `FloatButton` → `import { FloatButton } from "@mari-ui/native/float-button"`
- `FloatButtonGroup` → `import { FloatButtonGroup } from "@mari-ui/native/float-button"`
- `Image` → `import { Image } from "@mari-ui/native/image"`
- `ImageGallery` → `import { ImageGallery } from "@mari-ui/native/image-gallery"`
- `ImageViewer` → `import { ImageViewer } from "@mari-ui/native/image"`
- `Input` → `import { Input } from "@mari-ui/native/input"`
- `InputNumber` → `import { InputNumber } from "@mari-ui/native/input-number"`
- `List` → `import { List } from "@mari-ui/native/list"`
- `ListItem` → `import { ListItem } from "@mari-ui/native/list"`
- `ListItemMeta` → `import { ListItemMeta } from "@mari-ui/native/list"`
- `Loading` → `import { Loading } from "@mari-ui/native/loading"`
- `Masonry` → `import { Masonry } from "@mari-ui/native/masonry"`
- `Modal` → `import { Modal } from "@mari-ui/native/modal"`
- `NativeConfigProvider` → `import { NativeConfigProvider } from "@mari-ui/native/config"`
- `OtpInput` → `import { OtpInput } from "@mari-ui/native/input"`
- `Pagination` → `import { Pagination } from "@mari-ui/native/pagination"`
- `Paragraph` → `import { Paragraph } from "@mari-ui/native/typography"`
- `Popover` → `import { Popover } from "@mari-ui/native/popover"`
- `Progress` → `import { Progress } from "@mari-ui/native/progress"`
- `QRCode` → `import { QRCode } from "@mari-ui/native/qrcode"`
- `Radio` → `import { Radio } from "@mari-ui/native/radio"`
- `RadioGroup` → `import { RadioGroup } from "@mari-ui/native/radio"`
- `Rate` → `import { Rate } from "@mari-ui/native/rate"`
- `SafeAreaInsetsProvider` → `import { SafeAreaInsetsProvider } from "@mari-ui/native/theme"`
- `SearchInput` → `import { SearchInput } from "@mari-ui/native/input"`
- `Segmented` → `import { Segmented } from "@mari-ui/native/segmented"`
- `Select` → `import { Select } from "@mari-ui/native/select"`
- `Sidebar` → `import { Sidebar } from "@mari-ui/native/sidebar"`
- `SidebarLayout` → `import { SidebarLayout } from "@mari-ui/native/sidebar"`
- `Skeleton` → `import { Skeleton } from "@mari-ui/native/skeleton"`
- `SkeletonBlock` → `import { SkeletonBlock } from "@mari-ui/native/skeleton"`
- `SkeletonBox` → `import { SkeletonBox } from "@mari-ui/native/theme"`
- `Slider` → `import { Slider } from "@mari-ui/native/slider"`
- `Statistic` → `import { Statistic } from "@mari-ui/native/statistic"`
- `StatusBadge` → `import { StatusBadge } from "@mari-ui/native/badge"`
- `Steps` → `import { Steps } from "@mari-ui/native/steps"`
- `StepsContent` → `import { StepsContent } from "@mari-ui/native/steps"`
- `Stopwatch` → `import { Stopwatch } from "@mari-ui/native/statistic"`
- `Switch` → `import { Switch } from "@mari-ui/native/switch"`
- `Tabs` → `import { Tabs } from "@mari-ui/native/tabs"`
- `TabsContent` → `import { TabsContent } from "@mari-ui/native/tabs"`
- `TabsList` → `import { TabsList } from "@mari-ui/native/tabs"`
- `TabsTrigger` → `import { TabsTrigger } from "@mari-ui/native/tabs"`
- `Tag` → `import { Tag } from "@mari-ui/native/tag"`
- `Text` → `import { Text } from "@mari-ui/native/typography"`
- `Textarea` → `import { Textarea } from "@mari-ui/native/input"`
- `ThemeProvider` → `import { ThemeProvider } from "@mari-ui/native/theme"`
- `Timeline` → `import { Timeline } from "@mari-ui/native/timeline"`
- `Title` → `import { Title } from "@mari-ui/native/typography"`
- `ToastProvider` → `import { ToastProvider } from "@mari-ui/native/toast"`
- `Tree` → `import { Tree } from "@mari-ui/native/tree"`
- `TreeSelect` → `import { TreeSelect } from "@mari-ui/native/tree-select"`
- `Upload` → `import { Upload } from "@mari-ui/native/upload"`

## Prop API sözleşmesi

mari-ui component'leri beş paylaşılan eksenden konuşur — component'e özel isim UYDURMAYIN:

| Eksen | Geçerli değerler |
|---|---|
| `ColorRole` | `primary`, `accent`, `success`, `error`, `warning`, `info`, `neutral` |
| `Size` | `sm`, `md`, `lg` |
| `ExtendedSize` | `sm`, `md`, `lg`, `xs`, `xl` |
| `Variant` | `solid`, `outline`, `soft`, `ghost`, `link` |
| `Radius` | `sm`, `md`, `lg`, `xl`, `none`, `full` |
| `Placement` | `top`, `top-start`, `top-end`, `right`, `right-start`, `right-end`, `bottom`, `bottom-start`, `bottom-end`, `left`, `left-start`, `left-end` |

## Token listesi (bu projenin ÇÖZÜMLENMİŞ tema değerleri)

| Rol | solid (dolgu) | solidContrast (dolgu üstü metin) | subtle (yumuşak dolgu) | text (yüzey üstü metin/ikon) |
|---|---|---|---|---|
| `primary` | `#78340b` | `#ffffff` | `#f8d0b8` | `#78340b` |
| `accent` | `#ae5e3d` | `#ffffff` | `#f1e0d8` | `#7b432b` |
| `success` | `#047857` | `#ffffff` | `#d1fae5` | `#047857` |
| `error` | `#dc2626` | `#ffffff` | `#fee2e2` | `#b91c1c` |
| `warning` | `#fbbf24` | `#201c19` | `#fef3c7` | `#92400e` |
| `info` | `#0369a1` | `#ffffff` | `#e0f2fe` | `#0369a1` |
| `neutral` | `#6e5e50` | `#ffffff` | `#f3ece2` | `#6e5e50` |

## Anti-pattern'ler

### Ham hex/px değeri yazma

- ❌ `style={{ backgroundColor: "#2563eb", padding: 13 }}`
- ✅ `color="primary" size="md"  ya da  style={{ backgroundColor: theme.color.primary.subtle, padding: px(theme.spacing[3]) }}`
- Neden: Ham değer tema stüdyosunda renk ya da yoğunluk değişince GÜNCELLENMEZ; token her zaman güncel kalır.

### `View` içinde çıplak metin

- ❌ `<View>Toplam: {total}</View>`
- ✅ `<View><Text>Toplam: {total}</Text></View>`
- Neden: React Native çalışma anında hata verir ("Text strings must be rendered within a <Text> component").

### Web paketinden import

- ❌ `import { Button } from "@mari-ui/components/button"`
- ✅ `import { Button } from "@mari-ui/native/button"`
- Neden: Web paketi DOM öğeleri ve CSS üretir; mobil uygulamada çalışmaz.

### `dist/` veya `src/` içine derin import

- ❌ `import { Button } from "@mari-ui/native/dist/Button"`
- ✅ `import { Button } from "@mari-ui/native/button"`
- Neden: İç yapı bir sürüm sonrasında değişebilir; yalnız paketin `exports` haritasındaki subpath'ler kararlıdır.

### Adsız dokunulabilir öğe

- ❌ `<Pressable onPress={onDelete}><TrashIcon /></Pressable>`
- ✅ `<Button icon={<TrashIcon />} variant="ghost" onPress={onDelete} accessibilityLabel="Sil" />`
- Neden: Ekran okuyucu yalnız "düğme" der; kullanıcı neye bastığını bilemez.

## Ekran kurma rehberi (öneri)

Aşağıdakiler öneri: uygulamanın ihtiyacı ve kişiliği farklıysa sapabilirsin (bkz. Serbest alanlar), ama yukarıdaki kesin kurallar her zaman geçerli.

### Kurulum (kökte bir kez)

`npx @mari-ui/cli theme` projeye `mari-ui-theme.ts` yazar (`mariTheme.light` / `mariTheme.dark`). Kökte temayı ve güvenli alan paylarını ver:

```tsx
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeProvider } from "@mari-ui/native/theme";
import { ToastProvider } from "@mari-ui/native/toast";
import { mariTheme } from "./mari-ui-theme";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  return (
    <ThemeProvider theme={scheme === "dark" ? mariTheme.dark : mariTheme.light} insets={insets}>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
```

Marka fontları için `fonts="brand"` ver ve fontları önce `expo-font` ile yükle (kayıt adları `BRAND_FONT_FAMILIES`); vermezsen platform fontu kullanılır.

### Kendi component'inde token kullanımı

Token boyutları `"1rem"`, `"8px"` gibi string'dir; React Native sayı ister. Projede tek bir yardımcı tut:

```ts
// src/theme/px.ts
export const px = (value: string) => (value.endsWith("rem") ? Number.parseFloat(value) * 16 : Number.parseFloat(value));
```

```tsx
import { StyleSheet, View } from "react-native";
import { useTheme } from "@mari-ui/native/theme";
import { Button } from "@mari-ui/native/button";
import { Text } from "@mari-ui/native/typography";
import { px } from "../theme/px";

export function EmptyCart({ onShop }: { onShop: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: theme.color.canvas.surfaceAlt, gap: px(theme.spacing[3]), padding: px(theme.spacing[4]), borderRadius: px(theme.radius.lg) }]}>
      <Text muted>Sepetiniz boş.</Text>
      <Button color="primary" onPress={onShop}>Alışverişe başla</Button>
    </View>
  );
}

const styles = StyleSheet.create({ box: { alignItems: "center" } });
```

`StyleSheet.create` düzen (flex, hizalama) için; renk ve ölçü temadan okunduğu için satır içi verilir.

### Proje tasarım brief'i (yeni projede ya da ilk ekranda bir kez)

Kopya görünümün kaynağı component'ler değil, her projede aynı tema + aynı ekran iskeletidir. İlk ekrandan önce kısa bir brief çıkar (kullanıcıya sor ya da isteğinden türet ve onaylat):

1. **Hedef kitle ve amaç:** kim kullanacak, uygulamayı ne için açıyor.
2. **Ton:** güven veren / enerjik / sade / okumaya odaklı / prestijli.
3. **Referanslar:** kullanıcının beğendiği 2–3 uygulama; neyini beğendiği.
4. **Kişilik seç:** `corporate`, `playful`, `minimal`, `editorial`, `luxury` ya da varsayılan. `npx @mari-ui/cli theme --persona <ad>` (tamamen kendi rengi: `--primary #hex`) — bayraklı çalıştır, etkileşimli soru soramazsın; sonra `npx @mari-ui/cli sync`.
5. **Düzen yönü:** kişiliğe uygun bir ekran dili seç ve tüm ekranlarda tutarlı uygula.

Brief'i projenin README'sine (ya da bir `docs/design-brief.md`ye) kısa not olarak yaz.

### Bir ekran isteğinde iş akışı

1. **Ekranın türünü belirle:** liste, detay, form, panel, ayarlar.
2. **Envanterden parçaları seç;** eksik kalan için proje component'i yaz (kesin kural 1).
3. **Dört durumu da kur:** yükleniyor (`skeleton`), boş (`Empty`), hata (`Alert` ya da `Empty` + yeniden dene düğmesi), dolu.
4. **Cihazı düşün:** çentik ve alt çubuk (güvenli alan), klavye açıkken görünür kalan alanlar, küçük ekranda tek sütun, başparmak erişimindeki birincil eylem.
5. **Metinleri gerçekçi yaz** ve ekran başlığını `AppBar` `title` ile ver.

### Uygulama iskeleti

- **Üst çubuk:** `AppBar` (`title`, geri için `onBack`, sağda `actions` içinde `AppBarAction` — her birine `accessibilityLabel`).
- **Ana bölümler (3–5):** `BottomNavigation` (`items`: `key`, `label`, `icon`); `onChange`te router'a geç.
- **Çok bölümlü menü:** `Sidebar` (çekmece); `onNavigate` ile router'a geç.
- **Ekran içi gruplar:** `Tabs`; sıralı süreç `Steps`.

### Ekran kalıpları

- **Liste ekranı:** `AppBar` + arama `Input` + `List` (`data`, `renderItem`; sonsuz akış için `infinite`); birincil eylem `FloatButton`. Sayfalı veri gerekiyorsa `Pagination`.
- **Detay ekranı:** `AppBar` (`onBack`), içerik `Card`'larda, alt kümeler `Tabs`.
- **Form ekranı:** her alan `Field` içinde (`label`, `hint`, `error`); `Input` / `Textarea` / `Select`; çok adımlıysa `Steps`; birincil düğme altta ve tek (`block`).
- **Panel:** `Statistic` kartları, farklı yükseklikte kartlar için `Masonry`, ilerleme için `Progress`.
- **Ayarlar:** bölüm başına `Card`; anlık tercihler `Switch`.

### Component seçimi

| Durum | Kullan | Kullanma |
|---|---|---|
| Kısa karar ya da onay | `Dialog` / `Modal` | Uzun form için Modal |
| Alttan açılan içerik, filtre, uzun seçim | `BottomSheet` | Tek bir onay sorusu için BottomSheet |
| Eylem menüsü (düzenle, paylaş, sil…) | `ActionSheet` | Değer seçimi → `Select` |
| Tetikleyiciye bağlı kısa içerik | `Popover` | |
| 2–5 seçenekten biri, hepsi görünsün | `Segmented` ya da `RadioGroup` | Uzun liste → `Select` |
| Anında uygulanan aç/kapa | `Switch` | Gönderilecek formda onay → `Checkbox` |
| İşlem sonrası geçici bildirim | `useToast().showToast({ title, type })` | Kalıcı uyarı → `Alert` |
| Kayıt yok / sonuç yok | `Empty` (`actions` ile) | Boş ekran |

### Tema

- Kişilik (`persona`) renk, font, köşe, boşluk ve hareketi birlikte seçer; `mari-ui.config.json` değişince `npx @mari-ui/cli theme --yes` ve `npx @mari-ui/cli sync`. Kodda tema değeri sabitleme.
- Koyu mod: `ThemeProvider`a doğru temayı vermek yeter; component'ler ve `useTheme()` değerleri ona göre döner, ayrıca renk dalı yazma.
<!-- mari-ui:end -->
