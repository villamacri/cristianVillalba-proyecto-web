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
  private readonly userStorageKey = 'auth_user';

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
      catchError(this.handleError)
    );
  }

  /**
   * Registra un nuevo usuario
   */
  register(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        this.setSession(response.token, response.user);
        
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
    localStorage.removeItem(this.userStorageKey);
    
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
        localStorage.setItem(this.userStorageKey, JSON.stringify(user));
      }),
      catchError((error: HttpErrorResponse) => {
        // Si falla (401, 403, etc), limpiar la sesión
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem(this.userStorageKey);
          this.currentUser.set(null);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Indica si el usuario autenticado tiene rol admin
   */
  isAdmin(): boolean {
    const signalUser = this.currentUser();

    if (signalUser) {
      return signalUser.role === 'admin';
    }

    const storedUser = this.getStoredUser();

    if (storedUser) {
      this.currentUser.set(storedUser);
    }

    return storedUser?.role === 'admin';
  }

  /**
   * Obtiene el token del localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Guarda token y usuario en sesion local cuando un admin inicia sesion.
   */
  startSession(token: string, user: User): void {
    this.setSession(token, user);
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem(this.userStorageKey, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getStoredUser(): User | null {
    const rawUser = localStorage.getItem(this.userStorageKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      localStorage.removeItem(this.userStorageKey);
      return null;
    }
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
        errorMessage = 'Correo o contraseña incorrectos';
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
