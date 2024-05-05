import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly _apiUrl: string;

  constructor(private readonly httpClient: HttpClient) {
    this._apiUrl = environment.baseUrl;
  }

  count<T>(path: string): Observable<T> {
    return this.httpClient.get<T>(this.getPath(path));
  }

  create<T>(path: string, payload: T): Observable<void> {
    return this.httpClient.post<void>(this.getPath(path), payload);
  }

  delete(path: string, id: number): Observable<void> {
    return this.httpClient.delete<void>(this.getPath(path, id));
  }

  //#region     GET methods
  getAll<T>(path: string): Observable<T> {
    return this.httpClient.get<T>(this.getPath(path));
  }

  getOne<T>(path: string): Observable<T> {
    return this.httpClient.get<T>(this.getPath(path));
  }

  getOneByField<T>(path: string, field: string): Observable<T> {
    return this.httpClient.get<T>(this.getPath(path, field));
  }

  getOneById<T>(path: string, id: number): Observable<T> {
    return this.httpClient.get<T>(this.getPath(path, id));
  }

  //#endregion  GET methods

  //#region     UPDATE methods
  updatePatch<T>(path: string, field: string, payload: T): Observable<void> {
    return this.httpClient.patch<void>(this.getPath(path, field), payload);
  }

  updatePutByField<T>(path: string, field: string, payload: T): Observable<void> {
    return this.httpClient.put<void>(this.getPath(path, field), payload);
  }

  updatePutById<T>(path: string, id: number, payload: T): Observable<void> {
    return this.httpClient.put<void>(this.getPath(path, id), payload);
  }

  upsert<T>(path: string, payload: T): Observable<void> {
    return this.httpClient.post<void>(this.getPath(path), payload);
  }

  postRequest<T, R>(path: string, payload: T): Observable<R> {
    return this.httpClient.post<R>(this.getPath(path), payload);
  }

  //#endregion  UPDATE methods

  private getPath(_path: string, id?: number | string): string {
    const path = `${this._apiUrl}/${_path}`;

    return !id ? path : `${path}/${id}`;
  }
}
