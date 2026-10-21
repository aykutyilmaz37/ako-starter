---
'create-ako-app': patch
---

0.1.1 pakette `bin/create-ako-app.mjs` ve şablonun `pnpm-lock.yaml`'ı olmadan yayınlandı (`npx create-ako-app` → "command not found"). Yayın artık `npm pack` ile paketlenir ve yüklemeden önce zorunlu dosyalar denetlenir.
