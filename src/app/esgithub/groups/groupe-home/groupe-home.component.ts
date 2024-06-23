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
  BehaviorSubject,
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
import { ProgramModel } from '../../../core/models/program.model';
import { shareReplay } from 'rxjs/operators';
import { GroupMembersModalComponent } from '../../../core/modals/group-members-modal/group-members-modal.component';

@Component({
  selector: 'app-groupe-home',
  templateUrl: './groupe-home.component.html',
  styleUrls: ['./groupe-home.component.scss'],
})
export class GroupeHomeComponent implements OnInit, OnDestroy {
  readonly componentDestroy$ = new Subject<void>();

  userData$ = this.authService.getUserData();
  groupDetails$!: Observable<GroupModel>;
  refreshPrograms$ = new BehaviorSubject<void>(undefined);
  groupPrograms$!: Observable<ProgramModel[] | undefined>;

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
        takeUntil(this.componentDestroy$),
        map((params: any) => params['groupId']),
        filter((groupId: any) => groupId !== undefined),
        tap((groupId) => {
          this.groupId = groupId;
          this.groupDetails$ = this.groupService.getGroupDetails(groupId);
        }),
        switchMap(() => combineLatest([this.groupDetails$, this.userData$])),
        tap(([group, user]) => {
          this.isGroupOwner = this.isOwner(group, user);
          this.isVisible = this.isAccessible(user, group);
          this.userId = user.userId;
          this.groupPrograms$ = combineLatest([
            this.groupDetails$,
            this.refreshPrograms$,
          ]).pipe(
            switchMap(() => {
              return this.groupService
                .getGroupDetails(this.groupId)
                .pipe(map((group) => group.programs));
            }),
            shareReplay({ refCount: true, bufferSize: 1 }),
          );
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.componentDestroy$.next();
    this.componentDestroy$.complete();
  }

  onPublishProgramClick(): void {
    this.modalService
      .openDialog(GroupPublishModalComponent, 700)
      .pipe(
        filter((result) => result !== undefined),
        takeUntil(this.componentDestroy$),
        switchMap((createGroupResult) =>
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
          this.refreshPrograms$.next();
        }),
      )
      .subscribe();
  }

  onJoinGroupClick(): void {
    this.groupService
      .joinGroup(this.groupId, this.userId)
      .pipe(
        takeUntil(this.componentDestroy$),
        tap(() => {
          this.notifier.showSuccess(`You have joined this group`);
          this.isVisible = true;
          this.refreshPrograms$.next();
        }),
      )
      .subscribe();
  }

  onLeaveGroupClick(): void {
    this.groupService
      .leaveGroup(this.groupId, this.userId)
      .pipe(
        takeUntil(this.componentDestroy$),
        tap(() => {
          this.notifier.showSuccess(`You have left this group`);
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
        title: 'Want to delete this group?',
        message: 'Attention this operation is irreversible. Do you want to proceed?',
      },
    );
    dialog
      .pipe(
        takeUntil(this.componentDestroy$),
        filter((result) => result === true),
        switchMap(() => this.groupService.deleteGroup(this.groupId)),
        tap(() => {
          this.notifier.showSuccess('Group deleted');
          this.router.navigate(['/groups']);
        }),
      )
      .subscribe();
  }

  onChangeVisibilityClick(): void {
    const dialogRef = this.modalService.openDialog(ConfirmationModalComponent, 700, {
      title: 'Change visibility',
      message: 'Want to change this group visibility?',
    });
    dialogRef
      .pipe(
        takeUntil(this.componentDestroy$),
        filter((result: any) => result === true),
        switchMap(() => this.groupService.updateVisibility(this.groupId)),
        tap((response: { visibility: string }) => {
          this.notifier.showSuccess(`this group is now a ${response.visibility} group`);
        }),
      )
      .subscribe();
  }

  onViewMembersClick(): void {
    this.modalService.openDialog(GroupMembersModalComponent, 700, {
      members: this.groupDetails$.pipe(map((group) => group.members)),
      groupId: this.groupId,
    });
  }

  likeProgram(event: { programId: string }): void {
    this.userData$
      .pipe(
        takeUntil(this.componentDestroy$),
        switchMap((user) =>
          this.homeService.likeOrDislikeProgram(
            ReactionsEnum.LIKE,
            event.programId,
            user.userId,
          ),
        ),
        tap(() => this.refreshPrograms$.next()),
      )
      .subscribe();
  }

  dislikeProgram(event: { programId: string }): void {
    this.userData$
      .pipe(
        takeUntil(this.componentDestroy$),
        switchMap((user) =>
          this.homeService.likeOrDislikeProgram(
            ReactionsEnum.DISLIKE,
            event.programId,
            user.userId,
          ),
        ),
        tap(() => this.refreshPrograms$.next()),
      )
      .subscribe();
  }

  deleteProgram(event: string): void {
    const dialogRef = this.modalService.openDialog(ConfirmationModalComponent, 700, {
      title: 'Want to delete this program?',
      message: 'This operation is irreversible. Are you sure you want to proceed?',
    });
    dialogRef
      .pipe(
        takeUntil(this.componentDestroy$),
        filter((result: any) => result === true),
        switchMap(() => this.homeService.deleteProgram(event)),
        tap(() => {
          this.refreshPrograms$.next();
          this.notifier.showSuccess('The program has been deleted');
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
      return !!isGroupMember;
    }
  }

  private isOwner(group: GroupModel, user: UserDataModel): boolean {
    return user.userId === group.owner.userId;
  }

  protected readonly group = group;
}
