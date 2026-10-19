// Geçici tek dil (tr). Çoklu dil maddesinde sözlüğe taşınacak; ekranlar yalnızca bu nesneyi okur.
export const s = {
  appName: 'Akı Kahve',
  email: 'E-posta',
  password: 'Şifre',
  passwordHint: 'En az 8 karakter.',
  login: {
    title: 'Giriş yap',
    description: 'Alışveriş listene ulaşmak için hesabınla giriş yap.',
    submit: 'Giriş yap',
    invalid: 'E-posta veya şifre hatalı.',
    failed: 'Giriş yapılamadı. Biraz sonra tekrar dene.',
    verified: 'E-postan doğrulandı, şimdi giriş yapabilirsin.',
    register: 'Hesabın yok mu? Kayıt ol',
  },
  register: {
    title: 'Kayıt ol',
    description: 'Hesabını oluştur, e-postana 6 haneli bir kod göndereceğiz.',
    submit: 'Kayıt ol',
    login: 'Zaten hesabın var mı? Giriş yap',
  },
  verify: {
    title: 'E-postanı doğrula',
    info: (email: string) => `${email} adresine 6 haneli bir kod gönderdik.`,
    code: 'Kod',
    submit: 'Doğrula',
    resend: 'Kodu tekrar gönder',
    resent: 'Yeni kod gönderildi.',
    resendFailed: 'Kod gönderilemedi.',
    back: 'Girişe dön',
  },
  home: {
    products: (count: number) => `${count} ürün`,
    loadFailed: 'Ürünler alınamadı.',
    retry: 'Yenile',
    logout: 'Çıkış yap',
  },
  session: {
    offline: 'Sunucuya ulaşılamadı.',
    retry: 'Tekrar dene',
  },
};
