import { FileTypesEnum } from '../../shared/enums/FileTypesEnum';
import { UserDataModel } from './user-data.model';
import { ReactionModel } from './reaction.model';

export class ProgramModel {
  programId!: string;
  description?: string;
  programmingLanguage!: string;
  sourceCode!: string;
  visibility!: string;
  inputTypes!: FileTypesEnum[];
  outputTypes!: FileTypesEnum[];
  user!: UserDataModel;
  userId!: string;
  reactions!: ReactionModel[];
  createdAt!: Date;
  updatedAt!: Date;
}
