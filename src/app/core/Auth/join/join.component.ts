import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SubmissionType } from '../utils/submission.type';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-join',
  templateUrl: 'join.component.html',
  styleUrls: ['./join.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinComponent {
  @Input() submissionType!: SubmissionType;

  @Input() confirmPasswordControl!: FormControl<string>;
}
