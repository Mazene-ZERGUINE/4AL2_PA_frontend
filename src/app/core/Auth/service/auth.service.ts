import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { CreateUserDto } from '../models/create-user.dto';
import { LoginDto } from '../models/login.dto';
import { AccessTokenDto } from '../models/access-token.dto';
import { UserDataModel } from '../../models/user-data.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userDataSubject = new BehaviorSubject<UserDataModel | null>(null);
  public userData$ = this.userDataSubject.asObservable();

  get user() {
    return this.userDataSubject.value;
  }

  constructor(private readonly apiService: ApiService) {}

  register(payload: CreateUserDto): Observable<void> {
    return this.apiService.postRequest('auth/sign-up', payload);
  }

  login(payload: LoginDto): Observable<AccessTokenDto> {
    return this.apiService.postRequest('auth/login', payload);
  }

  getUserData(): Observable<UserDataModel> {
    this.fetchUser().subscribe();
    return this.apiService.getRequest('auth/get_info');
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('token') !== null;
  }

  private fetchUser(): Observable<void> {
    return this.apiService.getRequest('auth/get_info').pipe(
      map((user: any) => {
        this.userDataSubject.next(user);
      }),
    );
  }
}
