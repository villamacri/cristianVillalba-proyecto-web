import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MeetupRequest } from '../../models/meetup.model';
import { MeetupService } from '../../services/meetup.service';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.css',
})
export class EditEventComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private meetupService = inject(MeetupService);

  eventId: number | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';

  eventForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    date: ['', [Validators.required]],
    city: ['', [Validators.required]],
    max_capacity: [20, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');

    if (!idFromRoute) {
      this.errorMessage = 'No se recibio el ID del evento.';
      this.isLoading = false;
      return;
    }

    const parsedId = Number(idFromRoute);

    if (Number.isNaN(parsedId) || parsedId <= 0) {
      this.errorMessage = 'El ID del evento no es valido.';
      this.isLoading = false;
      return;
    }

    this.eventId = parsedId;

    this.meetupService.getMeetup(parsedId).subscribe({
      next: (meetup) => {
        const rawDate = meetup.date ?? meetup.meetup_date ?? '';
        const normalizedDate = rawDate ? rawDate.slice(0, 10) : '';

        this.eventForm.patchValue({
          title: meetup.title ?? meetup.name ?? '',
          description: meetup.description ?? '',
          date: normalizedDate,
          city: meetup.city ?? '',
          max_capacity: Number(meetup.max_capacity ?? 20),
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar evento:', err);
        this.errorMessage = 'No se pudo cargar la informacion del evento.';
        this.isLoading = false;
      },
    });
  }

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    if (this.eventForm.invalid || this.eventId === null) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.eventForm.getRawValue();
    const payload: MeetupRequest = {
      name: formValue.title,
      description: formValue.description,
      meetup_date: formValue.date,
      city: formValue.city,
      max_capacity: Number(formValue.max_capacity),
    };

    this.meetupService.updateMeetup(this.eventId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/eventos']);
      },
      error: (err) => {
        console.error('Error al guardar cambios del evento:', err);
        this.errorMessage = 'No se pudieron guardar los cambios del evento.';
        this.isSubmitting = false;
      },
    });
  }
}
