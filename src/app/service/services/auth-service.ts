import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { User } from '../../models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private base = `${environment.apiBase}`;
  private TOKEN_KEY = 'app_access_token';
  private USER_KEY = 'app_user';

  constructor(private http: HttpClient) {}

  // login(username: string, password: string): Observable<User> {
  //   const url = `${this.base}/auth/login`;
  //   return this.http.post<User>(url, { username, password }).pipe(
  //     catchError((err: HttpErrorResponse) => {
  //       return throwError(() => err);
  //     })
  //   );
  // }
  login(username: string, password: string): Observable<LoginResponse> {
    const url = `${this.base}/auth/login`;
    return this.http.post<LoginResponse>(url, { username, password }).pipe(
      tap(res => {
        if (res?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, res.accessToken);
          if (res.user) localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        }
      }),
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  register(user: User): Observable<any> {
    const url = `${this.base}/users`;
    return this.http.post(url, user, { observe: 'response' }).pipe(
      map(resp => resp),
      catchError((err: HttpErrorResponse) => {
        return throwError(() => err);
      })
    );
  }

  logout(redirect = true) {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    if (redirect) {
      location.href = '/login'; // hard redirect to ensure route guard state reset
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): any | null {
    const u = localStorage.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
