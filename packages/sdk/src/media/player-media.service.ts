import { Injectable, inject } from "@angular/core";
import { map, Observable } from "rxjs";
import { BaseService } from "../http/base.service";
import { GAME_MEMBERSHIP_CONFIG } from "../membership/tokens";
import type {
  PlayerMediaCreateRequestDto,
  PlayerMediaDto,
  PlayerMediaKind,
  PlayerMediaListRequestDto,
  PlayerMediaUpdateRequestDto,
} from "./player-media.dto";
import { PlayerMedia } from "./player-media.model";

const RESOURCE: Record<PlayerMediaKind, string> = {
  photo: "PlayerPictures",
  video: "PlayerVideos",
  stream: "PlayerStreams",
};

@Injectable({ providedIn: "root" })
export class PlayerMediaService extends BaseService {
  public constructor() {
    const config = inject(GAME_MEMBERSHIP_CONFIG);
    super(`/${config.apiSegment}`);
  }

  public list(kind: PlayerMediaKind, playerPublicId: string): Observable<PlayerMedia[]> {
    const payload: PlayerMediaListRequestDto = { playerPublicId };
    return this.http
      .post<PlayerMediaDto[]>(this.getURL(`${RESOURCE[kind]}/actions/List`), payload)
      .pipe(map((dtos) => dtos.map((dto) => PlayerMedia.fromDto(dto))));
  }

  public create(kind: PlayerMediaKind, data: PlayerMediaCreateRequestDto): Observable<PlayerMedia> {
    return this.http
      .post<PlayerMediaDto>(this.getURL(`${RESOURCE[kind]}/actions/Create`), data)
      .pipe(map((dto) => PlayerMedia.fromDto(dto)));
  }

  public update(
    kind: PlayerMediaKind,
    publicId: string,
    data: PlayerMediaUpdateRequestDto,
  ): Observable<PlayerMedia> {
    return this.http
      .put<PlayerMediaDto>(this.getURL(`${RESOURCE[kind]}/${publicId}`), data)
      .pipe(map((dto) => PlayerMedia.fromDto(dto)));
  }

  public remove(kind: PlayerMediaKind, publicId: string): Observable<void> {
    return this.http.delete<void>(this.getURL(`${RESOURCE[kind]}/${publicId}`));
  }
}
