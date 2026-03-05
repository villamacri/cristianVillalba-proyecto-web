import { Component, OnInit, inject } from '@angular/core';
import { Meetup } from '../../models/meetup.model';
import { MeetupService } from '../../services/meetup.service';

@Component({
  selector: 'app-eventos',
  imports: [],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css',
})
export class Eventos implements OnInit {
  private meetupService = inject(MeetupService);

  meetups: Meetup[] = [];
  participantsByMeetup: Partial<Record<number, number>> = {};
  errorMessage: string = '';

  ngOnInit(): void {
    this.meetupService.getMeetups().subscribe({
      next: (meetups) => {
        this.meetups = meetups;
        this.loadParticipants();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los eventos.';
      }
    });
  }

  get upcomingMeetups(): Meetup[] {
    return this.meetups
      .filter((meetup) => new Date(meetup.date).getTime() >= Date.now())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  get totalParticipants(): number {
    const counts = Object.values(this.participantsByMeetup).filter(
      (value): value is number => value !== undefined
    );

    return counts.reduce((total, current) => total + current, 0);
  }

  get inProgressMeetupsCount(): number {
    return this.meetups.filter((meetup) => this.isSameDay(meetup.date)).length;
  }

  private loadParticipants(): void {
    this.meetups.forEach((meetup) => {
      this.meetupService.getParticipants(meetup.id).subscribe({
        next: (users) => {
          this.participantsByMeetup[meetup.id] = users.length;
        },
        error: () => {
          this.participantsByMeetup[meetup.id] = 0;
        }
      });
    });
  }

  getEventStatus(meetup: Meetup): 'Próximo' | 'Finalizado' {
    return new Date(meetup.date).getTime() >= Date.now() ? 'Próximo' : 'Finalizado';
  }

  private isSameDay(dateValue: string): boolean {
    const today = new Date();
    const date = new Date(dateValue);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }
}
