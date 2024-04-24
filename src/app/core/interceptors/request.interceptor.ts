import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

import { HttpError } from '../../shared/enums/http-error.enum';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err) => {
        return this.handleError(request, err);
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  handleError(req: HttpRequest<any>, err: any): Observable<never> {
    const defaultErrorMessage = 'Une erreur est survenue. Réessayez plus tard.';

    if (this.is5xxServerError(err)) {
      return this.handleSpecificHttpError(err, err.error?.message || defaultErrorMessage);
    }

    if (this.is400BadRequest(err)) {
      return this.handleSpecificHttpError(err, err.error?.message || defaultErrorMessage);
    }

    if (this.is401Unthorized(err)) {
      return this.handleSpecificHttpError(
        err,
        err.error?.message || 'Vos identifiants sont incorrects.',
      );
    }

    if (this.is403Forbidden(err)) {
      return this.handleSpecificHttpError(
        err,
        err.error?.message || "Vous n'avez pas les droits.",
      );
    }

    if (this.is404NotFound(err)) {
      return this.handleSpecificHttpError(
        err,
        err.error?.message || "La ressource demandée n'existe pas.",
      );
    }

    if (this.is409Conflict(err)) {
      return this.handleSpecificHttpError(
        err,
        err.error?.message || 'La ressource existe déjà.',
      );
    }

    if (this.is413RequestEntityTooLarge(err)) {
      return this.handleSpecificHttpError(
        err,
        err.error?.message || 'Le contenu est trop grand.',
      );
    }

    if (this.is415UnsupportedMediaType(err)) {
      return this.handleSpecificHttpError(
        err,
        err.error?.message || "Le format de fichier n'est pas supporté.",
      );
    }

    return this.handleSpecificHttpError(err, err.error?.message || defaultErrorMessage);
  }

  private handleSpecificHttpError(err: any, message: string): Observable<never> {
    // TODO: toast error message
    // eslint-disable-next-line no-console
    console.warn(message);
    return throwError(() => err);
  }

  private is5xxServerError(err: any): boolean {
    return (
      err.status === HttpError['500InternalServerError'] ||
      err.status === HttpError['501NotImplemented']
    );
  }

  private is415UnsupportedMediaType(err: any): boolean {
    return err.status === HttpError['415UnsupportedMediaType'];
  }

  private is413RequestEntityTooLarge(err: any): boolean {
    return err.status === HttpError['413RequestEntityTooLarge'];
  }

  private is409Conflict(err: any): boolean {
    return err.status === HttpError['409Conflict'];
  }

  private is404NotFound(err: any): boolean {
    return err.status === HttpError['404NotFound'];
  }

  private is403Forbidden(err: any): boolean {
    return err.status === HttpError['403Forbidden'];
  }

  private is401Unthorized(err: any): boolean {
    return err.status === HttpError['401Unauthorized'];
  }

  private is400BadRequest(err: any): boolean {
    return err.status === HttpError['400BadRequest'];
  }
}
