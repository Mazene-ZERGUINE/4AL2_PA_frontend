import { UserDataModel } from './user-data.model';

export class GroupModel {
  groupId!: string;
  name!: string;
  description?: string;
  owner!: UserDataModel;
  members!: UserDataModel[];
  created_at!: Date;
  imageUrl?: string;
}
