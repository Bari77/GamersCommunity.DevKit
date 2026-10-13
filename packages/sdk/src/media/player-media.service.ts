import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { BaseService } from "../http/base.service";
import { GAME_MEMBERSHIP_CONFIG } from "../membership/tokens";
import type {
  PlayerMediaCreateRequestDto,
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

@Injectable()
export class PlayerMediaService extends BaseService {
  public constructor() {
    const config = inject(GAME_MEMBERSHIP_CONFIG);
    super(`/${config.apiSegment}`);
  }

  public list(kind: PlayerMediaKind, playerPublicId: string): Observable<PlayerMedia[]> {
    const payload: PlayerMediaListRequestDto = { playerPublicId };
    return this.postList(PlayerMedia, `${RESOURCE[kind]}/actions/List`, payload);
  }

  public create(kind: PlayerMediaKind, data: PlayerMediaCreateRequestDto): Observable<PlayerMedia> {
    return this.post(PlayerMedia, `${RESOURCE[kind]}/actions/Create`, data);
  }

  public update(
    kind: PlayerMediaKind,
    publicId: string,
    data: PlayerMediaUpdateRequestDto,
  ): Observable<PlayerMedia> {
    return this.put(PlayerMedia, `${RESOURCE[kind]}/${publicId}`, data);
  }

  public remove(kind: PlayerMediaKind, publicId: string): Observable<void> {
    return this.delete(`${RESOURCE[kind]}/${publicId}`);
  }
}
