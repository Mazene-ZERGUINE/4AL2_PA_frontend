import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/Auth/service/auth.service';
import { NotifierService } from 'src/app/core/services/notifier.service';
import { ProfileService } from '../profile/profile.service';
import { Observable } from 'rxjs';
import { UserDataModel } from 'src/app/core/models/user-data.model';
import { UserFollowersModel } from 'src/app/core/models/user-followers.model';

@Component({
  selector: 'app-side-profile',
  templateUrl: './side-profile.component.html',
  styleUrls: ['./side-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideProfileComponent implements OnInit {
  @Input() currentUser!: UserDataModel;

  userFollowersAndFollowings$!: Observable<UserFollowersModel>;

  readonly anonymousImageUrl =
    'https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg';

  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly notifier: NotifierService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (this.currentUser) {
      this.userFollowersAndFollowings$ = this.profileService.getFollowersAndFollowings(
        this.currentUser.userId,
      );
    }
  }
}
