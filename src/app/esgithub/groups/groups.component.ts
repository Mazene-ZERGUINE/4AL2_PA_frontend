import { Component, OnDestroy, OnInit } from '@angular/core';
import { GroupsService } from './groups.service';
import { AuthService } from '../../core/Auth/service/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { NotifierService } from '../../core/services/notifier.service';
import { CreateGroupModalComponent } from '../../core/modals/create-group-modal/create-group-modal.component';
import { combineLatest, Observable, Subscription, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroupModel } from '../../core/models/group.model';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnInit, OnDestroy {
  createGroupSubscription: Subscription = new Subscription();

  groupsList$ = this.groupsService.getGroupsList$();
  recentGroupsList$: Observable<GroupModel[]> = this.groupsService.getRecentGroups();
  userData$ = this.authService.getUserData();

  animationState = 'running';
  animationStarted = false;
  transformValue = 0;

  constructor(
    private readonly groupsService: GroupsService,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly notifier: NotifierService,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.createGroupSubscription.unsubscribe();
  }

  onAddGroupClick(): void {
    const dialogRef = this.modalService.openDialog(CreateGroupModalComponent, 700);
    this.createGroupSubscription = combineLatest([this.userData$, dialogRef])
      .pipe(
        map(([user, dialogResult]): FormData => {
          const payload = new FormData();
          payload.append('image', dialogResult.image);
          payload.append('name', dialogResult.groupName);
          payload.append('description', dialogResult.description);
          payload.append('ownerId', user.userId);
          payload.append('visibility', dialogResult.visibility);
          return payload;
        }),
        switchMap((payload) => this.groupsService.createGroup(payload)),
        tap((result): void => {
          console.log(result);
          this.notifier.showSuccess(
            `${result.name} has been created successfully. You will be redirected soon.`,
          );
          //todo: interval and redirection to the group home page
        }),
      )
      .subscribe();
  }

  onSeeAllClick(): void {}
}
