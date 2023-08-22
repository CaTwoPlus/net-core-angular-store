import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthenticationService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.includes('/auth/login') || request.url.includes('/Alkatresz') 
        || request.url.includes('/Kategoria') || request.url.includes('/AutoTipus')) {
      return next.handle(request);
    }
    return this.authService.checkTokenExpiration().pipe(
      catchError(() => of(null)),
      switchMap(() => {
        const modifiedRequest = this.modifyRequestWithNewAccessToken(request);
        return next.handle(modifiedRequest);
      })
    );
  }

  private modifyRequestWithNewAccessToken(request: HttpRequest<any>): HttpRequest<any> {
    if (this.authService.accessToken) {
      const modifiedRequest = request.clone({
        setHeaders: { Authorization: `Bearer ${this.authService.accessToken}` }
      });
      return modifiedRequest;
    }
    return request;
  }
}
