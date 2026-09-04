import {
  http,
  HttpResponse,
  passthrough,
  type JsonBodyType,
  type RequestHandler,
} from 'msw';
import { joinApiUrl } from '@bari77/gc-sdk';

export function gatewayUrl(
  apiUrl: string,
  ms: string,
  resource: string,
  ...rest: (string | number)[]
): string {
  return joinApiUrl(apiUrl, ms, resource, ...rest.map(String));
}

export function createJsonListHandler(
  url: string | RegExp,
  data: JsonBodyType,
): RequestHandler {
  return http.get(url, () => HttpResponse.json(data));
}

export function createJsonGetHandler(
  url: string | RegExp,
  data: JsonBodyType,
): RequestHandler {
  return http.get(url, () => HttpResponse.json(data));
}

export function createGatewayListHandler(opts: {
  apiUrl: string;
  microservice: string;
  resource: string;
  data: JsonBodyType;
}): RequestHandler {
  const url = gatewayUrl(opts.apiUrl, opts.microservice, opts.resource);
  return createJsonListHandler(url, opts.data);
}

export function createGatewayGetHandler(opts: {
  apiUrl: string;
  microservice: string;
  resource: string;
  id: number | string;
  data: JsonBodyType;
}): RequestHandler {
  const url = gatewayUrl(opts.apiUrl, opts.microservice, opts.resource, opts.id);
  return createJsonGetHandler(url, opts.data);
}

export function createPassthroughWarningHandler(apiUrl: string): RequestHandler {
  const base = apiUrl.replace(/\/+$/, '');
  return http.all(`${base}/*`, ({ request }) => {
    console.warn('[MSW] unhandled', request.method, request.url);
    return passthrough();
  });
}
