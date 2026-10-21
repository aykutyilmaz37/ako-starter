<!-- mari-ui:start -->
## mari-ui (React Native)

Bu proje mari-ui'ın React Native katmanını (`@mari-ui/native`) kullanıyor.
Ekran, form ya da component kurarken `.claude/skills/mari-ui-native/SKILL.md` skill'ini kullan
(envanter, prop sözleşmesi, ekran kalıpları, component seçimi). Bu blok ve skill
`npx @mari-ui/cli sync` ile otomatik güncellenir, elle düzenlenmez.

Kesin kurallar:

1. **Önce mari-ui.** İhtiyacı karşılayan bir `@mari-ui/native` component'i varsa (component envanterine bak) onu kullan. Yoksa projede yeni bir component yaz — ama `react-native` temel öğeleri ve mari-ui token'larıyla; ayrı bir stil dili icat etme. _Neden:_ Tutarlılık, erişilebilirlik, güvenli alan ve tema desteği component'lerde zaten çözülmüş.
2. **Yalnız `@mari-ui/native`.** Import'lar `@mari-ui/native/<subpath>`ten (ör. `@mari-ui/native/button`). `@mari-ui/components` web paketidir, bu kodda import edilmez. _Neden:_ Web paketi DOM ve CSS bekler; React Native'de derlenmez ya da sessizce bozuk çizer.
3. **Stil `StyleSheet` + token objesi.** Stil yalnız `style` prop'u ile verilir: düzen için `StyleSheet.create`, renk/boşluk/köşe için `useTheme()` (`@mari-ui/native/theme`) ya da `mari-ui-theme.ts`deki `mariTheme`. Sınıf adı dizesiyle stil verilmez; React Native bunu tanımaz. _Neden:_ Tema değişince (koyu mod, kişilik, marka rengi) token'dan okunan stil kendiliğinden güncellenir.
4. **Sabit renk ve sabit boyut yok.** Hex, `rgb()` ya da elle seçilmiş sayı (`padding: 13`) yazma. Renk `theme.color.<rol>.solid/subtle/text` ya da `theme.color.canvas.*`; boşluk `theme.spacing[n]`, köşe `theme.radius.*`. Bu değerler `"1rem"` gibi string'dir; tek bir proje yardımcısıyla sayıya çevir (bkz. rehber). Component'lerde önce `color`/`size`/`variant` prop'u. _Neden:_ Sabit değer temayla birlikte değişmez; koyu modda ve başka kişilikte yanlış görünür.
5. **Metin her zaman `Text` içinde.** Her metin `Title`, `Text` ya da `Paragraph` (`@mari-ui/native/typography`) içinde olur; `View` içine çıplak string ya da sayı koyma. Koşullu metinde `{count > 0 && …}` yerine üçlü ifade kullan. _Neden:_ React Native `View` içindeki çıplak metinde hata verir; `{0 && …}` ekrana çıplak `0` basar.
6. **Etkileşim `onPress`, erişilebilirlik zorunlu.** Dokunma olayı `onPress` / `onLongPress`. Kendi dokunulabilir öğende (`Pressable`) `accessibilityRole` ve `accessibilityLabel` zorunlu; yalnız ikonlu `Button`, `AppBarAction`, `FloatButton` için `accessibilityLabel` ver. Form kontrolü `Field` içinde ya da `accessibilityLabel` ile adlı. _Neden:_ Ekran okuyucu (VoiceOver/TalkBack) adı ve rolü yalnız bu prop'lardan okur.
7. **Gezinme router'la.** Sayfa geçişi router'ın gezinme fonksiyonuyla yapılır (ör. `onPress={() => router.push("/orders")}`). `Sidebar` için `onNavigate`, `BottomNavigation` için `onChange` içinde router'ı çağır. Adres string'iyle çalışan bağlantı öğesi yok. _Neden:_ React Native'de bağlantı etiketi yoktur; geçmiş, geri tuşu ve derin bağlantı router'da yönetilir.
8. **Yüklenme `skeleton` ile.** Veri beklenirken component'in kendi `skeleton` prop'unu kullan (aynı boyutta iskelet çizer). Elle iskelet ya da tek başına spinner çizme. _Neden:_ Ekran yüklenince yerleşim zıplamaz; tüm uygulamada aynı yükleme dili.
<!-- mari-ui:end -->
