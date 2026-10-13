import { PlayerMediaCreateRequestDto } from "./player-media-create-request.dto";

export type PlayerMediaKind = "photo" | "video" | "stream";

export interface PlayerMediaDto {
    publicId: string;
    playerPublicId: string;
    url: string;
    caption: string | null;
    share: boolean;
    creationDate: string;
}

export type PlayerMediaUpdateRequestDto = Partial<PlayerMediaCreateRequestDto>;
