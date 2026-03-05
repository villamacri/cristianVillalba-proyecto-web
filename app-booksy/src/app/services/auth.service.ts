import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

// Interfaz para la respuesta del login de Laravel Sanctum
interface LoginResponse {
  token: string;
  user: User;
}

// Interfaz para las credenciales de login
interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  // Signals para estado reactivo
  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => {
    return !!localStorage.getItem('token');
  });

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // Guardar el token en localStorage
        localStorage.setItem('token', response.token);
        
        // Actualizar el signal del usuario actual
        this.currentUser.set(response.user);
        
        // Redirigir al dashboard
        this.router.navigate(['/dashboard']);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Registra un nuevo usuario
   */
  register(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        // Guardar el token en localStorage
        localStorage.setItem('token', response.token);
        
        // Actualizar el signal del usuario actual
        this.currentUser.set(response.user);
        
        // Redirigir al dashboard
        this.router.navigate(['/dashboard']);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    // Opcionalmente, hacer una petición al backend para invalidar el token
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      complete: () => {
        this.clearSession();
      },
      error: () => {
        // Incluso si falla la petición, limpiar la sesión localmente
        this.clearSession();
      }
    });
  }

  /**
   * Limpia la sesión del usuario
   */
  private clearSession(): void {
    // Eliminar el token del localStorage
    localStorage.removeItem('token');
    
    // Limpiar el signal del usuario
    this.currentUser.set(null);
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  /**
   * Verifica el estado de autenticación al iniciar la app
   * Obtiene los datos del usuario actual desde el backend
   */
  checkAuthStatus(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user`).pipe(
      tap((user) => {
        // Actualizar el signal del usuario actual
        this.currentUser.set(user);
      }),
      catchError((error: HttpErrorResponse) => {
        // Si falla (401, 403, etc), limpiar la sesión
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.currentUser.set(null);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el token del localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Maneja los errores de las peticiones HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 401) {
        errorMessage = 'Credenciales inválidas';
      } else if (error.status === 422) {
        errorMessage = 'Datos de validación inválidos';
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('Error en AuthService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
