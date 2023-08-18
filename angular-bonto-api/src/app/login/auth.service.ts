import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  readonly bontoAPIUrl = "https://localhost:7094/api";
  private setGuard = false;
  accTokExpirationTimestamp = 0;
  refTokExpirationTimestamp = 0;
  currentTime = 0;
  accessToken = '';
  credentials = {
    username: '',
    refreshToken: ''
  };

  constructor(private http: HttpClient, private router: Router, private cookie: CookieService) { }

  authenticate(credentials: any) {
    this.http.post<any>(this.bontoAPIUrl + '/auth/login', credentials).subscribe({
      next: (response) => {
        if (response.status === 200) {
          const data = response.error.data;
          if (data.accessToken) {
            this.accessToken = data.accessToken;
            this.cookie.set('accessToken', data.accessToken);
          }
          if (data.refreshToken) {
            this.cookie.set('refreshToken', data.refreshToken);
          }
          this.signIn();
        } else {
          alert('Hiba történt a belépési tokenek eltárolásában!');
        }
      },
      error: (error) => {
        if (error.status === 401) {
          alert('Helytelen felhasználónév vagy jelszó!');
        } else if (error.status === 404) {
          alert('A kért állomány nem található!')
        } else if (error.status === 400) {
          const data = error.error.data;
          if (data.accessToken) {
            this.accessToken = data.accessToken;
            this.cookie.set('accessToken', data.accessToken);
          }
          if (data.refreshToken) {
            this.accessToken = data.accessToken;
            this.cookie.set('refreshToken', data.refreshToken);
          }
          this.signIn();
        } else {
          alert('Egyéb hiba történt!')
          console.error('Hiba történt:', error);
        }
      }
    });
  }

  signIn() {
    this.credentials = {
      username: this.cookie.get('username'),
      refreshToken: this.cookie.get('refreshToken')
    }
    this.accTokExpirationTimestamp = this.getTokenExpiration();
    this.refTokExpirationTimestamp = this.getTokenExpiration(true);
    this.currentTime = new Date().getTime();
    this.setGuard = true;
    this.router.navigate(['/admin/alkatreszek']); 
  }

  logout(): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>(this.bontoAPIUrl + '/auth/logout', this.credentials).subscribe({
        next: (response) => {
          if (response.status === 200) {
            var closeModalBtn = document.getElementById('close-logout-modal');
            if (closeModalBtn) {
              closeModalBtn.click();
            }
            this.cookie.deleteAll();
            this.setGuard = false;
            this.router.navigate(['/admin/bejelentkezes']);
            observer.next(response);
            observer.complete();
          }
        },
        error: (error) => {
          if (error.status === 400) {
            alert("Hiba történt a kijelentkezés során!");
            observer.error(error);
          }
        }
      });
    });
  }

  checkTokenExpiration(): Observable<boolean> {
    const currentTime = new Date().getTime();
    if (this.accessToken && this.accTokExpirationTimestamp <= currentTime) {
      if (this.credentials.refreshToken && !(this.refTokExpirationTimestamp <= currentTime)) {
        return this.refreshAccessToken().pipe(map(() => false));
      } else {
        return of(true);
      } 
    }
    return of(false);
  }  

  getTokenExpiration(isRefreshToken = false): number {
    if (isRefreshToken) {
      const refreshToken = this.cookie.get('refreshToken');
      if (refreshToken) {
        const tokenParts = refreshToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expirationTimestamp = payload.exp * 1000;
          return expirationTimestamp;
        }
      }
    } else {
      const accessToken = this.cookie.get('accessToken');
      if (accessToken) {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expirationTimestamp = payload.exp * 1000;
          return expirationTimestamp;
        }
      }
    }
    return 0;
  }

  refreshAccessToken(): Observable<any> {
    const refreshToken = this.cookie.get('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token not found.'));
    }
    return this.http.post<any>(this.bontoAPIUrl + '/auth/refresh-token', refreshToken);
  }

  checkLogin(): Observable<boolean> {
    if (this.setGuard) {
      return of(true);
    } else {
      return throwError(() => new Error('Az oldal eléréséhez, előbb azonosítás szükséges!'));
    }
  }
}
