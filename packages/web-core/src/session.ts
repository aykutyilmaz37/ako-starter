/**
 * Oturum çerezi: access + refresh token, AES-GCM ile şifrelenip imzalanır (değiştirilirse açılmaz).
 * Sunucuda ayrı bir oturum deposu yoktur; uygulamanın kaç kopyası çalışırsa çalışsın aynı SESSION_SECRET yeterlidir.
 */
export interface Session {
  accessToken: string;
  refreshToken: string;
  /** Access token'ın bitiş anı (ms). Eski çerezlerde yoktur; o zaman süresi dolmuş sayılır. */
  expiresAt?: number;
}

const encoder = new TextEncoder();
const keys = new Map<string, Promise<CryptoKey>>();

function keyFor(secret: string): Promise<CryptoKey> {
  if (secret.length < 32) {
    throw new Error('SESSION_SECRET en az 32 karakter olmalı.');
  }

  let key = keys.get(secret);
  if (!key) {
    key = crypto.subtle
      .digest('SHA-256', encoder.encode(secret))
      .then((hash) =>
        crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']),
      );
    keys.set(secret, key);
  }
  return key;
}

export async function sealSession(session: Session, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = encoder.encode(
    JSON.stringify({ a: session.accessToken, r: session.refreshToken, e: session.expiresAt }),
  );
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFor(secret), data),
  );
  return `${toBase64Url(iv)}.${toBase64Url(cipher)}`;
}

/** Çerez bozuk, değiştirilmiş ya da başka bir secret ile şifrelenmişse null döner. */
export async function unsealSession(
  value: string | undefined,
  secret: string,
): Promise<Session | null> {
  if (!value) {
    return null;
  }

  try {
    const [iv, cipher] = value.split('.');
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64Url(iv!) },
      await keyFor(secret),
      fromBase64Url(cipher!),
    );
    const { a, r, e } = JSON.parse(new TextDecoder().decode(plain)) as {
      a: string;
      r: string;
      e?: number;
    };
    return { accessToken: a, refreshToken: r, ...(e === undefined ? {} : { expiresAt: e }) };
  } catch {
    return null;
  }
}

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(Buffer.from(value, 'base64url'));
}
