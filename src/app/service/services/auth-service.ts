import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { User } from '../../models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
   private base = `${environment.apiBase}`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<User> {
    const url = `${this.base}/auth/login`;
    return this.http.post<User>(url, { username, password }).pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(() => err);
      })
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
}
