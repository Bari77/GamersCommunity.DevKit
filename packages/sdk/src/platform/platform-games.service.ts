import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, forkJoin, map, Observable, of, switchMap, timeout } from "rxjs";
import { GC_ENVIRONMENT } from "../env/tokens";

interface PlatformGameDto {
  id: number;
  title: string;
  urlValue: string;
  picture: string;
}

interface PlayerResolveDto {
  playerPublicId?: string | null;
  hasSheet: boolean;
}

interface GatewayAvailabilityDto {
  items?: { id: string; available: boolean }[];
}

export interface PlatformGame {
  id: number;
  title: string;
  url: string;
  iconUrl: string;
  playerPublicId: string | null;
  available: boolean;
}

@Injectable({ providedIn: "root" })
export class PlatformGamesService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(GC_ENVIRONMENT);

  public list(): Observable<PlatformGame[]> {
    return this.http
      .get<PlatformGameDto[]>(`${this.env.apiUrl}/platform/games`)
      .pipe(map((dtos) => dtos.map((dto) => this.toGame(dto))));
  }

  public listForPlayer(platformUserPublicId: string): Observable<PlatformGame[]> {
    return forkJoin({
      games: this.list(),
      availability: this.availability(),
    }).pipe(
      switchMap(({ games, availability }) => {
        if (games.length === 0) {
          return of([]);
        }

        return forkJoin(
          games.map((game) => {
            const available = availability.get(this.segment(game.url)) !== false;
            if (!available) {
              return of({ ...game, available: false, playerPublicId: null });
            }

            return this.resolve(game.url, platformUserPublicId).pipe(
              timeout(4000),
              map((playerPublicId) => ({ ...game, available: true, playerPublicId })),
              catchError(() => of({ ...game, available: false, playerPublicId: null })),
            );
          }),
        );
      }),
    );
  }

  private availability(): Observable<Map<string, boolean>> {
    return this.http.get<GatewayAvailabilityDto>(`${this.env.apiUrl}/gateway/availability`).pipe(
      map((dto) => {
        const statuses = new Map<string, boolean>();
        for (const item of dto.items ?? []) {
          statuses.set(item.id.toLowerCase(), item.available);
        }
        return statuses;
      }),
      catchError(() => of(new Map<string, boolean>())),
    );
  }

  private resolve(gameUrl: string, platformUserPublicId: string): Observable<string | null> {
    return this.http
      .post<PlayerResolveDto>(`${this.env.apiUrl}/${this.segment(gameUrl)}/Players/actions/Resolve`, {
        platformUserPublicId,
      })
      .pipe(map((dto) => (dto.hasSheet && dto.playerPublicId ? dto.playerPublicId : null)));
  }

  private segment(gameUrl: string): string {
    return gameUrl.replace(/^\/+|\/+$/g, "").replace(/-/g, "").toLowerCase();
  }

  private toGame(dto: PlatformGameDto): PlatformGame {
    return {
      id: dto.id,
      title: dto.title,
      url: dto.urlValue.startsWith("/") ? dto.urlValue : `/${dto.urlValue}`,
      iconUrl: `${this.env.assetsBaseUrl}/Icons/Games/${dto.picture}.png`,
      playerPublicId: null,
      available: true,
    };
  }
}
