import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ProgramModel } from '../../../core/models/program.model';

@Component({
  selector: 'app-user-programs',
  templateUrl: './user-programs.component.html',
  styleUrls: ['./user-programs.component.scss'],
})
export class UserProgramsComponent {
  @Input() programsList$!: Observable<ProgramModel[]>;
  @Input() profileOwner!: boolean;
}
