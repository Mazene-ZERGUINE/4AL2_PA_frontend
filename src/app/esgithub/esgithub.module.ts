import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EsgithubRoutingModule } from './esgithub-routing.module';
import { CodingPageComponent } from './coding-page/coding-page.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { HomePageComponent } from './home-page/home-page.component';
import { ProgramItemListComponent } from './home-page/program-item-list/program-item-list.component';
import { ProfileComponent } from './profile/profile.component';
import { MaterialModule } from '../shared/material.module';
import { UserProgramsComponent } from './profile/user-programs/user-programs.component';
import { EditProfileComponent } from './profile/edit-profile/edit-profile.component';
import { FollowersListComponent } from './profile/followers-list/followers-list.component';
import { FollowingListComponent } from './profile/following-list/following-list.component';
import { SideProfileComponent } from './side-profile/side-profile.component';
import { FollowerFollowingComponent } from './side-profile/follower-following/follower-following.component';

@NgModule({
  declarations: [
    CodingPageComponent,
    HomePageComponent,
    ProgramItemListComponent,
    ProfileComponent,
    UserProgramsComponent,
    EditProfileComponent,
    FollowersListComponent,
    FollowingListComponent,
    SideProfileComponent,
    FollowerFollowingComponent,
  ],
  imports: [
    CommonModule,
    EsgithubRoutingModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatProgressBarModule,
    SharedModule,
    CoreModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
})
export class EsgithubModule {}
