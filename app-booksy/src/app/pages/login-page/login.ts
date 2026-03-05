import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

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

        if (!response.user || response.user.role !== 'admin') {
          this.authService.logout();
          this.errorMessage = 'Acceso denegado: Este panel es solo para administradores.';
          this.isLoading = false;
          return;
        }

        this.authService.startSession(response.token, response.user);

        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en el login:', error);
        this.errorMessage = error.message || 'Ocurrió un error inesperado. Inténtalo más tarde.';
        this.isLoading = false;
      }
    });
  }
}
