import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { ProfileService } from '../profile.service';
import { AuthService } from '../../../core/Auth/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserDataModel } from '../../../core/models/user-data.model';
import { Subscription, switchMap, tap } from 'rxjs';
import { NotifierService } from '../../../core/services/notifier.service';

export type UpdatePasswordDto = {
  currentPassword: string;
  newPassword: string;
};

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, OnDestroy {
  private readonly _editProfileForm = new FormGroup({
    email: new FormControl('', [Validators.email]),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    userName: new FormControl(''),
    bio: new FormControl(''),
  });

  get editProfileForm(): FormGroup {
    return this._editProfileForm as FormGroup;
  }

  private readonly _editPasswordForm: FormGroup = new FormGroup({
    currentPassword: new FormControl<string>('', [Validators.required]),
    newPassword: new FormControl<string>('', [Validators.required, Validators.min(8)]),
  });

  get editPasswordForm(): FormGroup {
    return this._editPasswordForm as FormGroup;
  }

  @Output() profileUpdated = new EventEmitter<void>();

  getUserDataSubscription = new Subscription();
  editAccountSubscription = new Subscription();
  userId!: string;

  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly notifierService: NotifierService,
  ) {}

  ngOnInit() {
    this.getUserDataSubscription = this.authService
      .getUserData()
      .subscribe((user: UserDataModel) => {
        this.editProfileForm.patchValue(user);
        this.userId = user.userId;
      });
  }

  ngOnDestroy() {
    this.getUserDataSubscription.unsubscribe();
    this.editAccountSubscription.unsubscribe();
  }
  onEditAccountClick(): void {
    if (this.editProfileForm.valid) {
      const payload: UserDataModel = this.editProfileForm.value;
      this.editAccountSubscription = this.profileService
        .editAccount(payload, this.userId)
        .pipe(
          switchMap(() => this.authService.getUserData()),
          tap((user: UserDataModel) => {
            this.editProfileForm.patchValue(user);
            this.notifierService.showSuccess('account updated');
            this.profileUpdated.emit();
          }),
        )
        .subscribe();
    }
  }
  onEditPasswordClick(): void {
    if (this.editPasswordForm.valid) {
      const payload: UpdatePasswordDto = this.editPasswordForm.value;
      this.profileService.updatePassword(payload, this.userId).subscribe(() => {
        this.notifierService.showSuccess('password updated');
      });
    } else {
      this.editPasswordForm.markAllAsTouched();
    }
  }
}
