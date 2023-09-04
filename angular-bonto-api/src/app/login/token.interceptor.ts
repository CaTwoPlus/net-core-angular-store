import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { AuthenticationService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService) {}

  private logoutActivated: boolean = false;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const adminRequest = request.headers.get('admin') ? true : false;
    if (request.url.includes('/auth/login') || request.url.includes('/auth/logout') || request.url.includes('/auth/refresh-token')
        || this.logoutActivated || !adminRequest) {
      return next.handle(request);
    }
    this.authService.checkAccessTokenExpiration();
    if (this.authService.accessTokenToRefresh) {
      this.authService.refreshAccessToken();
      const modifiedRequest = this.modifyRequestWithNewAccessToken(request);
      return next.handle(modifiedRequest);
    } else if (!this.authService.validAccessToken) {
      if (!this.logoutActivated) {
        this.logoutActivated = true;
        alert("A munkamenet lejárt, jelentkezz be újra!");
        this.authService.logout();
      }
      return EMPTY;
    } else {
      return next.handle(request);
    }
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
