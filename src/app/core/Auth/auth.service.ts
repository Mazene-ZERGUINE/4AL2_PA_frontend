import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Observable } from 'rxjs';
import { CreateUserDto } from './models/create-user.dto';
import { LoginDto } from './models/login.dto';
import { AccessTokenDto } from './models/access-token.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly apiService: ApiService) {}
  register(payload: CreateUserDto): Observable<void> {
    return this.apiService.postRequest('auth/sign-up', payload);
  }
  login(payload: LoginDto): Observable<AccessTokenDto> {
    return this.apiService.postRequest('auth/login', payload);
  }
}
