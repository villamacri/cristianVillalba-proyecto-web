import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RecentUser {
  id: number;
  name: string;
  role: string;
  registration_date: string;
}

export interface BookByCategory {
  name: string;
  books_count: number;
}

export interface DashboardSummary {
  total_users: number;
  total_books: number;
  active_meetups: number;
  successful_exchanges: number;
  recent_users?: RecentUser[];
  books_by_category?: BookByCategory[];
}

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/admin/dashboard-stats`);
  }
}
