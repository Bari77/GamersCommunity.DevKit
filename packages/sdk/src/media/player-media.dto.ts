export type PlayerMediaKind = "photo" | "video" | "stream";

export interface PlayerMediaDto {
  publicId: string;
  playerPublicId: string;
  url: string;
  caption: string | null;
  share: boolean;
  creationDate: string;
}

export interface PlayerMediaListRequestDto {
  playerPublicId: string;
}

export interface PlayerMediaCreateRequestDto {
  url: string;
  caption: string | null;
  share: boolean;
}

export type PlayerMediaUpdateRequestDto = Partial<PlayerMediaCreateRequestDto>;
