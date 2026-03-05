import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  onLogin(): void {
    this.errorMessage = '';
    this.isLoading = true;

    const credentials = {
      email: this.email,
      password: this.password
    };

    console.log('Enviando datos a Laravel...', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        // El AuthService ya maneja el guardado del token y la redirección
      },
      error: (error) => {
        console.error('Error en el login:', error);
        this.errorMessage = error.message || 'Ocurrió un error inesperado. Inténtalo más tarde.';
        this.isLoading = false;
      }
    });
  }
}
