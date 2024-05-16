import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-join',
  templateUrl: 'join.component.html',
  styleUrls: ['./join.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinComponent {
  @Input() isLogin!: boolean;
  @Input() confirmPasswordControl!: FormControl<string | null>;
  @Input() firstNameControl!: FormControl<string | null>;
  @Input() lastNameControl!: FormControl<string | null>;
  @Input() userNameControl!: FormControl<string | null>;
  @Input() emailFormControl!: FormControl<string>;
  @Input() passwordFormControl!: FormControl<string>;

  currentStep: number = 1;

  nextStep() {
    if (this.passwordFormControl.value !== this.confirmPasswordControl.value) {
      this.confirmPasswordControl.setErrors({ mismatch: true });
      return;
    }

    if (this.isStepOneValid()) {
      this.currentStep++;
    } else {
      this.emailFormControl.markAsTouched();
      this.passwordFormControl.markAsTouched();
      this.confirmPasswordControl.markAsTouched();
    }
  }

  private isStepOneValid(): boolean {
    return (
      this.emailFormControl.valid &&
      this.passwordFormControl.valid &&
      this.confirmPasswordControl.valid
    );
  }
}
