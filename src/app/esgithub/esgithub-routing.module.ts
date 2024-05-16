import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodingPageComponent } from './coding-page/coding-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  { path: 'coding', component: CodingPageComponent, canActivate: [] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EsgithubRoutingModule {}
