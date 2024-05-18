import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProfileService } from './profile.service';
import { AuthService } from '../../core/Auth/auth.service';
import { Observable, switchMap } from 'rxjs';
import { UserDataModel } from '../../core/models/user-data.model';
import { ProgramModel } from '../../core/models/program.model';
import { NotifierService } from '../../core/services/notifier.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  userData$!: Observable<UserDataModel>;
  selectedMenuItem: string = 'programs';
  programsList$!: Observable<ProgramModel[]>;

  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly notifier: NotifierService,
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.userData$ = this.authService.getUserData();
    this.programsList$ = this.userData$.pipe(
      switchMap((userData) => this.profileService.getUserPrograms(userData.userId)),
    );
    this.userData$.subscribe((res) => console.log(res));
  }

  onMenuItemClick(item: string) {
    this.selectedMenuItem = item;
  }

  onProfileUpdated() {
    this.loadUserData();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.profileService.uploadAvatar(file).subscribe(() => {
        this.onProfileUpdated();
        this.loadUserData();
        this.notifier.showSuccess('profile image updated');
      });
    }
  }
}
