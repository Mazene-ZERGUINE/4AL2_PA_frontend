import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { SharedModule } from '../shared/shared.module';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { CustomSnackbarComponent } from './components/custom-snackbar/custom-snackbar.component';
import { SideNavbarComponent } from './components/side-navbar/side-navbar.component';
import { AuthModule } from './Auth/auth.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MaterialModule } from '../shared/material.module';
import { CodePageUseGuidModalComponent } from './modals/code-page-use-guid-modal/code-page-use-guid-modal.component';
import { LineCommentsModalComponent } from './modals/line-comments-modal/line-comments-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CustomSnackbarComponent,
    SideNavbarComponent,
    CodePageUseGuidModalComponent,
    LineCommentsModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    HttpClientModule,
    AuthModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  exports: [SideNavbarComponent],
})
export class CoreModule {}
