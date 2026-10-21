# Changesets

Yayınlanan tek paket `create-ako-app`'tir; şablonda (apps/, packages/) kullanıcıyı etkileyen her değişiklik bir changeset ile gelir:

```bash
pnpm --filter create-ako-app changeset
```

`create-ako-app`'i ve sürüm türünü seçin (`0.x` döneminde kırıcı değişiklik `minor`, geri kalan `patch`), kısa bir Türkçe açıklama yazın; oluşan `.changeset/*.md` dosyasını PR'a ekleyin.

main'e birleşen changeset'leri "sürüm paketleri" PR'ı toplar (`.github/workflows/release.yml`); o PR merge edilince paket npm'e taslak olarak yüklenir, npmjs.com'da 2FA ile onaylanınca yayınlanır. Ayrıntı: [packages/create-ako-app/RELEASING.md](../packages/create-ako-app/RELEASING.md).
