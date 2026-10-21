---
'create-ako-app': patch
---

Web: geçersiz oturumda giriş sayfası açık kalır. Site giriş sayfası kullanıcıyı ana sayfaya yalnızca `/me` başarılıysa yönlendirir (kullanıcı API'de silinmişse giriş yapılamıyordu). Sayfa isteğinde token yenilenirken API'ye ulaşılamazsa sayfa 500 vermez, oturum korunur.
