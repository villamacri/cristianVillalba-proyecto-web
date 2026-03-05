import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Recuperar el token del localStorage
  const token = localStorage.getItem('token');
  
  // Si existe el token, clonar la petición y añadir el header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Continuar con la petición y manejar errores
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 (no autorizado o token expirado)
      if (error.status === 401) {
        // Borrar el token del localStorage
        localStorage.removeItem('token');
        
        // Redirigir al login
        router.navigate(['/login']);
      }
      
      // Re-lanzar el error para que el componente también pueda manejarlo
      return throwError(() => error);
    })
  );
};
