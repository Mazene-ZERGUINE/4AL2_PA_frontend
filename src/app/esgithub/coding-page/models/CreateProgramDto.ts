import { FileTypesEnum } from '../../../shared/enums/FileTypesEnum';

export type CreateProgramDto = {
  description?: string;
  programmingLanguage: 'python | javascript';

  sourceCode: string;
  visibility: 'public | private | only_follower';

  inputTypes: FileTypesEnum[];

  outputTypes: FileTypesEnum[];

  userId: string;
};
