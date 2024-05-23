import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ProfileService } from './profile.service';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { UserDataModel } from '../../core/models/user-data.model';
import { ProgramModel } from '../../core/models/program.model';
import { NotifierService } from '../../core/services/notifier.service';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { Follower, UserFollowersModel } from '../../core/models/user-followers.model';
import { AuthService } from 'src/app/core/Auth/service/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  followUserSubscription = new Subscription();
  unfollowUserSubscription = new Subscription();

  @ViewChild('fileInput') fileInput!: ElementRef;
  userData$!: Observable<UserDataModel>;
  selectedMenuItem: string = 'programs';
  programsList$!: Observable<ProgramModel[]>;
  isProfileOwner!: boolean;
  userFollowersAndFollowings!: Observable<UserFollowersModel>;
  isFollowing: boolean = false;
  followerId!: string;
  followingId!: string;
  relationId!: string;

  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly notifier: NotifierService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(map((params) => params['userId'])).subscribe((userId) => {
      if (!userId) {
        this.isProfileOwner = true;
        this.loadCurrentUserProfileData();
      } else {
        this.followingId = userId;
        this.loadUserProfileData(userId);
      }
    });
  }

  loadUserProfileData(userId: string): void {
    forkJoin({
      userData: this.profileService.getUserInfo(userId),
      followersAndFollowings: this.profileService.getFollowersAndFollowings(userId),
      userPrograms: this.profileService.getUserPrograms(userId),
      currentUser: this.authService.getUserData(),
    })
      .pipe(
        map(({ userData, followersAndFollowings, userPrograms, currentUser }) => {
          this.followerId = currentUser.userId;
          this.isProfileOwner = false;
          this.userData$ = of(userData);
          this.userFollowersAndFollowings = of(followersAndFollowings);
          const relation: Follower = followersAndFollowings.followers.find(
            (follower: Follower) => follower.follower.userId === currentUser.userId,
          );
          if (relation) {
            this.isFollowing = true;
            this.relationId = relation.relationId;
          }
          return userPrograms.filter((program) => {
            return (
              program.visibility === 'public' ||
              (this.isFollowing && program.visibility === 'only_followers')
            );
          });
        }),
      )
      .subscribe((programsList: ProgramModel[]) => {
        this.programsList$ = of(programsList);
      });
  }

  loadCurrentUserProfileData(): void {
    this.loadUserData();
    this.programsList$.subscribe((programsList: ProgramModel[]) => {
      this.programsList$ = of(programsList);
    });
  }

  ngOnDestroy(): void {
    this.followUserSubscription.unsubscribe();
    this.unfollowUserSubscription.unsubscribe();
  }

  loadUserData(): void {
    this.userData$ = this.authService.getUserData();
    this.programsList$ = this.userData$.pipe(
      switchMap((userData) => this.profileService.getUserPrograms(userData.userId)),
    );
    this.userFollowersAndFollowings = this.userData$.pipe(
      switchMap((userData) =>
        this.profileService.getFollowersAndFollowings(userData.userId),
      ),
    );
  }

  onMenuItemClick(item: string): void {
    this.selectedMenuItem = item;
  }

  onProfileUpdated(): void {
    this.loadUserData();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.profileService.uploadAvatar(file).subscribe(() => {
        this.onProfileUpdated();
        this.loadUserData();
        this.notifier.showSuccess('Profile image updated');
      });
    }
  }

  onFollowClick(): void {
    const payload = {
      followerId: this.followerId,
      followingId: this.followingId,
    };
    this.followUserSubscription = this.profileService.follow(payload).subscribe(() => {
      this.isFollowing = true;
      this.loadUserProfileData(this.followingId);
    });
  }

  onUnfollowClick(event?: string): void {
    const relationId = event !== undefined ? event : this.relationId;
    if (event === undefined) {
      this.unfollowUserSubscription = this.profileService
        .unfollow(relationId as string)
        .subscribe(() => {
          this.isFollowing = false;
          this.loadUserProfileData(this.followingId);
        });
    }
    if (event !== undefined) {
      this.unfollowUserSubscription = this.profileService
        .unfollow(relationId as string)
        .subscribe(() => {
          this.isFollowing = false;
          this.loadUserData();
        });
    }
  }
}
