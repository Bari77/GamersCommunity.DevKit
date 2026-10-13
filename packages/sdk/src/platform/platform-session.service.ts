import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { BaseService } from "../http/base.service";
import { PlatformTouchDto } from "./platform-touch.dto";
import { PlatformSession } from "./platform-session.model";

@Injectable()
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
