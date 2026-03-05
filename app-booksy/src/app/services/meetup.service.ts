import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Meetup, MeetupRequest, MeetupResponse } from '../models/meetup.model';
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

  getMeetup(id: number): Observable<MeetupResponse> {
    return this.http.get<MeetupResponse>(`${this.apiUrl}/meetups/${id}`);
  }

  getParticipants(id: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/meetups/${id}/participants`);
  }

  createMeetup(meetupData: MeetupRequest): Observable<MeetupResponse> {
    return this.http.post<MeetupResponse>(`${this.apiUrl}/meetups`, meetupData);
  }

  updateMeetup(
    id: number,
    meetupData: Partial<Meetup> & Partial<MeetupRequest>
  ): Observable<MeetupResponse> {
    return this.http.put<MeetupResponse>(`${this.apiUrl}/meetups/${id}`, meetupData);
  }

  deleteMeetup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/meetups/${id}`);
  }
}
