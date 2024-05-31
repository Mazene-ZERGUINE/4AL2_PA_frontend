import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-follower-following',
  templateUrl: './follower-following.component.html',
  styleUrls: ['./follower-following.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowerFollowingComponent {
  @Input() followerOrFollowingUsername!: string;
  @Input() userId!: string;
  @Input() followerOrFollowingPicture!: string | undefined;

  readonly anonymousImageUrl =
    'https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg';
}
