import { Component, Input } from '@angular/core';
import { FileTypesEnum } from '../../../shared/enums/FileTypesEnum';
import { UserDataModel } from '../../../core/models/user-data.model';

@Component({
  selector: 'app-program-item-list',
  templateUrl: './program-item-list.component.html',
  styleUrls: ['./program-item-list.component.scss'],
})
export class ProgramItemListComponent {
  @Input() programmingLanguage!: string;

  @Input() sourceCode!: string;

  @Input() description?: string;

  @Input() inputTypes!: FileTypesEnum[];

  @Input() outputTypes!: FileTypesEnum[];
  @Input() user!: UserDataModel;
}
