import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-rooting.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { JoinComponent } from './join/join.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AuthComponent, LoginComponent, JoinComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class AuthModule {}
