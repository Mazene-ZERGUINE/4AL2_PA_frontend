import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { UserFollowersModel } from '../../../core/models/user-followers.model';

@Component({
  selector: 'app-following-list',
  templateUrl: './following-list.component.html',
  styleUrls: ['./following-list.component.scss'],
})
export class FollowingListComponent {
  @Input() followingsList!: Observable<UserFollowersModel>;
  @Input() isOwner!: boolean;
  @Output() removeFollowingEvent: EventEmitter<string> = new EventEmitter();

  onRemoveClick(relationId: string): void {
    this.removeFollowingEvent.emit(relationId);
  }
}
