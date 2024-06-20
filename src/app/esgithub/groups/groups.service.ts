import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { GroupModel } from '../../core/models/group.model';
import { ProgramModel } from '../../core/models/program.model';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  constructor(private readonly apiService: ApiService) {}

  getGroupsList$(): Observable<GroupModel[]> {
    return this.apiService.getRequest('groups/all');
  }

  createGroup(payload: Partial<GroupModel>): Observable<GroupModel> {
    return this.apiService.postRequest('groups/create', payload);
  }

  getRecentGroups(): Observable<GroupModel[]> {
    return this.apiService.getRequest('groups/recent');
  }

  getGroupDetails(groupId: string): Observable<GroupModel> {
    return this.apiService.getRequest('groups/details/' + groupId);
  }

  getGroupPrograms(groupId: string): Observable<ProgramModel[]> {
    return this.apiService.getRequest('program/group/' + groupId);
  }

  //todo: impliment all other methods //
}
