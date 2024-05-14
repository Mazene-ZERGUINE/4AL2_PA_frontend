import { FileTypesEnum } from '../../shared/enums/FileTypesEnum';

export class ProgramModel {
  programId!: string;
  description?: string;
  programmingLanguage!: string;
  sourceCode!: string;
  visibility!: string;
  inputTypes!: FileTypesEnum[];
  outputTypes!: FileTypesEnum[];
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
