import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthenticationService } from "../login/auth.service";
import { inject } from "@angular/core";
import { catchError, map, of } from "rxjs";

export const canActivate: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);
  
    return authService.checkLogin().pipe(
        map(() => {
        return true;
        }),
        catchError(() => {
        router.navigate(['/admin/bejelentkezes']);
        return of(false);
        })
    );
  };