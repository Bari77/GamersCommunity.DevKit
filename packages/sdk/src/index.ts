export type GameDevMode = 'mocks' | 'api' | 'platform';

export interface GameEnvironment {
  production: boolean;
  apiUrl: string;
  useMocks?: boolean;
}

export interface FederationContract {
  remoteName: string;
  expose: string;
  routePrefix: string;
  remoteEntryDev: string;
}

export interface GatewayResourceContract {
  type: 'DATA' | 'APP' | 'INFRA';
  name: string;
  actions?: string[];
}

export function resolveGameDevMode(env: GameEnvironment): GameDevMode {
  return env.useMocks === true ? 'mocks' : 'api';
}

export function joinApiUrl(apiUrl: string, ...parts: string[]): string {
  const base = apiUrl.replace(/\/+$/, '');
  const path = parts
    .filter((p) => p != null && p !== '')
    .map((p) => String(p).replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
  return path ? `${base}/${path}` : base;
}
