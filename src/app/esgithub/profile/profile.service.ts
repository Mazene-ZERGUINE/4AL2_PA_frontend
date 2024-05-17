import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProgramModel } from '../../core/models/program.model';
import { ApiService } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private readonly apiService: ApiService) {}
  getUserPrograms(userId: string): Observable<ProgramModel[]> {
    return this.apiService.getRequest('programs/' + userId);
  }
}
