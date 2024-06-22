import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  filter,
  Observable,
  switchMap,
  combineLatest,
  map,
  tap,
  takeUntil,
  Subject,
  mergeMap,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../groups.service';
import { NotifierService } from '../../../core/services/notifier.service';
import { GroupModel } from '../../../core/models/group.model';
import { AuthService } from '../../../core/Auth/service/auth.service';
import { UserDataModel } from '../../../core/models/user-data.model';
import { VisibilityEnum } from '../../../shared/enums/visibility.enum';
import { ModalService } from '../../../core/services/modal.service';
import { ConfirmationModalComponent } from '../../../core/modals/conifrmatio-modal/confirmation-modal.component';
import { ShareCodeModalComponent } from '../../../core/modals/share-code-modal/share-code-modal.component';
import { GroupPublishModalComponent } from '../../../core/modals/group-publish-modal/group-publish-modal.component';
import { group } from '@angular/animations';
import { ReactionsEnum } from '../../../shared/enums/reactions.enum';
import { HomeService } from '../../home-page/home.service';

@Component({
  selector: 'app-groupe-home',
  templateUrl: './groupe-home.component.html',
  styleUrls: ['./groupe-home.component.scss'],
})
export class GroupeHomeComponent implements OnInit, OnDestroy {
  readonly componentDestory$ = new Subject<void>();

  userData$ = this.authService.getUserData();

  groupDetails$!: Observable<GroupModel>;
  groupId!: string;
  isVisible: boolean = true;
  isGroupOwner: boolean = false;
  private userId!: string;

  readonly anonymousGroupImage =
    'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L3AtMjAwLWV5ZS0wMzQyNzAyLmpwZw.jpg';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly groupService: GroupsService,
    private readonly notifier: NotifierService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly modalService: ModalService,
    private readonly homeService: HomeService,
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.componentDestory$),
        map((params: any) => params['groupId']),
        filter((groupId: any) => groupId !== undefined),
        switchMap((groupId) => {
          this.groupId = groupId;
          this.groupDetails$ = this.groupService.getGroupDetails(groupId);
          return combineLatest([this.groupDetails$, this.userData$]);
        }),
        tap(([group, user]) => {
          console.log(group.programs);
          this.isGroupOwner = this.isOwner(group, user);
          this.isVisible = this.isAccessible(user, group);
          this.userId = user.userId;
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.componentDestory$.next();
    this.componentDestory$.complete();
  }

  reloadProgramDetails(): void {
    this.groupDetails$ = this.groupService.getGroupDetails(this.groupId);
  }

  onProgramClick(): void {}

  onPublishProgramClick(): void {
    this.modalService
      .openDialog(GroupPublishModalComponent, 700)
      .pipe(
        filter((result) => result !== undefined),
        takeUntil(this.componentDestory$),
        mergeMap((createGroupResult) =>
          this.modalService
            .openDialog(ShareCodeModalComponent, 800)
            .pipe(map((shareCodeResult) => [createGroupResult, shareCodeResult])),
        ),
        switchMap(([createGroupResult, shareCodeResult]) => {
          const payload = {
            ...shareCodeResult,
            sourceCode: createGroupResult.fileContent,
            programmingLanguage: createGroupResult.language,
            userId: this.userId,
            groupId: this.groupId,
          };
          return this.groupService.publishGroup(payload);
        }),
        tap(() => {
          this.notifier.showSuccess('Your program has been published');
          this.reloadProgramDetails();
        }),
      )
      .subscribe();
  }

  onDeleteProgramClick(): void {}

  onShowMembersClick(): void {}

  onInviteMemberClick(): void {}

  onJoinGroupClick(): void {
    this.groupService
      .joinGroup(this.groupId, this.userId)
      .pipe(
        takeUntil(this.componentDestory$),
        tap(() => {
          this.notifier.showSuccess(`you have joined this group`);
          this.isVisible = true;
        }),
      )
      .subscribe();
  }

  onLeaveGroupClick(): void {
    this.groupService
      .leaveGroup(this.groupId, this.userId)
      .pipe(
        takeUntil(this.componentDestory$),
        tap(() => {
          this.notifier.showSuccess(`you have leaved this group`);
          this.router.navigate(['/groups']);
        }),
      )
      .subscribe();
  }

  onDeleteGroupClick(): void {
    const dialog: Observable<any> = this.modalService.openDialog(
      ConfirmationModalComponent,
      600,
      {
        title: 'want to delete this group ?',
        message: 'Attention this opperation is irreversable want to proccede',
      },
    );
    dialog
      .pipe(
        takeUntil(this.componentDestory$),
        filter((result) => result === true),
        switchMap(() => this.groupService.deleteGroup(this.groupId)),
        tap(() => {
          this.notifier.showSuccess('group deleted');
          this.router.navigate(['/groups']);
        }),
      )
      .subscribe();
  }

  likeProgram(event: any) {
    this.userData$
      .pipe(
        takeUntil(this.componentDestory$),
        switchMap((user) =>
          this.homeService.likeOrDislikeProgram(
            ReactionsEnum.LIKE,
            event.programId,
            user.userId,
          ),
        ),
        tap(() => {
          this.reloadProgramDetails();
        }),
      )
      .subscribe();
  }

  dislikeProgram(event: any) {
    this.userData$
      .pipe(
        takeUntil(this.componentDestory$),
        switchMap((user) =>
          this.homeService.likeOrDislikeProgram(
            ReactionsEnum.DISLIKE,
            event.programId,
            user.userId,
          ),
        ),
        tap(() => {
          this.reloadProgramDetails();
        }),
      )
      .subscribe();
  }

  private isAccessible(user: UserDataModel, group: GroupModel): boolean {
    if (group.visibility === VisibilityEnum.PUBLIC || this.isGroupOwner) {
      return true;
    } else {
      const isGroupMember = group.members?.find(
        (member: UserDataModel) => member.userId === user.userId,
      );
      if (isGroupMember) return true;
      else return false;
    }
  }

  private isOwner(group: GroupModel, user: UserDataModel): boolean {
    return user.userId === group.owner.userId;
  }

  protected readonly group = group;
}
