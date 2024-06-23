import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserDataModel } from '../../models/user-data.model';
import { GroupsService } from '../../../esgithub/groups/groups.service';
import { Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotifierService } from '../../services/notifier.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-group-members-modal',
  templateUrl: './group-members-modal.component.html',
  styleUrls: ['./group-members-modal.component.scss'],
})
export class GroupMembersModalComponent implements OnDestroy {
  readonly anonymousImageUrl =
    'https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg';

  componentDestroyer$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<GroupMembersModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { groupId: string; members: UserDataModel[] },
    private readonly router: Router,
    private readonly groupService: GroupsService,
    private readonly notifier: NotifierService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this.componentDestroyer$.next();
    this.componentDestroyer$.complete();
  }

  onViewMemberClick(userId: string): void {
    this.router.navigate(['/profile', userId]);
    this.dialogRef.close(true);
  }

  onRemoveMemberClick(userId: string): void {
    this.groupService
      .leaveGroup(this.data.groupId, userId)
      .pipe(
        takeUntil(this.componentDestroyer$),
        tap(() => {
          this.notifier.showSuccess('User removed from the group');
          this.data.members = this.data.members.filter(
            (member: UserDataModel) => member.userId !== userId,
          );
          this.cdr.markForCheck();
        }),
      )
      .subscribe();
  }
}
