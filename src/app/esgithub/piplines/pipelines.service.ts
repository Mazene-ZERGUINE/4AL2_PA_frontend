import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { ProgramModel } from '../../core/models/program.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PipelinesService {
  constructor(private readonly apiService: ApiService) {}

  getAllPrograms$(): Observable<ProgramModel[]> {
    const params = new HttpParams().set('type', 'public');
    return this.apiService.getRequest('programs', params);
  }
  runPipeLinesWithFiles(payload: any): Observable<any> {
    return this.apiService.postRequest('pipelines/file', payload);
  }
}
