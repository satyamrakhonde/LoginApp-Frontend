import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private base = `${environment.apiBase}/users`;

  constructor(private http: HttpClient) {}

  getByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${encodeURIComponent(username)}`).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }
}
