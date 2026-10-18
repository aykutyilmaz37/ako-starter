// İstemci altyapısı. Endpoint'ler alt yollardan gelir:
//   import { useListProducts } from '@ako/api-client/products';
//   import { createProductBody } from '@ako/api-client/zod/products';
//   import type { ProductResponse } from '@ako/api-client/model';
export { configureApiClient, setAuthTokens, apiFetch } from './client';
export type { ApiClientConfig, AuthTokens, TokenStore } from './client';
export { ApiError, isApiError, applyFieldErrors } from './errors';
export type { ProblemDetails } from './errors';
