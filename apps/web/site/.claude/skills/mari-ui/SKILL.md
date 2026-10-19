---
name: mari-ui
description: mari-ui tasarım sistemiyle sayfa, form ya da component kurarken kullan — component envanteri, prop sözleşmesi, kesin kurallar, sayfa kalıpları ve hangi durumda hangi component rehberi.
---
<!-- mari-ui:start -->
# mari-ui Tasarım Sistemi Kuralları

Bu dosya `npx @mari-ui/cli sync` ile OTOMATİK üretilir — `manifest.json` (component envanteri + prop sözleşmesi) ve projenin çözümlenmiş temasından türetilir. Elle düzenlemeyin; değişiklik için `mari-ui.config.json`ı güncelleyip `npx @mari-ui/cli sync`i tekrar çalıştırın.

## Kesin kurallar

Bunlar her zaman geçerli; sapma yok.

1. **Önce mari-ui.** İhtiyacı karşılayan bir mari-ui component'i varsa (component envanterine bak) onu kullan. Yoksa projede yeni bir component yaz — ama mari-ui token'larıyla; ayrı bir stil dili icat etme. _Neden:_ Tutarlılık, erişilebilirlik ve tema desteği component'lerde zaten çözülmüş.
2. **Sabit renk yok.** Yalnız token sınıfları (`bg-mari-*`, `text-mari-*`, `border-mari-*`) ya da component'in `color` prop'u. Hex, `rgb()`, Tailwind'in hazır paleti (`bg-blue-500`) yasak. _Neden:_ Koyu mod, son kullanıcının seçtiği vurgu rengi ve otomatik kontrast düzeltmesi sabit renkte çalışmaz.
3. **Sabit px yok.** Boşluk ve boyutlar Tailwind ölçeğinden (`p-4`, `gap-2`, `h-10`); `p-[13px]` gibi arbitrary değer yok. Yazı boyutu `text-sm/base/lg…`. _Neden:_ Yoğunluk ayarı (`--spacing`) ve büyük ekran ölçeği (kök yazı boyutu) her şeyi rem üzerinden ölçekler; sabit px bunların dışında kalır.
4. **Gölge, köşe, katman skaladan.** `shadow-mari-*`, `rounded-sm/md/lg/xl`, `z-mari-*`. `shadow-2xl`, `rounded-[10px]`, `z-[999]` yok. _Neden:_ Radius ön ayarı ve katman sırası (modal > dropdown > tooltip) tek skaladan yönetiliyor.
5. **Yüklenme `skeleton` ile.** Veri beklenirken component'in kendi `skeleton` prop'unu kullan (aynı boyutta iskelet çizer). Elle iskelet ya da tek başına spinner çizme. _Neden:_ Sayfa yüklenince yerleşim zıplamaz; tüm uygulamada aynı yükleme dili.
6. **Erişilebilirlik temeli.** Yalnız ikonlu düğmelerde `aria-label`; her form kontrolü `Field` (ya da `label`/`aria-label`) ile adlı; tıklanabilir öğe `button`/`a`, `div onClick` değil. _Neden:_ Ekran okuyucu ve klavye kullanıcıları için asgari şart; component'ler gerisini çözüyor.
7. **Linkler düz `<a href>`.** Menü/breadcrumb gibi component'lere `href` ver; SPA geçişi için `onNavigate` prop'una router'ın gezinme fonksiyonunu geçir. Router'a özel Link sarmalayıcısı yazma. _Neden:_ Component'ler router'dan bağımsız; yeni sekmede açma, dış link ve erişilebilirlik bu şekilde doğru çalışır.

## Serbest alanlar

Kesin kurallar yalnız component kullanımı, token'lar ve erişilebilirlik içindir. Bunların dışı **serbest** — her projeyi aynı iskelete dökme:

- **Sayfa düzeni ve kompozisyon:** grid, sütun sayısı, asimetri, bölüm sırası, yoğunluk ritmi projeye göre seçilir; "başlık + kart grid'i + tablo" tek kalıp değildir.
- **İfade alanları:** hero, arka plan desenleri/degradeleri, illüstrasyon ve görsel alanları, tipografi ağırlıklı büyük başlıklar, giriş hareketleri kalıplaşmaz — token renkleri (`bg-mari-*`, `from-mari-primary-solid/…`), font değişkenleri (`font-heading`) ve `duration-*` sınıflarıyla özgürce kurulur.
- **İçerik dili:** metinler, görsel seçimi ve ton projenin hedef kitlesine göre; kişiliğin karakterini taşır.

## Tasarım kişiliği

**Editoryal** (`editorial`) — Okuma odaklı siteler: haber, blog, dergi, içerik platformları. Serif başlık, mürekkep tonları, belirgin vurgu rengi.

- Fontlar: gövde `Inter Variable`, başlık `Playfair Display Variable`, kod `JetBrains Mono`
- Köşe: `rounded-md` = 0.75rem · gölge: soft · hareket: calm
- Bu değerler tema CSS değişkenlerinden gelir; kodda tekrar yazma. Kişiliğin karakterini düzen ve içerik diliyle destekle (bkz. Serbest alanlar).

## Component envanteri

- `Accordion` → `import { Accordion } from "@mari-ui/components/accordion"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Alert` → `import { Alert } from "@mari-ui/components/alert"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `AutoComplete` → `import { AutoComplete } from "@mari-ui/components/autocomplete"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Avatar` → `import { Avatar } from "@mari-ui/components/avatar"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `AvatarGroup` → `import { AvatarGroup } from "@mari-ui/components/avatar"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `BackTop` → `import { BackTop } from "@mari-ui/components/float-button"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Badge` → `import { Badge } from "@mari-ui/components/badge"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `BarChart` → `import { BarChart } from "@mari-ui/components/chart"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `BasicMenu` → `import { BasicMenu } from "@mari-ui/components/menu"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Breadcrumb` → `import { Breadcrumb } from "@mari-ui/components/breadcrumb"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Button` → `import { Button } from "@mari-ui/components/button"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `Calendar` → `import { Calendar } from "@mari-ui/components/calendar"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Card` → `import { Card } from "@mari-ui/components/card"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `CardMeta` → `import { CardMeta } from "@mari-ui/components/card"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `Carousel` → `import { Carousel } from "@mari-ui/components/carousel"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Checkbox` → `import { Checkbox } from "@mari-ui/components/checkbox"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Clock` → `import { Clock } from "@mari-ui/components/statistic"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `ColorPicker` → `import { ColorPicker } from "@mari-ui/components/color-picker"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Countdown` → `import { Countdown } from "@mari-ui/components/statistic"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `DatePicker` → `import { DatePicker } from "@mari-ui/components/date-picker"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Divider` → `import { Divider } from "@mari-ui/components/divider"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `Drawer` → `import { Drawer } from "@mari-ui/components/drawer"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Dropdown` → `import { Dropdown } from "@mari-ui/components/dropdown"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `DropdownContent` → `import { DropdownContent } from "@mari-ui/components/dropdown"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `DropdownDivider` → `import { DropdownDivider } from "@mari-ui/components/dropdown"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `DropdownItem` → `import { DropdownItem } from "@mari-ui/components/dropdown"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `DropdownLabel` → `import { DropdownLabel } from "@mari-ui/components/dropdown"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `DropdownTrigger` → `import { DropdownTrigger } from "@mari-ui/components/dropdown"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Empty` → `import { Empty } from "@mari-ui/components/empty"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `Field` → `import { Field } from "@mari-ui/components/field"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `FloatButton` → `import { FloatButton } from "@mari-ui/components/float-button"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `FloatButtonGroup` → `import { FloatButtonGroup } from "@mari-ui/components/float-button"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Gauge` → `import { Gauge } from "@mari-ui/components/chart"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Image` → `import { Image } from "@mari-ui/components/image"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `ImageGallery` → `import { ImageGallery } from "@mari-ui/components/image"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `ImageViewer` → `import { ImageViewer } from "@mari-ui/components/image"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Input` → `import { Input } from "@mari-ui/components/input"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `InputNumber` → `import { InputNumber } from "@mari-ui/components/input-number"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `LineChart` → `import { LineChart } from "@mari-ui/components/chart"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `List` → `import { List } from "@mari-ui/components/list"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `ListItem` → `import { ListItem } from "@mari-ui/components/list"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `ListItemMeta` → `import { ListItemMeta } from "@mari-ui/components/list"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Loading` → `import { Loading } from "@mari-ui/components/loading"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `MariLogo` → `import { MariLogo } from "@mari-ui/components/logo"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `Masonry` → `import { Masonry } from "@mari-ui/components/masonry"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `MegaMenu` → `import { MegaMenu } from "@mari-ui/components/menu"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Modal` → `import { Modal } from "@mari-ui/components/modal"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `OtpInput` → `import { OtpInput } from "@mari-ui/components/input"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Pagination` → `import { Pagination } from "@mari-ui/components/pagination"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Paragraph` → `import { Paragraph } from "@mari-ui/components/typography"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `PieChart` → `import { PieChart } from "@mari-ui/components/chart"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Popconfirm` → `import { Popconfirm } from "@mari-ui/components/popconfirm"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Popover` → `import { Popover } from "@mari-ui/components/popover"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Progress` → `import { Progress } from "@mari-ui/components/progress"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `QRCode` → `import { QRCode } from "@mari-ui/components/qrcode"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Radio` → `import { Radio } from "@mari-ui/components/radio"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `RadioGroup` → `import { RadioGroup } from "@mari-ui/components/radio"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Rate` → `import { Rate } from "@mari-ui/components/rate"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `SearchInput` → `import { SearchInput } from "@mari-ui/components/input"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Segmented` → `import { Segmented } from "@mari-ui/components/segmented"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Select` → `import { Select } from "@mari-ui/components/select"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Sidebar` → `import { Sidebar } from "@mari-ui/components/menu"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Skeleton` → `import { Skeleton } from "@mari-ui/components/skeleton"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `SkeletonBlock` → `import { SkeletonBlock } from "@mari-ui/components/skeleton"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `SkeletonButton` → `import { SkeletonButton } from "@mari-ui/components/skeleton"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `SkeletonInput` → `import { SkeletonInput } from "@mari-ui/components/skeleton"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `Slider` → `import { Slider } from "@mari-ui/components/slider"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Sparkline` → `import { Sparkline } from "@mari-ui/components/chart"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Splitter` → `import { Splitter } from "@mari-ui/components/splitter"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `SplitterPanel` → `import { SplitterPanel } from "@mari-ui/components/splitter"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Statistic` → `import { Statistic } from "@mari-ui/components/statistic"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `StatusBadge` → `import { StatusBadge } from "@mari-ui/components/badge"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `Steps` → `import { Steps } from "@mari-ui/components/steps"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `StepsContent` → `import { StepsContent } from "@mari-ui/components/steps"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `Stopwatch` → `import { Stopwatch } from "@mari-ui/components/statistic"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Switch` → `import { Switch } from "@mari-ui/components/switch"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Table` → `import { Table } from "@mari-ui/components/table"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Tabs` → `import { Tabs } from "@mari-ui/components/tabs"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `TabsContent` → `import { TabsContent } from "@mari-ui/components/tabs"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `TabsList` → `import { TabsList } from "@mari-ui/components/tabs"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `TabsTrigger` → `import { TabsTrigger } from "@mari-ui/components/tabs"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Tag` → `import { Tag } from "@mari-ui/components/tag"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `Text` → `import { Text } from "@mari-ui/components/typography"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `Textarea` → `import { Textarea } from "@mari-ui/components/input"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `ThemeCustomizer` → `import { ThemeCustomizer } from "@mari-ui/components/theme-customizer"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Timeline` → `import { Timeline } from "@mari-ui/components/timeline"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `TimePicker` → `import { TimePicker } from "@mari-ui/components/date-picker"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Title` → `import { Title } from "@mari-ui/components/typography"` — sunucu bileşeni (RSC) olarak da render edilebilir
- `Toast` → `import { Toast } from "@mari-ui/components/toast"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `ToastProvider` → `import { ToastProvider } from "@mari-ui/components/toast"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Tooltip` → `import { Tooltip } from "@mari-ui/components/tooltip"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Tour` → `import { Tour } from "@mari-ui/components/tour"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Transfer` → `import { Transfer } from "@mari-ui/components/transfer"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Tree` → `import { Tree } from "@mari-ui/components/tree"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `TreeSelect` → `import { TreeSelect } from "@mari-ui/components/tree-select"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Typewriter` → `import { Typewriter } from "@mari-ui/components/typewriter"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)
- `Upload` → `import { Upload } from "@mari-ui/components/upload"` — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)

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

- ❌ `style={{ color: "#2563eb" }}  veya  className="text-[#2563eb]"`
- ✅ `color="primary"  (component zaten doğru tonu ve kontrastı kendisi çözer)`
- Neden: Ham bir hex, tema stüdyosunda kullanıcı rengi değiştirdiğinde GÜNCELLENMEZ — token her zaman güncel kalır, hardcoded değer asla.

### Tailwind arbitrary value ile boyut/renk uydurma

- ❌ `className="h-[37px] bg-[#f97316]"`
- ✅ `size="md" color="accent"`
- Neden: mari-ui'ın kendi boyut/renk skalasını atlar; component'in diğer boyutlarıyla tutarsız görünür.

### Runtime'da Tailwind class string'i üretme

- ❌ ``bg-mari-${color}-solid`  (template literal ile class ismi kurma)`
- ✅ `Literal bir Record<ColorRole, string> lookup tablosu kullan (ya da doğrudan mari-ui component'inin kendi color/variant prop'unu kullan)`
- Neden: Tailwind derleme-zamanı statik tarayıcıdır — template literal ile kurulan class asla üretilmez. Bu, projenin kendi geçmişinde Skeleton/Tag/Loading'i SESSİZCE bozan gerçek bir bug'dı (plan Faz 3).

### `dist/` veya `src/` içine derin import

- ❌ `import { Button } from "@mari-ui/components/dist/button/Button"`
- ✅ `import { Button } from "@mari-ui/components/button"`
- Neden: İç yapı bir sürüm sonrasında değişebilir; sadece paketin `exports` haritasındaki subpath'ler kararlıdır.

## Sayfa kurma rehberi (öneri)

Aşağıdakiler öneri: projenin ihtiyacı ve kişiliği farklıysa sapabilirsin (bkz. Serbest alanlar), ama yukarıdaki kesin kurallar her zaman geçerli.

### Proje tasarım brief'i (yeni projede ya da ilk sayfada bir kez)

Kopya görünümün kaynağı component'ler değil, her projede aynı tema + aynı sayfa iskeletidir. Bu yüzden ilk sayfadan önce kısa bir brief çıkar (kullanıcıya sor ya da isteğinden türet ve onaylat):

1. **Hedef kitle ve amaç:** kim kullanacak, ne yapmaya geliyor (B2B panel, tüketici uygulaması, içerik sitesi, marka vitrini…).
2. **Ton:** güven veren / enerjik / sade / okumaya odaklı / prestijli.
3. **Referanslar:** kullanıcının beğendiği 2–3 site ya da uygulama; neyini beğendiği (renk, tipografi, boşluk, hareket).
4. **Kişilik seç:** tona en yakın kişilik — `corporate` (Kurumsal), `playful` (Oyunbaz), `minimal` (Minimal), `editorial` (Editoryal), `luxury` (Lüks) ya da varsayılan. `npx @mari-ui/cli theme --persona <ad>` (varsayılan tema: `--persona default`; tamamen kendi rengi: `--primary #hex`) — bayraklı çalıştır, etkileşimli soru soramazsın. Marka rengi kişilikten farklıysa `mari-ui.config.json`'da yalnız `color.primary`'yi ez ve `npx @mari-ui/cli theme --yes`; sonra `npx @mari-ui/cli sync`.
5. **Düzen yönü:** kişiliğe uygun bir sayfa dili seç ve tüm sayfalarda tutarlı uygula — ör. Editoryal: geniş tipografik başlık, dar okuma sütunu, az kart; Oyunbaz: büyük yuvarlak kartlar, renkli vurgular, canlı giriş hareketleri; Kurumsal: sıkı tablolar, yan menü, az süs; Minimal: bol boşluk, çerçevesiz bölümler; Lüks: büyük görsel alanlar, serif başlık, yavaş geçişler.

Brief'i projenin README'sine (ya da bir `docs/design-brief.md`ye) kısa not olarak yaz; sonraki sayfalar ona uysun.

### Bir sayfa isteğinde iş akışı

1. **Sayfanın türünü belirle:** liste/tablo, detay, form, panel (dashboard), ayarlar. Aşağıdaki kalıplardan en yakınını temel al.
2. **Envanterden parçaları seç.** Her bölüm için önce mari-ui component'i ara; eksik kalan için proje component'i yaz (kesin kural 1).
3. **Dört durumu da kur:** yükleniyor (`skeleton`), boş (`Empty`), hata (`Alert` ya da `Empty` + yeniden dene düğmesi), dolu.
4. **Dar ekranı düşün:** tek sütuna düşen grid, kaydırılan ya da akordeona dönen tablo (`Table` `responsive`), mobilde çekmeceye dönen menü.
5. **Metinleri gerçekçi yaz** ve sayfa başlığını `Title` ile ver.

### Uygulama iskeleti

- **Üst gezinme:** az sayıda bölüm → `BasicMenu`; çok sayıda kategori ve görsel panel → `MegaMenu`. İkisi de mobilde kendi çekmecesine döner.
- **Yan gezinme:** yönetim panelleri ve çok seviyeli menüler → `Sidebar`.
- **Konum:** iki seviyeden derin sayfalarda içeriğin üstünde `Breadcrumb`.
- **İçerik genişliği:** okunabilir içerik için `max-w-*` (ör. `max-w-5xl mx-auto`) + `px-4 md:px-6`; tablolar ve paneller tam genişlik kullanabilir.
- **Bölümler arası boşluk** dikey `gap-6`/`gap-8`; kart içi `gap-3`/`gap-4`.

### Sayfa kalıpları

- **Liste/tablo sayfası:** başlık satırı (`Title` + birincil eylem `Button`), filtre satırı (`Input` arama, `Select`, `Segmented`), `Table` ya da `List`, altta `Pagination` (sunucu sayfalaması için Table `paginationMode="server"`). Uzun ve sürekli akışta `List` `onLoadMore`.
- **Detay sayfası:** `Breadcrumb`, başlık + eylemler, içerik `Card`'larda; ilgili alt kümeler `Tabs` ile.
- **Form sayfası:** her alan `Field` içinde (etiket, ipucu, hata metni); uzun formu `Card` bölümlerine ayır; çok adımlıysa `Steps`; kaydet/vazgeç düğmeleri en altta, birincil eylem tek.
- **Panel (dashboard):** üstte `Statistic` kartları (`grid sm:grid-cols-2 lg:grid-cols-4`, eğilim için altına `Sparkline`), altında grafik/tablo kartları; farklı yükseklikte kartlar için `Masonry`.
- **Ayarlar sayfası:** bölüm başına `Card`, `Field` yatay düzen; anlık açılıp kapanan tercihler `Switch`. Görünüm tercihi için `ThemeCustomizer`.

### Component seçimi

| Durum | Kullan | Kullanma |
|---|---|---|
| Kullanıcının odaklanması gereken kısa karar/form | `Modal` | Uzun form için Modal |
| Bağlamı kaybetmeden yan panelde düzenleme/detay | `Drawer` | Tek bir onay sorusu için Drawer |
| Bir eylemin hemen yanında "emin misiniz?" | `Popconfirm` | Geri alınamaz büyük işlem → `Modal` |
| Kısa açıklama, yalnız metin, etkileşim yok | `Tooltip` | İçinde düğme/link → `Popover` |
| Tetikleyiciye bağlı zengin içerik (form, liste) | `Popover` | |
| Eylem menüsü (düzenle, sil…) | `Dropdown` | Değer seçimi için Dropdown → `Select` |
| 2–5 seçenekten biri, hepsi görünsün | `Segmented` ya da `RadioGroup` | Uzun liste → `Select` |
| Çok seçenekten biri/birkaçı | `Select` | |
| Anında uygulanan aç/kapa | `Switch` | Gönderilecek formda onay → `Checkbox` |
| İşlem sonrası geçici bildirim | Toast (`ToastProvider` + `useToast`) | Kalıcı uyarı → `Alert` |
| Sayfada kalıcı uyarı/bilgi | `Alert` | |
| Aynı seviyede içerik grupları arası geçiş | `Tabs` | Sıralı süreç → `Steps` |
| Kayıt yok / sonuç yok | `Empty` (eylem düğmesiyle) | Boş beyaz alan |
| Zaman içinde değişim (aylık gelir, günlük ziyaret) | `LineChart` (`area` ile alan) | Kategori karşılaştırması için çizgi |
| Kategoriler arası büyüklük (kanal, bölge, ürün) | `BarChart` (uzun adlarda `layout="horizontal"`, parça–bütün için `stacked`) | 6'dan çok parçalı pasta |
| Bir bütünün 2–6 parçası | `PieChart` (`donut` ile toplam ortada) | Parçaları hassas karşılaştırmak → `BarChart` |
| Tek değerin aralıktaki yeri (doluluk, hedef, skor) | `Gauge` (eşikler için `segments`) | Doğrusal ilerleme → `Progress` |

### Tema ve ölçek

- Tasarım kişiliği (`persona`) renk, font, köşe, boşluk, gölge ve hareketi birlikte seçer; config'te açıkça yazılan alanlar onu ezer.
- Renkleri, fontları, köşe yuvarlaklığını, varsayılan yoğunluğu ve büyük ekran ölçeğini `mari-ui.config.json` belirler; değişince `npx @mari-ui/cli theme --yes` ve `npx @mari-ui/cli sync`. Kodda tema değeri sabitleme.
- Son kullanıcının görünüm tercihi (mod, vurgu rengi, yoğunluk) için `ThemeCustomizer` + `saveTheme`/`loadTheme`; açılışta yanıp sönmeyi önlemek için `getThemeScript()` çıktısını `<head>`e satır içi script olarak koy.
- Koyu modu ayrıca kodlama: token sınıfları her iki modda doğru renge döner; `dark:` varyantı gerekmez.

### Proje yapısı (framework'ten bağımsız ilkeler)

- Sayfa dosyaları ince kalsın: veri yükleme + kalıbı oluşturan bölüm component'leri.
- Birden fazla sayfada tekrar eden UI, projenin ortak component klasörüne; yalnız bir özelliğe ait olanlar o özelliğin klasörüne.
- Proje component'i mari-ui component'lerini sarmalar ve aynı eksen adlarını (`size`, `color`, `variant`…) kullanır; yeni prop adı uydurma.
<!-- mari-ui:end -->
