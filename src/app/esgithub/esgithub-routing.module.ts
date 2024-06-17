import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodingPageComponent } from './coding-page/coding-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { ProgramEditComponent } from './program-edit/program-edit.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  { path: 'coding', component: CodingPageComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomePageComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'profile/:userId', component: ProfileComponent, canActivate: [AuthGuard] },
  {
    path: 'program/:programId',
    component: ProgramEditComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EsgithubRoutingModule {}
