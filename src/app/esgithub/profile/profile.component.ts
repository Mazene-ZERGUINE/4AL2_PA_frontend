import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { AuthService } from '../../core/Auth/auth.service';
import { Observable, switchMap } from 'rxjs';
import { UserDataModel } from '../../core/models/user-data.model';
import { ProgramModel } from '../../core/models/program.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  userData$!: Observable<UserDataModel>;
  selectedMenuItem: string = 'programs';
  programsList$!: Observable<ProgramModel[]>;
  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit() {
    this.userData$ = this.authService.getUserData();
    this.programsList$ = this.userData$.pipe(
      switchMap((userData) => this.profileService.getUserPrograms(userData.userId)),
    );

    this.programsList$.subscribe((res) => console.log(res));
  }

  onMenuItemClick(item: string) {
    this.selectedMenuItem = item;
  }
}
