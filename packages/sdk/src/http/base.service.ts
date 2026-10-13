import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { map, Observable } from "rxjs";
import { GC_ENVIRONMENT } from "../env/tokens";
import type { DtoConvertibleClass } from "./dto-convertible";

/**
 * Shared HTTP helpers for Platform / game Fronts.
 *
 * - `getOne` / `getAll` / `post` / `put` — DTO → domain model via `fromDto`
 * - `getJson` / `postJson` / `putJson` / `delete` — raw JSON / void (RPC actions, primitives)
 * - `postList` — POST → `Tmodel[]` via `fromDto`
 */
export abstract class BaseService {
  protected readonly http: HttpClient = inject(HttpClient);
  private readonly env = inject(GC_ENVIRONMENT);

  public constructor(private readonly baseUrlService: string) {}

  protected getOne<Tdto, Tmodel>(
    modelClass: DtoConvertibleClass<Tdto, Tmodel>,
    url: string | null = null,
  ): Observable<Tmodel> {
    return this.getJson<Tdto>(url).pipe(map((dto) => modelClass.fromDto(dto)));
  }

  /** Alias of {@link getOne} for callers migrated from Platform’s local BaseService. */
  protected get<Tdto, Tmodel>(
    modelClass: DtoConvertibleClass<Tdto, Tmodel>,
    url: string | null = null,
  ): Observable<Tmodel> {
    return this.getOne(modelClass, url);
  }

  protected getAll<Tdto, Tmodel>(
    modelClass: DtoConvertibleClass<Tdto, Tmodel>,
    url: string | null = null,
  ): Observable<Tmodel[]> {
    return this.getJson<Tdto[]>(url).pipe(map((dtos) => dtos.map((dto) => modelClass.fromDto(dto))));
  }

  protected post<Tdto, Tmodel>(
    modelClass: DtoConvertibleClass<Tdto, Tmodel>,
    url: string | null = null,
    body: unknown = {},
  ): Observable<Tmodel> {
    return this.postJson<Tdto>(url, body).pipe(map((dto) => modelClass.fromDto(dto)));
  }

  protected put<Tdto, Tmodel>(
    modelClass: DtoConvertibleClass<Tdto, Tmodel>,
    url: string | null = null,
    body: unknown = {},
  ): Observable<Tmodel> {
    return this.putJson<Tdto>(url, body).pipe(map((dto) => modelClass.fromDto(dto)));
  }

  protected postList<Tdto, Tmodel>(
    modelClass: DtoConvertibleClass<Tdto, Tmodel>,
    url: string | null = null,
    body: unknown = {},
  ): Observable<Tmodel[]> {
    return this.postJson<Tdto[]>(url, body).pipe(
      map((dtos) => (dtos ?? []).map((dto) => modelClass.fromDto(dto))),
    );
  }

  protected getJson<T>(url: string | null = null): Observable<T> {
    return this.http.get<T>(this.getURL(url));
  }

  protected postJson<T>(url: string | null = null, body: unknown = {}): Observable<T> {
    return this.http.post<T>(this.getURL(url), body);
  }

  protected putJson<T>(url: string | null = null, body: unknown = {}): Observable<T> {
    return this.http.put<T>(this.getURL(url), body);
  }

  protected delete(url: string | null = null): Observable<void> {
    return this.http.delete<void>(this.getURL(url));
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
