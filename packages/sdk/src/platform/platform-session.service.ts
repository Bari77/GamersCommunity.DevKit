import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { BaseService } from "../http/base.service";

interface PlatformTouchDto {
  id: number;
  publicId: string;
  nickname: string;
  discriminator: string;
  avatarUrl: string;
  activeMute?: { reason: string; endDate: string } | null;
}

export interface PlatformSession {
  id: number;
  publicId: string;
  nickname: string;
  discriminator: string;
  avatarUrl: string;
  activeMute: { reason: string; endDate: string } | null;
}

@Injectable({ providedIn: "root" })
export class PlatformSessionService extends BaseService {
  public constructor() {
    super("/platform/users");
  }

  public touch(): Observable<PlatformSession> {
    return this.http.post<PlatformTouchDto>(this.getURL("actions/Touch"), {}).pipe(
      map((dto) => ({
        id: dto.id,
        publicId: dto.publicId,
        nickname: dto.nickname,
        discriminator: dto.discriminator,
        avatarUrl: dto.avatarUrl,
        activeMute: dto.activeMute ?? null,
      })),
    );
  }
}
