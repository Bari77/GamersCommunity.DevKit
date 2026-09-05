import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ItemDto } from "./item.dto";

@Injectable({ providedIn: "root" })
export class ItemsService {
  private readonly url = `${environment.apiUrl}/__MicroserviceId__/Items`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<ItemDto[]> {
    return this.http.get<ItemDto[]>(this.url);
  }
}
