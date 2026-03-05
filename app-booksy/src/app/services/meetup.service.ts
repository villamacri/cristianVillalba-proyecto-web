import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Meetup } from '../models/meetup.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class MeetupService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getMeetups(): Observable<Meetup[]> {
    return this.http.get<Meetup[]>(`${this.apiUrl}/meetups`);
  }

  getParticipants(id: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/meetups/${id}/participants`);
  }

  createMeetup(meetup: Partial<Meetup>): Observable<Meetup> {
    return this.http.post<Meetup>(`${this.apiUrl}/meetups`, meetup);
  }

  updateMeetup(id: number, meetup: Partial<Meetup>): Observable<Meetup> {
    return this.http.put<Meetup>(`${this.apiUrl}/meetups/${id}`, meetup);
  }

  deleteMeetup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/meetups/${id}`);
  }
}
