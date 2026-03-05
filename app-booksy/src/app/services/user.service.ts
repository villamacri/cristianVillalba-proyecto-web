import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

export interface CreateUserPayload {
  name: string;
  last_name: string;
  email: string;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  createUser(userData: CreateUserPayload): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  updateRole(id: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/role`, { role });
  }

  updateUserRole(id: number, role: string): Observable<User> {
    return this.updateRole(id, role);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}
