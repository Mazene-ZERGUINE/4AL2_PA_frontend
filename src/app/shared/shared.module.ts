import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideNavbarComponent } from './components/side-navbar/side-navbar.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [SideNavbarComponent],
  exports: [SideNavbarComponent],
  imports: [CommonModule, MatIconModule],
})
export class SharedModule {}
