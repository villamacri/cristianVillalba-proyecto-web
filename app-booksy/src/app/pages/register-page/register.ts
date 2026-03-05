import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreateUserPayload, UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    last_name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    const formValue = this.registerForm.getRawValue();
    const payload: CreateUserPayload = {
      name: formValue.name.trim(),
      last_name: formValue.last_name.trim(),
      email: formValue.email.trim(),
    };

    const passwordValue = formValue.password.trim();

    // Si va vacia, no se envia y Laravel aplicara su valor por defecto.
    if (passwordValue.length > 0) {
      payload.password = passwordValue;
    }

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Usuario creado correctamente.';
        this.router.navigate(['/usuarios']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message ?? 'No se pudo crear el usuario.';
      },
    });
  }
}
