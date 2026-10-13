import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { map, Observable } from "rxjs";
import { GC_ENVIRONMENT } from "../env/tokens";
import { DtoConvertibleClass } from "./dto-convertible";

/**
 * Shared HTTP helpers for Platform / game Fronts.
 *
 * Conventions:
 * 1. Structured payloads always go through a model with `fromDto` (`getOne` / `getAll` / `post` / `put` / `postList`).
 * 2. Scalar RPC responses use typed helpers (`postBool` / `postNumber` / `postString`, and get/put variants).
 * 3. Side-effect RPC whose body is ignored → `postVoid` / `putVoid`.
 * 4. Never expose a generic “raw JSON” escape hatch on subclasses — add a model or a scalar helper instead.
 */
export abstract class BaseService {
    protected readonly http: HttpClient = inject(HttpClient);
    private readonly env = inject(GC_ENVIRONMENT);

    public constructor(private readonly baseUrlService: string) {}

    protected getOne<Tdto, Tmodel>(
        modelClass: DtoConvertibleClass<Tdto, Tmodel>,
        url: string | null = null,
    ): Observable<Tmodel> {
        return this.httpGet<Tdto>(url).pipe(map((dto) => modelClass.fromDto(dto)));
    }

    protected getAll<Tdto, Tmodel>(
        modelClass: DtoConvertibleClass<Tdto, Tmodel>,
        url: string | null = null,
    ): Observable<Tmodel[]> {
        return this.httpGet<Tdto[]>(url).pipe(map((dtos) => dtos.map((dto) => modelClass.fromDto(dto))));
    }

    protected post<Tdto, Tmodel>(
        modelClass: DtoConvertibleClass<Tdto, Tmodel>,
        url: string | null = null,
        body: unknown = {},
    ): Observable<Tmodel> {
        return this.httpPost<Tdto>(url, body).pipe(map((dto) => modelClass.fromDto(dto)));
    }

    protected put<Tdto, Tmodel>(
        modelClass: DtoConvertibleClass<Tdto, Tmodel>,
        url: string | null = null,
        body: unknown = {},
    ): Observable<Tmodel> {
        return this.httpPut<Tdto>(url, body).pipe(map((dto) => modelClass.fromDto(dto)));
    }

    protected postList<Tdto, Tmodel>(
        modelClass: DtoConvertibleClass<Tdto, Tmodel>,
        url: string | null = null,
        body: unknown = {},
    ): Observable<Tmodel[]> {
        return this.httpPost<Tdto[]>(url, body).pipe(map((dtos) => (dtos ?? []).map((dto) => modelClass.fromDto(dto))));
    }

    protected getBool(url: string | null = null): Observable<boolean> {
        return this.httpGet<boolean>(url);
    }

    protected postBool(url: string | null = null, body: unknown = {}): Observable<boolean> {
        return this.httpPost<boolean>(url, body);
    }

    protected putBool(url: string | null = null, body: unknown = {}): Observable<boolean> {
        return this.httpPut<boolean>(url, body);
    }

    protected getNumber(url: string | null = null): Observable<number> {
        return this.httpGet<number>(url);
    }

    protected postNumber(url: string | null = null, body: unknown = {}): Observable<number> {
        return this.httpPost<number>(url, body);
    }

    protected putNumber(url: string | null = null, body: unknown = {}): Observable<number> {
        return this.httpPut<number>(url, body);
    }

    protected getString(url: string | null = null): Observable<string> {
        return this.httpGet<string>(url);
    }

    protected postString(url: string | null = null, body: unknown = {}): Observable<string> {
        return this.httpPost<string>(url, body);
    }

    protected putString(url: string | null = null, body: unknown = {}): Observable<string> {
        return this.httpPut<string>(url, body);
    }

    /** RPC whose response body is discarded (fire-and-forget with HTTP success). */
    protected postVoid(url: string | null = null, body: unknown = {}): Observable<void> {
        return this.httpPost<unknown>(url, body).pipe(map(() => undefined));
    }

    protected putVoid(url: string | null = null, body: unknown = {}): Observable<void> {
        return this.httpPut<unknown>(url, body).pipe(map(() => undefined));
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

    private httpGet<T>(url: string | null): Observable<T> {
        return this.http.get<T>(this.getURL(url));
    }

    private httpPost<T>(url: string | null, body: unknown): Observable<T> {
        return this.http.post<T>(this.getURL(url), body);
    }

    private httpPut<T>(url: string | null, body: unknown): Observable<T> {
        return this.http.put<T>(this.getURL(url), body);
    }
}
