import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SearchService } from '../search/search.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  readonly bontoAPIUrl = "https://localhost:7094/api";
  private setGuard = false;
  private logoutActivated: boolean = false;
  accTokExpirationTimestamp = 0;
  refTokExpirationTimestamp = 0;
  currentTime = 0;
  accessToken = '';
  validAccessToken = false;
  accessTokenToRefresh = false;
  credentials = {
    username: '',
    refreshToken: ''
  };

  constructor(private http: HttpClient, private router: Router, private cookie: CookieService, 
    private searchService: SearchService) { }

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
    this.logoutActivated = false;
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

  logout(manual = false) {
    if (!this.logoutActivated) {
      this.logoutActivated = true;
      this.http.post<any>(this.bontoAPIUrl + '/auth/logout', this.credentials).subscribe({
        next: (response) => {
          if (response.status === 200) {
            if (!manual) {
              alert("A munkamenet lejárt, jelentkezz be újra!");
            }
            const backdropElements = document.querySelectorAll('.modal-backdrop');
            backdropElements.forEach(backdrop => {
              backdrop.remove();
            });
            const modalElements = document.querySelectorAll('.modal');
            modalElements.forEach(modal => {
              if (modal.classList.contains('show')) {
                modal.remove();
              }
            });
            this.cookie.deleteAll();
            this.searchService.setSearchTerm('', true);
            this.setGuard = false;
            this.router.navigate(['/admin/bejelentkezes']);
          }
        },
        error: (error) => {
          if (error.status === 400) {
            alert("Hiba történt a kijelentkezés során!");
            throwError(() => new Error(error));
            return; 
          }
        }
      });
    } else {
      return;
    }
  }

  checkRefreshTokenExpiration(): boolean {
    const currentTime = new Date().getTime();
    if (this.credentials.refreshToken && this.refTokExpirationTimestamp <= currentTime) {
      return true;
    }
    return false;
  }
  
  checkAccessTokenExpiration() {
    const currentTime = new Date().getTime();
    if (this.accessToken !== '' && this.accTokExpirationTimestamp <= currentTime) {
      // Token is expired or missing, try to refresh
      const isTokenExpired = this.checkRefreshTokenExpiration();
      if (isTokenExpired) {
        // Refresh token is expired or missing, signal to interceptor that logout must happen
        this.accessToken = '';
        this.validAccessToken = false;
        this.accessTokenToRefresh = false;
      } else {
        this.accessTokenToRefresh = true;
      }
    } else if (this.accessToken === '') {
      // Just in case there is an issue with the relevant API call, and user still doesn't get signed out
      this.validAccessToken = false;
      this.accessTokenToRefresh = false;
    } else {
      this.validAccessToken = true;
    }
  }

  refreshAccessToken() {
    const refreshToken = this.cookie.get('refreshToken');
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post<any>(this.bontoAPIUrl + '/auth/refresh-token', JSON.stringify(refreshToken), {headers: headers}).subscribe({
      next: (response) => {
        if (response.status === 200) {
          const data = response.data;
          if (data.accessToken) {
            this.accessToken = data.accessToken;
            this.cookie.set('accessToken', data.accessToken);
            this.accTokExpirationTimestamp = this.getTokenExpiration();
            this.validAccessToken = true;
            this.accessTokenToRefresh = false;
          } else {
            alert('Hiba történt a belépési token eltárolásában!');
            this.accessToken = '';
            this.accessTokenToRefresh = false;
            this.validAccessToken = false;
          }
        }
      },
      error: (error) => {
        alert('Hiba történt a belépési token frissítése során!');
        console.error('Error refreshing access token:', error);
        this.accessToken = '';
        this.accessTokenToRefresh = false;
        this.validAccessToken = false;
      }
    });
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
    
  checkLogin(): Observable<boolean> {
    if (this.setGuard) {
      return of(true);
    } else {
      console.log('Az oldal eléréséhez, előbb azonosítás szükséges!');
      return throwError(() => new Error('Not authorized'));
    }
  }
}
