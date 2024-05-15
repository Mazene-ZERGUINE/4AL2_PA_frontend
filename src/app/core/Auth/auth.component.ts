import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SubmissionType } from './utils/submission.type';

export type AuthFormType = {
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  submissionType: SubmissionType = 'login';

  readonly isLogin = this.submissionType === 'login';

  readonly authForm: FormGroup<AuthFormType> = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    confirmPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onSubmit(): void {
    console.log(this.authForm);
  }

  onToggleSubmissionType(): void {
    this.submissionType = this.submissionType === 'login' ? 'join' : 'login';
  }
}
