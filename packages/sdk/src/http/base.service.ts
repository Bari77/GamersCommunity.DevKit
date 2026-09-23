import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { map, Observable } from "rxjs";
import { GC_ENVIRONMENT } from "../env/tokens";
import type { DtoConvertibleClass } from "./dto-convertible";

export abstract class BaseService {
  protected readonly http: HttpClient = inject(HttpClient);
  private readonly env = inject(GC_ENVIRONMENT);

  public constructor(private readonly baseUrlService: string) {}

  protected getOne<Tdto, Tmodel>(
    modelClass: DtoConvertibleClass<Tdto, Tmodel>,
    url: string | null = null,
  ): Observable<Tmodel> {
    return this.http.get<Tdto>(this.getURL(url)).pipe(map((dto) => modelClass.fromDto(dto)));
  }

  protected getAll<Tdto, Tmodel>(
    modelClass: DtoConvertibleClass<Tdto, Tmodel>,
    url: string | null = null,
  ): Observable<Tmodel[]> {
    return this.http
      .get<Tdto[]>(this.getURL(url))
      .pipe(map((dtos) => dtos.map((dto) => modelClass.fromDto(dto))));
  }

  protected post<Tdto, Tmodel>(
    modelClass: DtoConvertibleClass<Tdto, Tmodel>,
    url: string | null = null,
    body: unknown = {},
  ): Observable<Tmodel> {
    return this.http.post<Tdto>(this.getURL(url), body).pipe(map((dto) => modelClass.fromDto(dto)));
  }

  protected put<Tdto, Tmodel>(
    modelClass: DtoConvertibleClass<Tdto, Tmodel>,
    url: string | null = null,
    body: unknown = {},
  ): Observable<Tmodel> {
    return this.http.put<Tdto>(this.getURL(url), body).pipe(map((dto) => modelClass.fromDto(dto)));
  }

  protected getURL(url: string | null = null): string {
    const base = new URL(this.env.apiUrl);
    const parts = [this.baseUrlService, url].filter(Boolean);

    for (const part of parts) {
      base.pathname = `${base.pathname.replace(/\/+$/, "")}/${part!.replace(/^\/+/, "")}`;
    }

    return base.toString().replace(/\/+$/, "");
  }
}
