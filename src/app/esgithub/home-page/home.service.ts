import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProgramModel } from '../../core/models/program.model';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private readonly apiService: ApiService) {}

  getPrograms$(
    type: 'private' | 'public' | 'only_followers',
  ): Observable<ProgramModel[]> {
    const params = new HttpParams().append('type', type);
    return this.apiService.getRequest('programs', params);
  }
}
