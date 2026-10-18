/**
 * API'nin tüm hataları RFC 9457 ProblemDetails biçimindedir (bkz. apps/api README "Hatalar").
 *   400 doğrulama : { errors: { price: ["'Fiyat' değeri ..."] } }
 *   iş hatası     : { code: "products.sku_taken", detail: "..." }
 *   yetki         : 401 / 403, çok fazla istek: 429
 * Mesajlar Accept-Language'e göre API'de çevrilir; istemci `detail`'i gösterir, `code`'a göre karar verir.
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}

export class ApiError extends Error {
  readonly status: number;
  /** Makine tarafından okunan hata kodu, ör. "products.sku_taken". Doğrulama hatalarında yoktur. */
  readonly code: string | undefined;
  /** Alan bazlı doğrulama hataları; anahtarlar form alan adlarıdır (camelCase). */
  readonly fieldErrors: Record<string, string[]>;
  readonly problem: ProblemDetails;

  constructor(status: number, problem: ProblemDetails) {
    super(problem.detail ?? problem.title ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = problem.code;
    this.fieldErrors = problem.errors ?? {};
    this.problem = problem;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** react-hook-form'un setError imzası (paket bağımlılığı olmasın diye burada tanımlı). */
type SetError = (name: never, error: { type: string; message: string }) => void;

/**
 * 400 cevabındaki alan hatalarını forma bağlar; alanla eşleşmeyen hata varsa "root.server"a yazar.
 * İşlenecek bir şey varsa true döner.
 *
 * @example
 * onError: (error) => { if (!applyFieldErrors(error, form.setError)) toast(error.message) }
 */
export function applyFieldErrors(error: unknown, setError: SetError): boolean {
  if (!isApiError(error)) {
    return false;
  }

  const entries = Object.entries(error.fieldErrors);
  for (const [field, messages] of entries) {
    (setError as (name: string, e: { type: string; message: string }) => void)(field, {
      type: 'server',
      message: messages.join(' '),
    });
  }

  if (entries.length === 0 && error.status === 400) {
    (setError as (name: string, e: { type: string; message: string }) => void)('root.server', {
      type: 'server',
      message: error.message,
    });
    return true;
  }

  return entries.length > 0;
}
