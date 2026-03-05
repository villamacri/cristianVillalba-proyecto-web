import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MeetupRequest } from '../../models/meetup.model';
import { MeetupService } from '../../services/meetup.service';

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css',
})
export class AddEventComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private meetupService = inject(MeetupService);

  isSubmitting = false;
  errorMessage = '';

  eventForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    date: ['', [Validators.required]],
    city: ['', [Validators.required]],
    max_capacity: [20, [Validators.required, Validators.min(1)]],
  });

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    if (this.eventForm.invalid) {
      console.warn('❌ BLOQUEADO: El formulario es inválido.');
      console.warn('Valores detectados por Angular:', this.eventForm.value);
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

    this.meetupService.createMeetup(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/eventos']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'No se pudo crear el evento.';
        console.error('Error al crear evento:', err);
        console.error('Mensaje del backend:', err?.error?.message);
        console.error('Campos con error:', err?.error?.errors);
        console.error('Payload enviado:', payload);
      },
    });
  }
}
