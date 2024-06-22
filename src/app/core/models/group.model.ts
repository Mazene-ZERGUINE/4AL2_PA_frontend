import { UserDataModel } from './user-data.model';
import { ProgramModel } from './program.model';

export class GroupModel {
  groupId!: string;
  name!: string;
  description?: string;
  owner!: UserDataModel;
  members!: UserDataModel[];
  created_at!: Date;
  imageUrl?: string;
  visibility?: string;
  programs?: ProgramModel[];
}
