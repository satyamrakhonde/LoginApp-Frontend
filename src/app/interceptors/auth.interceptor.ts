import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../service/services/auth-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/logout');

    const cloneReq = token && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(cloneReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // token invalid/expired -> clear and redirect to login
          this.auth.logout(true);
        }
        return throwError(() => err);
      })
    );
  }
}
