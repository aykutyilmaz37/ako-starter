# create-ako-app

## 0.1.2

### Patch Changes

- 3cc3b3b: 0.1.1 pakette `bin/create-ako-app.mjs` ve şablonun `pnpm-lock.yaml`'ı olmadan yayınlandı (`npx create-ako-app` → "command not found"). Komut dosyası kök `.gitignore`'daki `bin/` kuralı yüzünden git'e hiç girmemişti (yerelde paketlenen 0.1.0'da vardı); artık depoda. Yayın `npm pack` ile paketlenir (pnpm lockfile'ı düşürüyordu) ve yüklemeden önce zorunlu dosyalar denetlenir.

## 0.1.1

### Patch Changes

- 6371d1f: Web: geçersiz oturumda giriş sayfası açık kalır. Site giriş sayfası kullanıcıyı ana sayfaya yalnızca `/me` başarılıysa yönlendirir (kullanıcı API'de silinmişse giriş yapılamıyordu). Sayfa isteğinde token yenilenirken API'ye ulaşılamazsa sayfa 500 vermez, oturum korunur.
