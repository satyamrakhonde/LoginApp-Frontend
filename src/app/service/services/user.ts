import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

interface ServiceError {
  status: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // private base = `${environment.apiBase}`;
  private base = 'http://localhost:8083/api/users';

  constructor(private http: HttpClient) {}

  getByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${encodeURIComponent(username)}`).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  login(payload: { username: string; password: string; }): Observable<User> {
    const url = `${this.base}/auth/login`;

    return this.http.post<User>(url, payload).pipe(
      catchError((err: HttpErrorResponse) => {
        const svcErr: ServiceError = {
          status: err.status ?? 0,
          message: 'Error logging in'
        };

        if (err.status === 404) {
          svcErr.message = 'User does not exists';
        } else if (err.status === 401) {
          svcErr.message = 'Invalid credentials';
        } else if (err.error && typeof err.error === 'string') {
          svcErr.message = err.error;
        } else if (err.error && err.error.message) {
          // some backends return { message: '...' }
          svcErr.message = err.error.message;
        }

        return throwError(() => svcErr);
      })
    );
  }
}
