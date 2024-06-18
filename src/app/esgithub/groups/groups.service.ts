import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { GroupModel } from '../../core/models/group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  constructor(private readonly apiService: ApiService) {}

  getGroupsList$(): Observable<GroupModel[]> {
    return this.apiService.getRequest('groups/all');
  }

  createGroup(payload: any): Observable<GroupModel> {
    return this.apiService.postRequest('groups/create', payload);
  }

  getRecentGroups(): Observable<GroupModel[]> {
    return this.apiService.getRequest('groups/recent');
  }
}
