import { Component, Input } from '@angular/core';
import { ReactionsEnum } from 'src/app/shared/enums/reactions.enum';
import { ProgramModel } from '../../../core/models/program.model';

@Component({
  selector: 'app-user-programs',
  templateUrl: './user-programs.component.html',
  styleUrls: ['./user-programs.component.scss'],
})
export class UserProgramsComponent {
  @Input() programsList: ProgramModel[] | undefined;

  @Input() profileOwner: boolean | undefined;

  readonly ReactionsEnum = ReactionsEnum;
}
