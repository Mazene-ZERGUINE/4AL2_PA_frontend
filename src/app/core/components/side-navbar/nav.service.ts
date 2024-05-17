import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { NotifierService } from '../../services/notifier.service';

@Injectable({
  providedIn: 'root',
})
export class NavService {
  constructor(
    private readonly router: Router,
    private readonly notifier: NotifierService,
  ) {}

  private navBarState$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  get navBarState() {
    return this.navBarState$.value;
  }

  set navBarState(state: boolean) {
    this.navBarState$.next(state);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.notifier.showSuccess('you logged out');
    this.router.navigate(['auth']);
  }
}
