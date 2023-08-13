import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, catchError, of, switchMap, throwError } from 'rxjs';
import { AuthenticationService } from './auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthenticationService, private router: Router, private cookie: CookieService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.cookie.get('accessToken');
    
    if (accessToken) {
      const expirationTimestamp = this.authService.getAccessTokenExpiration();
      const currentTime = new Date().getTime();
      
      if (expirationTimestamp && expirationTimestamp <= currentTime) {
        // Access token has expired, attempt to refresh it
        return this.authService.refreshAccessToken().pipe(
          switchMap((tokens) => {
            // Retry the original request with the new access token
            const newAccessToken = tokens.accessToken;
            const modifiedRequest = request.clone({
              setHeaders: { Authorization: `Bearer ${newAccessToken}` }
            });
            return next.handle(modifiedRequest);
          }),
          catchError((error) => {
            // Handle refresh token failure or other errors
            alert ('Nem sikerült megújítani a munkamenetet, jelentkezz be újra!');
            this.router.navigate(['/admin/bejelentkezes']);
            return throwError(() => new Error(error));
          })
        );
      } else {
        // Access token is still valid, proceed with the original request
        return next.handle(request);
      }
    } else {
      this.router.navigate(['/admin/bejelentkezes']); // Redirect to login page
      return throwError(() => new Error('No access token available'));
    }
  }
}