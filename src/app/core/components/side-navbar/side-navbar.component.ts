import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NavService } from './nav.service';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../../Auth/service/auth.service';

@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [animate('1s 1s ease-out', style({ opacity: 1 }))]),
    ]),
  ],
})
export class SideNavbarComponent implements OnDestroy {
  readonly componentDestroyed$ = new Subject<void>();

  menus = [
    { name: 'Home', link: '/home', icon: 'home' },
    { name: 'groups', link: '/groups', icon: 'view_list' },
    { name: 'code', link: '/coding', icon: 'code' },
    { name: 'pipelines', link: '/pipelines', icon: 'webhook' },
    { name: 'profile', link: '/profile', icon: 'account_circle' },
  ];

  open: boolean = this.navService.navBarState;
  selectedMenu = '';

  constructor(
    private readonly router: Router,
    private readonly navService: NavService,
    private authService: AuthService,
  ) {}

  toggleOpen(): void {
    this.open = !this.open;
    this.navService.navBarState = this.open;
  }

  navigateToUrl(url: string): void {
    this.router.navigate([url]);
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  onLogoutClick(): void {
    this.authService
      .getUserData()
      .pipe(
        switchMap((currentUser) => this.authService.logout(currentUser.userId)),
        takeUntil(this.componentDestroyed$),
      )
      .subscribe();
  }
}
