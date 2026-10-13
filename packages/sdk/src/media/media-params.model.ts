import { PlayerMediaKind } from "./player-media.dto";

export interface MediaParams {
    kind: PlayerMediaKind;
    playerPublicId: string;
}
