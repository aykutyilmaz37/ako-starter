---
'create-ako-app': minor
---

Üretilen projeler deploy'a hazır: web uygulamaları için Dockerfile, tek sunucu + Docker için `compose.prod.yaml` ve `.env.prod.example` (postgres → migrate → API → site/backoffice, sağlık kontrolleri), API'de `dotnet Ako.Api.dll migrate` deploy adımı (migration + ilk Admin hesabı) ve README'de deploy bölümü. Sosyal girişten dönüşte dil korunur. Web uygulamalarında `GET /health`.
