import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { RunCodeResponseDto } from './models/RunCodeResponseDto';
import { RunCodeRequestDto } from './models/RunCodeRequestDto';
import { CreateProgramDto } from './models/CreateProgramDto';

@Injectable({
  providedIn: 'root',
})
export class CodingProcessorService {
  constructor(private readonly apiService: ApiService) {}

  sendCodeToProcess(payload: RunCodeRequestDto): Observable<RunCodeResponseDto> {
    return this.apiService.postRequest('code-processor/run-code', payload);
  }

  shareProgram(payload: CreateProgramDto): Observable<void> {
    return this.apiService.postRequest('programs', payload);
  }
}
