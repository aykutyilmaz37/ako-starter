<!-- mari-ui:start -->

## mari-ui

Bu proje mari-ui tasarım sistemini kullanıyor. Sayfa, form ya da component
kurarken `.claude/skills/mari-ui/SKILL.md` skill'ini kullan (envanter, prop
sözleşmesi, sayfa kalıpları, component seçimi). Bu blok ve skill
`npx @mari-ui/cli sync` ile otomatik güncellenir, elle düzenlenmez.

Kesin kurallar:

1. **Önce mari-ui.** İhtiyacı karşılayan bir mari-ui component'i varsa (component envanterine bak) onu kullan. Yoksa projede yeni bir component yaz — ama mari-ui token'larıyla; ayrı bir stil dili icat etme. _Neden:_ Tutarlılık, erişilebilirlik ve tema desteği component'lerde zaten çözülmüş.
2. **Sabit renk yok.** Yalnız token sınıfları (`bg-mari-*`, `text-mari-*`, `border-mari-*`) ya da component'in `color` prop'u. Hex, `rgb()`, Tailwind'in hazır paleti (`bg-blue-500`) yasak. _Neden:_ Koyu mod, son kullanıcının seçtiği vurgu rengi ve otomatik kontrast düzeltmesi sabit renkte çalışmaz.
3. **Sabit px yok.** Boşluk ve boyutlar Tailwind ölçeğinden (`p-4`, `gap-2`, `h-10`); `p-[13px]` gibi arbitrary değer yok. Yazı boyutu `text-sm/base/lg…`. _Neden:_ Yoğunluk ayarı (`--spacing`) ve büyük ekran ölçeği (kök yazı boyutu) her şeyi rem üzerinden ölçekler; sabit px bunların dışında kalır.
4. **Gölge, köşe, katman skaladan.** `shadow-mari-*`, `rounded-sm/md/lg/xl`, `z-mari-*`. `shadow-2xl`, `rounded-[10px]`, `z-[999]` yok. _Neden:_ Radius ön ayarı ve katman sırası (modal > dropdown > tooltip) tek skaladan yönetiliyor.
5. **Yüklenme `skeleton` ile.** Veri beklenirken component'in kendi `skeleton` prop'unu kullan (aynı boyutta iskelet çizer). Elle iskelet ya da tek başına spinner çizme. _Neden:_ Sayfa yüklenince yerleşim zıplamaz; tüm uygulamada aynı yükleme dili.
6. **Erişilebilirlik temeli.** Yalnız ikonlu düğmelerde `aria-label`; her form kontrolü `Field` (ya da `label`/`aria-label`) ile adlı; tıklanabilir öğe `button`/`a`, `div onClick` değil. _Neden:_ Ekran okuyucu ve klavye kullanıcıları için asgari şart; component'ler gerisini çözüyor.
7. **Component linkleri `href` + `onNavigate`.** Menü/breadcrumb gibi mari-ui component'lerine `href` ver; SPA geçişi için `onNavigate` prop'una router'ın gezinme fonksiyonunu geçir, component'i Link'e sarma. Kendi yazdığın uygulama içi linklerde router'ın link component'ini kullan (React Router/Next `Link`); düz `<a href>` yalnız dış adres, dosya indirme ve tam sayfa yüklemesi gereken geçişler (OAuth/sosyal giriş) için. _Neden:_ Component'ler router'dan bağımsız; yeni sekmede açma, dış link ve erişilebilirlik bu şekilde doğru çalışır. Uygulama içi düz `<a href>` her tıklamada sayfayı baştan yükler.

<!-- mari-ui:end -->
