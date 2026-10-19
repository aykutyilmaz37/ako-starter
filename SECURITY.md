# Güvenlik

## Açık bildirme

Güvenlik açığı bulduysan **herkese açık issue açma**. GitHub'daki **Security → Report a vulnerability** (özel bildirim) bölümünü kullan. Bildirimde etkilenen bölümü (API / web / mobil), yeniden üretme adımlarını ve etkisini yaz; düzeltme yayınlanana kadar ayrıntıyı paylaşma.

Bu depo bir başlangıç şablonudur; yalnızca `main` desteklenir. Şablondan türetilen projeler kendi güvenlik takibinden sorumludur.

## Bağımlılık taraması

CI her push/PR'da taramayı çalıştırır (`.github/workflows/ci.yml`). Eşik **`critical`**: bugün itibarıyla **0** bulgu. High ve altı bulgular bilgilendirme amaçlıdır, CI'ı kırmaz.

- **Dependabot** yalnızca güvenlik güncellemesi için çalışır; rutin sürüm PR'ı açmaz. Aynı ekosistemdeki açıklar tek PR'da gruplanır (`.github/dependabot.yml`). Alt seviyedeki uyarıların otomatik kapatılması repo ayarlarındaki _Dependabot rules_ ile yapılır.
- `pnpm audit` ve `dotnet list package --vulnerable` bulguları yerelde de görülebilir.

## Bilinen, kabul edilmiş risk

Yok (son tarama: 2026-10-19, `pnpm audit` ve `dotnet list package --vulnerable`: 0 bulgu). Yama çıkmayan ya da kırıcı olduğu için ertelenen bir bulgu olursa buraya paket, seviye, kaynağı ve neden kabul edildiği yazılır.

## Nasıl çalıştırılır

```bash
pnpm audit              # tam rapor (bilgilendirme, CI'ı kırmaz)
pnpm run audit          # yalnızca critical eşiği (CI'ın kullandığı komut)
dotnet list apps/api/Ako.slnx package --vulnerable --include-transitive
```

Doğrudan seçmediğimiz ama transitif gelen paketleri yamalı sürüme zorlamak gerekirse `pnpm-workspace.yaml` içine `overrides` eklenir ve burada belirtilir.
