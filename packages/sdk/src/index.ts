export type GameDevMode = "mocks" | "api" | "platform";

export interface GameEnvironment {
    production: boolean;
    apiUrl: string;
    useMocks?: boolean;
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
export { GameMembershipStore } from "./membership/game-membership.store";
export { provideGameRemoteKernel, type GameRemoteKernelOptions } from "./membership/provide-game-remote-kernel";
export { GAME_MEMBERSHIP_CONFIG, GAME_PLAYER_SHEET_API, type GameMembershipConfig } from "./membership/tokens";
export type { GameSheetResolveResult } from "./membership/game-sheet-resolve-result";
export type { GamePlayerSheetApi } from "./membership/game-player-sheet-api";
export type { PlayerMediaDto, PlayerMediaKind, PlayerMediaUpdateRequestDto } from "./media/player-media.dto";
export type { PlayerMediaListRequestDto } from "./media/player-media-list-request.dto";
export type { PlayerMediaCreateRequestDto } from "./media/player-media-create-request.dto";
export { PlayerMedia } from "./media/player-media.model";
export type { PlayerMediaGalleryItem } from "./media/player-media-gallery-item.model";
export { PlayerMediaService } from "./media/player-media.service";
export { PlayerMediaStore } from "./media/player-media.store";
export { PlayerMediaStores } from "./media/player-media-stores";
export { PlatformGamesService } from "./platform/platform-games.service";
export type { PlatformGame } from "./platform/platform-game.model";
export { PlatformSessionService } from "./platform/platform-session.service";
export type { PlatformSession } from "./platform/platform-session.model";
export { PromiseUtils } from "./utils/promise.utils";
export { ResourceUtils } from "./utils/resource.utils";
