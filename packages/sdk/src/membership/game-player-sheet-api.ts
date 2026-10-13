import { Observable } from "rxjs";
import { GameSheetResolveResult } from "./game-sheet-resolve-result";

export interface GamePlayerSheetApi {
    resolve(platformUserPublicId: string): Observable<GameSheetResolveResult>;
    load(data: { platformUserId: number; platformUserPublicId: string }): Observable<{ publicId: string }>;
}
