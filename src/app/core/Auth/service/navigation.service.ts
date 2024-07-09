import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  getCurrentUrl(): string {
    return this.router.url;
  }
}
