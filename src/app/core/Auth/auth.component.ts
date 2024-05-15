import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

export type AuthFormType = {
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
  userName: FormControl<string | null>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string | null>;
};

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent implements OnInit {
  isLogin = true;

  readonly authForm: FormGroup<AuthFormType> = new FormGroup({
    firstName: new FormControl<string | null>(null),
    lastName: new FormControl<string | null>(null),
    userName: new FormControl<string | null>(null),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl<string | null>(null),
  });

  ngOnInit(): void {
    this.updateValidators();
  }

  onToggleSubmissionType(): void {
    this.isLogin = !this.isLogin;
    this.updateValidators();
  }

  updateValidators(): void {
    if (this.isLogin) {
      this.authForm.controls.firstName.clearValidators();
      this.authForm.controls.lastName.clearValidators();
      this.authForm.controls.userName.clearValidators();
      this.authForm.controls.confirmPassword.clearValidators();

      // Reset values to null when in login mode
      this.authForm.controls.firstName.setValue(null);
      this.authForm.controls.lastName.setValue(null);
      this.authForm.controls.userName.setValue(null);
      this.authForm.controls.confirmPassword.setValue(null);
    } else {
      this.authForm.controls.firstName.setValidators([Validators.required]);
      this.authForm.controls.lastName.setValidators([Validators.required]);
      this.authForm.controls.userName.setValidators([Validators.required]);
      this.authForm.controls.confirmPassword.setValidators([Validators.required]);
    }
    this.authForm.controls.firstName.updateValueAndValidity();
    this.authForm.controls.lastName.updateValueAndValidity();
    this.authForm.controls.userName.updateValueAndValidity();
    this.authForm.controls.confirmPassword.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      console.log('Form Submitted', this.authForm.value);
    } else {
      console.log('Form Invalid');
      this.authForm.markAllAsTouched();
    }
  }
}
