import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavService {
  private navBarState$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  get navBarState() {
    return this.navBarState$.value;
  }

  set navBarState(state: boolean) {
    this.navBarState$.next(state);
  }

  constructor() {}
}
