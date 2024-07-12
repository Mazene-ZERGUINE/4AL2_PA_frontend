import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, map, distinctUntilChanged } from 'rxjs';
import {
  availableLangagesQueryParamKey,
  inputFileTypeQueryParamKey,
  outputFileTypeQueryParamKey,
} from 'src/app/esgithub/home-page/home-page.component';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  getQueryParamValueFromActivatedRoute$<T extends string = string>(
    activatedRoute: ActivatedRoute,
    queryParam: string,
  ): Observable<T | null> {
    return activatedRoute.queryParams.pipe(
      map((queryParams: Params) => queryParams[queryParam] ?? null),
      distinctUntilChanged(),
    );
  }

  addQueriesToCurrentUrl(queryParams: Record<string, unknown>): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge',
      preserveFragment: true,
      replaceUrl: false,
    });
  }

  removeQueryParam(paramKey: string): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { [paramKey]: null },
      queryParamsHandling: 'merge',
      preserveFragment: true,
      replaceUrl: false,
    });
  }

  removeAllQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        [availableLangagesQueryParamKey]: null,
        [inputFileTypeQueryParamKey]: null,
        [outputFileTypeQueryParamKey]: null,
      },
      queryParamsHandling: 'merge',
      preserveFragment: true,
      replaceUrl: false,
    });
  }

  createQueryParamStream<T>(
    queryParamKey: string,
    enumType: any,
  ): Observable<T[] | null> {
    return this.getQueryParamValueFromActivatedRoute$(
      this.activatedRoute,
      queryParamKey,
    ).pipe(
      map((param) => (param ? param.split(',') : null)),
      map((values) =>
        values && values.every((value) => Object.values(enumType).includes(value as T))
          ? values.map((value) => value as T)
          : null,
      ),
      distinctUntilChanged(),
    );
  }
}
