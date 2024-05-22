import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { UserFollowersModel } from '../../../core/models/user-followers.model';

@Component({
  selector: 'app-followers-list',
  templateUrl: './followers-list.component.html',
  styleUrls: ['./followers-list.component.scss'],
})
export class FollowersListComponent {
  @Input() followersList!: Observable<UserFollowersModel>;
  @Output() removeFollowerEvent: EventEmitter<string> = new EventEmitter();
  @Input() isOwner!: boolean;
  onRemoveClick(relationId: string) {
    this.removeFollowerEvent.emit(relationId);
  }
}
