import { Component, OnDestroy } from '@angular/core';
import { GroupsService } from './groups.service';
import { AuthService } from '../../core/Auth/service/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { NotifierService } from '../../core/services/notifier.service';
import { CreateGroupModalComponent } from '../../core/modals/create-group-modal/create-group-modal.component';
import { combineLatest, Observable, Subject, switchMap, tap } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { GroupModel } from '../../core/models/group.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnDestroy {
  componentDestroyer$ = new Subject<void>();

  groupsList$ = this.groupsService.getGroupsList$();
  recentGroupsList$: Observable<GroupModel[]> = this.groupsService.getRecentGroups();
  userData$ = this.authService.getUserData();

  constructor(
    private readonly groupsService: GroupsService,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly notifier: NotifierService,
    private readonly router: Router,
  ) {}

  ngOnDestroy(): void {
    this.componentDestroyer$.next();
    this.componentDestroyer$.complete();
  }

  onGroupClick(groupId: string): void {
    this.router.navigate(['group/' + groupId]);
  }

  onAddGroupClick(): void {
    const dialogRef = this.modalService.openDialog(CreateGroupModalComponent, 900);
    combineLatest([this.userData$, dialogRef])
      .pipe(
        takeUntil(this.componentDestroyer$),
        map(([user, dialogResult]): FormData => {
          const payload = new FormData();
          if (dialogResult.image) payload.append('image', dialogResult.image);
          payload.append('name', dialogResult.groupName);
          payload.append('description', dialogResult.description);
          payload.append('ownerId', user.userId);
          payload.append('visibility', dialogResult.visibility);
          return payload;
        }),
        switchMap((payload) => this.groupsService.createGroup(payload)),
        tap((result): void => {
          this.notifier.showSuccess(
            `${result.name} has been created successfully. You will be redirected soon.`,
          );
          // eslint-disable-next-line angular/timeout-service
          const timeoutId = setTimeout(() => {
            this.router.navigate(['group/' + result.groupId]);
            clearTimeout(timeoutId); // Clear the timeout once executed
          }, 4000);
        }),
      )
      .subscribe();
  }
}
