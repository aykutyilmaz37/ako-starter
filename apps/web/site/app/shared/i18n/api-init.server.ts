import { serverRequestInit, sessionContext } from '@ako/web-core';
import type { RouterContextProvider } from 'react-router';
import { languageContext } from '~/shared/i18n/language-context';

/** Loader'larda api-client çağrılarına eklenecek başlıklar: oturumun token'ı + adresteki dil (Accept-Language). */
export function apiInit(context: Readonly<RouterContextProvider>, request: Request): RequestInit {
  const { headers } = serverRequestInit(context.get(sessionContext), request);
  return {
    headers: {
      ...(headers as Record<string, string>),
      'Accept-Language': context.get(languageContext).lang,
    },
  };
}
