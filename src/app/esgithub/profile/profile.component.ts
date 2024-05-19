import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProfileService } from './profile.service';
import { AuthService } from '../../core/Auth/auth.service';
import { Observable, of, switchMap } from 'rxjs';
import { UserDataModel } from '../../core/models/user-data.model';
import { ProgramModel } from '../../core/models/program.model';
import { NotifierService } from '../../core/services/notifier.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

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
  isProfileOwner!: boolean;

  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly notifier: NotifierService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(
        map((params) => params['userId']),
        switchMap((userId) => {
          if (userId) {
            // todo: check if the user is a follower of the visited profile
            return this.profileService.getUserInfo(userId).pipe(
              switchMap((userData) => {
                this.isProfileOwner = false;
                this.userData$ = of(userData);
                return this.profileService.getUserPrograms(userId).pipe(
                  map((programs) =>
                    // todo: update later if follower
                    programs.filter((program) => program.visibility === 'public'),
                  ),
                );
              }),
            );
          } else {
            this.isProfileOwner = true;
            this.loadUserData();
            return this.programsList$;
          }
        }),
      )
      .subscribe((programsList: ProgramModel[]) => {
        this.programsList$ = of(programsList);
      });
  }

  loadUserData() {
    this.userData$ = this.authService.getUserData();
    this.programsList$ = this.userData$.pipe(
      switchMap((userData) => this.profileService.getUserPrograms(userData.userId)),
    );
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
