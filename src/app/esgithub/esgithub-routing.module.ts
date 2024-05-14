import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodingPageComponent } from './coding-page/coding-page.component';
import { HomePageComponent } from './home-page/home-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  { path: 'coding', component: CodingPageComponent, canActivate: [] },
  { path: 'home', component: HomePageComponent, canActivate: [] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EsgithubRoutingModule {}
