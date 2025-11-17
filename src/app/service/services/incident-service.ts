import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Incident } from '../../models/incident.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  private base = 'http://localhost:8083/api/incidents';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.base);
  }

  saveAll(incidents: Incident[]) {
    return this.http.post(`${this.base}/save-all`, incidents);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
