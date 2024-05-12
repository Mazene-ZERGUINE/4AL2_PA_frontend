import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { SharedModule } from '../shared/shared.module';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from './components/custom-snackbar/custom-snackbar.component';
import { MatIconModule } from '@angular/material/icon';
import { SideNavbarComponent } from './components/side-navbar/side-navbar.component';

@NgModule({
  declarations: [CustomSnackbarComponent, SideNavbarComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    HttpClientModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
    },
  ],
  exports: [SideNavbarComponent],
})
export class CoreModule {}
