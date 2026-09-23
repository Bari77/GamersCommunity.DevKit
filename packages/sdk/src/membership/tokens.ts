import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export interface GameMembershipConfig {
  /** Stable id used in localStorage keys (e.g. `leagueoflegends`). */
  gameId: string;
  /** Route prefix without trailing slash (e.g. `/league-of-legends`). */
  gameUrl: string;
}

export interface GameSheetResolveResult {
  playerPublicId: string | null;
  hasSheet: boolean;
}

export interface GamePlayerSheetApi {
  resolve(platformUserPublicId: string): Observable<GameSheetResolveResult>;
  load(data: {
    platformUserId: number;
    platformUserPublicId: string;
  }): Observable<{ publicId: string }>;
}

export const GAME_MEMBERSHIP_CONFIG = new InjectionToken<GameMembershipConfig>(
  "GAME_MEMBERSHIP_CONFIG",
);

export const GAME_PLAYER_SHEET_API = new InjectionToken<GamePlayerSheetApi>(
  "GAME_PLAYER_SHEET_API",
);
