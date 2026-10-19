# Güvenlik politikası

## Açık bildirme

Güvenlik açığı bulduysan **herkese açık issue açma**. GitHub'daki **Security → Report a vulnerability** (özel bildirim) bölümünü kullan; ya da repo sahibine e-posta at.

Bildirimde şunlar olsun: etkilenen bölüm (API / web / mobil), adım adım yeniden üretme, etkisi. Açıklamayı en kısa sürede değerlendirip dönüş yapmaya çalışırız; düzeltme yayınlanana kadar ayrıntıyı paylaşma.

## Desteklenen sürümler

Bu depo bir başlangıç şablonudur; yalnızca `main` dalı desteklenir. Şablondan türetilen projeler kendi güvenlik takibinden sorumludur.

## Bağımlılık güvenliği

- **Eşik: critical.** Dependabot yalnızca _critical_ seviyedeki açıklar için otomatik PR açar; aynı ekosistemdeki açıklar tek PR'da gruplanır. Rutin sürüm güncellemesi PR'ı açılmaz (`.github/dependabot.yml`).
- Alt seviyedeki (high/moderate/low) açıklar Dependabot uyarılarında otomatik kapatılır; ihtiyaç olursa elle ele alınır.
- CI her PR'da `pnpm audit --prod` ve `dotnet list package --vulnerable` çalıştırır; bulgular iş akışında görünür.
- Gizli bilgiler (anahtar, parola) depoya girmez; yerel geliştirme değerleri `compose.yaml` ve örnek yapılandırma dosyalarındadır.
