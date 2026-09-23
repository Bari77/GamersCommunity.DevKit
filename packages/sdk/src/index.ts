export type GameDevMode = "mocks" | "api" | "platform";

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
  type: "DATA" | "APP" | "INFRA";
  name: string;
  actions?: string[];
}

export function resolveGameDevMode(env: GameEnvironment): GameDevMode {
  return env.useMocks === true ? "mocks" : "api";
}

export function joinApiUrl(apiUrl: string, ...parts: string[]): string {
  const base = apiUrl.replace(/\/+$/, "");
  const path = parts
    .filter((p) => p != null && p !== "")
    .map((p) => String(p).replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
  return path ? `${base}/${path}` : base;
}

export { GC_ENVIRONMENT, type GcRuntimeEnvironment } from "./env/tokens";
export { BaseService } from "./http/base.service";
export { type DtoConvertibleClass } from "./http/dto-convertible";
export {
  GameMembershipStore,
} from "./membership/game-membership.store";
export {
  provideGameRemoteKernel,
  type GameRemoteKernelOptions,
} from "./membership/provide-game-remote-kernel";
export {
  GAME_MEMBERSHIP_CONFIG,
  GAME_PLAYER_SHEET_API,
  type GameMembershipConfig,
  type GamePlayerSheetApi,
  type GameSheetResolveResult,
} from "./membership/tokens";
export { PlatformGamesService, type PlatformGame } from "./platform/platform-games.service";
export {
  PlatformSessionService,
  type PlatformSession,
} from "./platform/platform-session.service";
export { PromiseUtils } from "./utils/promise.utils";
export { ResourceUtils } from "./utils/resource.utils";
