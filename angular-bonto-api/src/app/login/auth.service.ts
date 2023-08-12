import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { json } from 'body-parser';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  readonly bontoAPIUrl = "https://localhost:7094/api";

  constructor(private http: HttpClient, private router: Router) { }

  authenticate(credentials: any) {
    this.http.post<any>(this.bontoAPIUrl + '/auth/login', credentials).subscribe({
      next: (response) => {
        if (response.status === 200) {
          const data = response.data;
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
          }
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          this.router.navigate(['/admin/alkatreszek']); 
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
          localStorage.setItem('accessToken', error.accessToken);
          localStorage.setItem('refreshToken', error.refreshToken);
          this.router.navigate(['/admin/alkatreszek']);
        } else {
          alert('Egyéb hiba történt!')
          console.error('Hiba történt:', error);
        }
      }
    });
  }

  logout(credentials: any) {
    this.http.post<any>(this.bontoAPIUrl + '/auth/logout', credentials).subscribe({
      next: () => {
        localStorage.clear();
        this.router.navigate(['/admin/bejelentkezes']);
      }, 
      error: (error) => {
        if (error.status === 400) {
          alert("Hiba történt a kijelentkezés során!");
          throwError(() => new Error(error));
        }
      }
    });
  }

  refreshAccessToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken'); // Example, use your own logic
    
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token not found.'));
    }
  
    return this.http.post<any>(this.bontoAPIUrl + '/auth/refresh-token', { refreshToken });
  }

  getAccessTokenExpiration(): number {
    const tokenParts = localStorage.getItem('accessToken');
    if (tokenParts) {
      const payload = JSON.parse(atob(tokenParts[1]));
      const expirationTimestamp = payload.exp * 1000; // Convert to milliseconds
      return expirationTimestamp;
    } else {
      return 0;
    }
  }

  checkLogin(): Observable<boolean> {
    const isAuthenticated = localStorage.getItem('accessToken');
    
    if (isAuthenticated != null && isAuthenticated != undefined) {
      return of(true);
    } else {
      return throwError(() => new Error('Az oldal eléréséhez, előbb azonosítás szükséges!'));
    }
  }
}
