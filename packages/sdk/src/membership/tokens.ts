import { InjectionToken } from "@angular/core";
import { GamePlayerSheetApi } from "./game-player-sheet-api";

export interface GameMembershipConfig {
    /** Stable id used in localStorage keys (e.g. `league-of-legends`). */
    gameId: string;
    /** Route prefix without trailing slash (e.g. `/league-of-legends`). */
    gameUrl: string;
    /** Gateway microservice path segment without slashes (e.g. `leagueoflegends`). */
    apiSegment: string;
}

export const GAME_MEMBERSHIP_CONFIG = new InjectionToken<GameMembershipConfig>("GAME_MEMBERSHIP_CONFIG");

export const GAME_PLAYER_SHEET_API = new InjectionToken<GamePlayerSheetApi>("GAME_PLAYER_SHEET_API");
