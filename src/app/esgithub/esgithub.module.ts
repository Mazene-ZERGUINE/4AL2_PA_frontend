import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EsgithubRoutingModule } from './esgithub-routing.module';
import { CodingPageComponent } from './coding-page/coding-page.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { HomePageComponent } from './home-page/home-page.component';

@NgModule({
  declarations: [CodingPageComponent, HomePageComponent],
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
  ],
})
export class EsgithubModule {}
