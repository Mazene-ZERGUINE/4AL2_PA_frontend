import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EsgithubRoutingModule } from './esgithub-routing.module';
import { CodingPageComponent } from './coding-page/coding-page.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [CodingPageComponent],
  imports: [
    CommonModule,
    EsgithubRoutingModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
  ],
})
export class EsgithubModule {}
