import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  filter,
  Observable,
  Subscription,
  switchMap,
  combineLatest,
  map,
  of,
  tap,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../groups.service';
import { NotifierService } from '../../../core/services/notifier.service';
import { GroupModel } from '../../../core/models/group.model';
import { ProgramModel } from '../../../core/models/program.model';
import { AuthService } from '../../../core/Auth/service/auth.service';
import { UserDataModel } from '../../../core/models/user-data.model';
import { VisibilityEnum } from '../../../shared/enums/visibility.enum';

@Component({
  selector: 'app-groupe-home',
  templateUrl: './groupe-home.component.html',
  styleUrls: ['./groupe-home.component.scss'],
})
export class GroupeHomeComponent implements OnInit, OnDestroy {
  getRoutParamsSubscription: Subscription = new Subscription();
  userData$ = this.authService.getUserData();

  groupDetails$!: Observable<GroupModel>;
  groupPrograms$!: Observable<ProgramModel[]>;
  groupId!: string;
  isVisible: boolean = true;
  isGroupOwner: boolean = false;

  readonly anonymousImageUrl =
    'http://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly groupService: GroupsService,
    private readonly notifier: NotifierService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.getRoutParamsSubscription = this.route.params
      .pipe(
        map((params: any) => params['groupId']),
        filter((groupId: any) => groupId !== undefined),
        switchMap((groupId) => {
          this.groupId = groupId;
          //this.groupPrograms$ = this.groupService.getGroupPrograms(groupId);
          this.groupDetails$ = this.groupService.getGroupDetails(groupId);
          return combineLatest([this.groupDetails$, of(null), this.userData$]);
        }),
        tap(([group, programs, user]) => {
          this.isGroupOwner = this.isOwner(group, user);
          this.isVisible = this.isAccessible(user, group);
          console.log(programs);
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.getRoutParamsSubscription.unsubscribe();
  }

  reloadProgramDetails(): void {
    this.groupDetails$ = this.groupService.getGroupDetails(this.groupId);
  }

  reloadGroupPrograms(): void {
    this.groupPrograms$ = this.groupService.getGroupPrograms(this.groupId);
  }

  onProgramClick(): void {}

  onPublishContentClick(): void {}

  onDeleteProgramClick(): void {}

  onShowMembersClick(): void {}

  onInviteMemberClick(): void {}

  onJoinGroupClick(): void {}

  onDeleteGroupClick(): void {}

  private isAccessible(user: UserDataModel, group: GroupModel): boolean {
    if (group.visibility === VisibilityEnum.PUBLIC || this.isGroupOwner) {
      return true;
    } else {
      const isGroupMember = group.members?.filter(
        (member: UserDataModel) => member.userId === user.userId,
      );
      if (isGroupMember) return true;
      else return false;
    }
  }

  private isOwner(group: GroupModel, user: UserDataModel): boolean {
    return user.userId === group.owner.userId;
  }
}
